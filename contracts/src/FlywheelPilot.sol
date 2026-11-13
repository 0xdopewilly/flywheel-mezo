// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable, Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {IVeBTC, IPoolsVoter, IBoostVoter, IMUSDSavingsRate} from "./interfaces/IMezo.sol";

/// @title FlywheelPilot
/// @notice Non-custodial autopilot for Mezo veBTC.
///
/// A veBTC owner approves this contract on their NFT and enrolls it with a policy. Each epoch
/// the Flywheel brain (an off-chain keeper) proposes a plan, and this contract executes it only
/// if it fits the owner's policy:
///
///  1. vote     - spread the veBTC's weight across Mezo Earn pool gauges (PoolsVoter)
///  2. harvest  - claim the fees and incentives those votes earned (paid by Mezo to the NFT owner)
///  3. compound - pull a capped amount of the owner's MUSD and split it between
///                (a) incentives on the owner's own veBTC boost gauge, which attract veMEZO votes
///                    and raise the veBTC's voting power up to 5x, and
///                (b) the MUSD Savings Vault, with the sMUSD receipt sent straight to the owner.
///
/// The NFT never leaves the owner's wallet. Rewards are paid by Mezo directly to the owner. The
/// keeper can only move the owner's MUSD toward the owner (their sMUSD, their own boost gauge),
/// within a per-epoch cap, minus a protocol fee that has a hard ceiling. Every vote and every
/// compound carries the hash of the brain's published plan so anyone can check that what ran
/// on-chain is what the brain explained.
contract FlywheelPilot is ReentrancyGuard, Ownable2Step {
    using SafeERC20 for IERC20;

    uint256 public constant BPS = 10_000;
    /// @notice Hard ceiling on the protocol fee: 10% of what the pilot compounds.
    uint256 public constant MAX_FEE_BPS = 1_000;
    uint256 internal constant WEEK = 7 days;

    struct Policy {
        /// Largest share of the veBTC's weight any single pool may receive (1..10000).
        uint16 maxPoolShareBps;
        /// Largest share of each compound (after fee) that may become boost incentives (0..10000).
        uint16 boostShareBps;
        /// Smallest number of pools a plan must spread across (0 = no floor).
        uint8 minPools;
        /// Whether compound may deposit into the MUSD Savings Vault.
        bool autoSave;
        /// Most MUSD the pilot may pull from the owner in one epoch.
        uint128 epochPullCap;
    }

    struct Enrollment {
        address owner;
        uint64 enrolledAt;
        bool active;
        Policy policy;
    }

    IVeBTC public immutable veBTC;
    IPoolsVoter public immutable poolsVoter;
    IBoostVoter public immutable boostVoter;
    IMUSDSavingsRate public immutable savings;
    IERC20 public immutable musd;
    address public immutable boostGaugeFactory;

    address public keeper;
    address public treasury;
    uint16 public feeBps;

    mapping(uint256 tokenId => Enrollment) internal _enrollments;
    mapping(uint256 tokenId => mapping(address pool => bool)) public poolBlocked;
    mapping(uint256 tokenId => mapping(uint256 epoch => uint256)) public pulledInEpoch;
    mapping(uint256 tokenId => bytes32) public lastPlanHash;
    uint256[] internal _ids;
    mapping(uint256 tokenId => bool) internal _listed;

    event Enrolled(uint256 indexed tokenId, address indexed owner, Policy policy);
    event PolicyUpdated(uint256 indexed tokenId, Policy policy);
    event Exited(uint256 indexed tokenId, address indexed owner);
    event PoolBlockSet(uint256 indexed tokenId, address indexed pool, bool blocked);
    event PlanVoted(
        uint256 indexed tokenId, uint256 indexed epoch, bytes32 indexed planHash, address[] pools, uint256[] weights
    );
    event Harvested(uint256 indexed tokenId, address indexed owner, uint256 bribeContracts, uint256 feeContracts);
    event Compounded(
        uint256 indexed tokenId,
        uint256 indexed epoch,
        bytes32 indexed planHash,
        address owner,
        uint256 pulled,
        uint256 fee,
        uint256 saved,
        uint256 boosted,
        address boostGauge
    );
    event KeeperSet(address keeper);
    event TreasurySet(address treasury);
    event FeeSet(uint16 feeBps);

    error NotKeeper();
    error NotNftOwner();
    error NotEnrolled();
    error NotApproved();
    error OwnerChanged();
    error BadPolicy();
    error BadPlan();
    error PoolNotAllowed(address pool);
    error PoolShareTooHigh(address pool);
    error TooFewPools();
    error OverEpochCap();
    error BoostShareTooHigh();
    error SavingDisabled();
    error ZeroAddress();
    error FeeTooHigh();

    modifier onlyKeeper() {
        if (msg.sender != keeper) revert NotKeeper();
        _;
    }

    constructor(
        IVeBTC _veBTC,
        IPoolsVoter _poolsVoter,
        IBoostVoter _boostVoter,
        IMUSDSavingsRate _savings,
        IERC20 _musd,
        address _boostGaugeFactory,
        address _keeper,
        address _treasury,
        uint16 _feeBps
    ) Ownable(msg.sender) {
        if (
            address(_veBTC) == address(0) || address(_poolsVoter) == address(0) || address(_boostVoter) == address(0)
                || address(_savings) == address(0) || address(_musd) == address(0) || _boostGaugeFactory == address(0)
                || _keeper == address(0) || _treasury == address(0)
        ) revert ZeroAddress();
        if (_feeBps > MAX_FEE_BPS) revert FeeTooHigh();
        veBTC = _veBTC;
        poolsVoter = _poolsVoter;
        boostVoter = _boostVoter;
        savings = _savings;
        musd = _musd;
        boostGaugeFactory = _boostGaugeFactory;
        keeper = _keeper;
        treasury = _treasury;
        feeBps = _feeBps;
    }

    // ------------------------------------------------------------------
    // Owner side: enroll, tune, leave
    // ------------------------------------------------------------------

    /// @notice Hand the brain the controls for `tokenId`, within `policy`.
    /// @dev The caller must own the veBTC and must already have approved this contract on it
    ///      (`approve(pilot, tokenId)` or `setApprovalForAll(pilot, true)`).
    function enroll(uint256 tokenId, Policy calldata policy) external {
        if (veBTC.ownerOf(tokenId) != msg.sender) revert NotNftOwner();
        if (!veBTC.isApprovedOrOwner(address(this), tokenId)) revert NotApproved();
        _validatePolicy(policy);
        _enrollments[tokenId] =
            Enrollment({owner: msg.sender, enrolledAt: uint64(block.timestamp), active: true, policy: policy});
        if (!_listed[tokenId]) {
            _listed[tokenId] = true;
            _ids.push(tokenId);
        }
        emit Enrolled(tokenId, msg.sender, policy);
    }

    function updatePolicy(uint256 tokenId, Policy calldata policy) external {
        Enrollment storage e = _ownedEnrollment(tokenId);
        _validatePolicy(policy);
        e.policy = policy;
        emit PolicyUpdated(tokenId, policy);
    }

    /// @notice Keep the brain away from particular pools, whatever their yield.
    function setPoolBlocked(uint256 tokenId, address[] calldata pools, bool blocked) external {
        _ownedEnrollment(tokenId);
        for (uint256 i; i < pools.length; ++i) {
            poolBlocked[tokenId][pools[i]] = blocked;
            emit PoolBlockSet(tokenId, pools[i], blocked);
        }
    }

    /// @notice Stop the autopilot. Revoking the NFT approval afterwards is recommended, and also works on its own.
    function exit(uint256 tokenId) external {
        Enrollment storage e = _ownedEnrollment(tokenId);
        e.active = false;
        emit Exited(tokenId, msg.sender);
    }

    // ------------------------------------------------------------------
    // Brain side: vote, harvest, compound
    // ------------------------------------------------------------------

    /// @notice Cast the brain's vote for this epoch, if it fits the owner's policy.
    /// @param planHash keccak256 of the brain's published plan (allocation plus reasoning).
    function vote(uint256 tokenId, address[] calldata pools, uint256[] calldata weights, bytes32 planHash)
        external
        onlyKeeper
        nonReentrant
    {
        Enrollment storage e = _liveEnrollment(tokenId);
        Policy memory p = e.policy;
        uint256 n = pools.length;
        if (n == 0 || n != weights.length) revert BadPlan();
        if (n < p.minPools) revert TooFewPools();

        uint256 total;
        for (uint256 i; i < n; ++i) {
            if (weights[i] == 0) revert BadPlan();
            total += weights[i];
        }
        for (uint256 i; i < n; ++i) {
            address pool = pools[i];
            if (poolBlocked[tokenId][pool]) revert PoolNotAllowed(pool);
            address gauge = poolsVoter.gauges(pool);
            if (gauge == address(0) || !poolsVoter.isAlive(gauge)) revert PoolNotAllowed(pool);
            if (weights[i] * BPS > uint256(p.maxPoolShareBps) * total) revert PoolShareTooHigh(pool);
        }

        poolsVoter.vote(tokenId, pools, weights);
        lastPlanHash[tokenId] = planHash;
        emit PlanVoted(tokenId, _epochStart(block.timestamp), planHash, pools, weights);
    }

    /// @notice Claim the fees and incentives the veBTC has earned. Mezo pays them to the NFT owner.
    /// @dev Callable by the keeper or by the NFT owner (handy as a manual "claim everything").
    function harvest(
        uint256 tokenId,
        address[] calldata bribes,
        address[][] calldata bribeTokens,
        address[] calldata fees,
        address[][] calldata feeTokens
    ) external nonReentrant {
        Enrollment storage e = _liveEnrollment(tokenId);
        if (msg.sender != keeper && msg.sender != e.owner) revert NotKeeper();
        if (bribes.length != 0) poolsVoter.claimBribes(bribes, bribeTokens, tokenId);
        if (fees.length != 0) poolsVoter.claimFees(fees, feeTokens, tokenId);
        emit Harvested(tokenId, e.owner, bribes.length, fees.length);
    }

    /// @notice Turn MUSD the owner earned back into yield: part as boost incentives on the
    ///         owner's own veBTC boost gauge, the rest into the MUSD Savings Vault for the owner.
    /// @param amount MUSD to pull from the owner (needs the owner's MUSD allowance for this contract).
    /// @param boostBps Share of `amount` after the fee that becomes boost incentives.
    function compound(uint256 tokenId, uint256 amount, uint16 boostBps, bytes32 planHash)
        external
        onlyKeeper
        nonReentrant
    {
        Enrollment storage e = _liveEnrollment(tokenId);
        _useCompoundAllowance(tokenId, e.policy, amount, boostBps);

        address owner_ = e.owner;
        musd.safeTransferFrom(owner_, address(this), amount);

        uint256 fee = (amount * feeBps) / BPS;
        uint256 boosted = ((amount - fee) * boostBps) / BPS;
        uint256 saved = amount - fee - boosted;

        if (fee != 0) musd.safeTransfer(treasury, fee);
        address gauge = boosted != 0 ? _addBoostIncentives(tokenId, boosted) : address(0);
        if (saved != 0) _depositSavingsFor(owner_, saved);

        lastPlanHash[tokenId] = planHash;
        emit Compounded(tokenId, _epochStart(block.timestamp), planHash, owner_, amount, fee, saved, boosted, gauge);
    }

    // ------------------------------------------------------------------
    // Admin
    // ------------------------------------------------------------------

    function setKeeper(address _keeper) external onlyOwner {
        if (_keeper == address(0)) revert ZeroAddress();
        keeper = _keeper;
        emit KeeperSet(_keeper);
    }

    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert ZeroAddress();
        treasury = _treasury;
        emit TreasurySet(_treasury);
    }

    function setFee(uint16 _feeBps) external onlyOwner {
        if (_feeBps > MAX_FEE_BPS) revert FeeTooHigh();
        feeBps = _feeBps;
        emit FeeSet(_feeBps);
    }

    // ------------------------------------------------------------------
    // Views
    // ------------------------------------------------------------------

    function enrollment(uint256 tokenId) external view returns (Enrollment memory) {
        return _enrollments[tokenId];
    }

    function enrolledIds() external view returns (uint256[] memory) {
        return _ids;
    }

    /// @notice True when the brain can act on `tokenId` right now.
    function isLive(uint256 tokenId) public view returns (bool) {
        Enrollment storage e = _enrollments[tokenId];
        if (!e.active) return false;
        try veBTC.ownerOf(tokenId) returns (address o) {
            if (o != e.owner) return false;
        } catch {
            return false;
        }
        return veBTC.isApprovedOrOwner(address(this), tokenId);
    }

    function remainingPull(uint256 tokenId) external view returns (uint256) {
        uint256 cap = _enrollments[tokenId].policy.epochPullCap;
        uint256 used = pulledInEpoch[tokenId][_epochStart(block.timestamp)];
        return used >= cap ? 0 : cap - used;
    }

    function epochStart() external view returns (uint256) {
        return _epochStart(block.timestamp);
    }

    // ------------------------------------------------------------------
    // Internal
    // ------------------------------------------------------------------

    /// @dev Checks a compound against the owner's policy and books it against this epoch's pull cap.
    function _useCompoundAllowance(uint256 tokenId, Policy storage p, uint256 amount, uint16 boostBps) internal {
        if (amount == 0) revert BadPlan();
        if (boostBps > p.boostShareBps) revert BoostShareTooHigh();
        if (!p.autoSave && boostBps != BPS) revert SavingDisabled();
        uint256 epoch = _epochStart(block.timestamp);
        uint256 pulled = pulledInEpoch[tokenId][epoch] + amount;
        if (pulled > p.epochPullCap) revert OverEpochCap();
        pulledInEpoch[tokenId][epoch] = pulled;
    }

    /// @dev Posts `amount` MUSD as incentives on the veBTC's own boost gauge, creating the gauge if needed.
    function _addBoostIncentives(uint256 tokenId, uint256 amount) internal returns (address gauge) {
        gauge = boostVoter.boostableTokenIdToGauge(tokenId);
        if (gauge == address(0)) {
            gauge = boostVoter.createBoostGauge(boostGaugeFactory, tokenId, new address[](0), new uint256[](0));
        }
        address[] memory tokens = new address[](1);
        uint256[] memory amounts = new uint256[](1);
        tokens[0] = address(musd);
        amounts[0] = amount;
        musd.forceApprove(address(boostVoter), amount);
        boostVoter.addBribes(gauge, tokens, amounts);
        musd.forceApprove(address(boostVoter), 0);
    }

    /// @dev Deposits `amount` MUSD into the savings vault and forwards the sMUSD receipt to `to`.
    function _depositSavingsFor(address to, uint256 amount) internal {
        IERC20 sMusd = IERC20(address(savings));
        uint256 before = sMusd.balanceOf(address(this));
        musd.forceApprove(address(savings), amount);
        savings.deposit(amount);
        musd.forceApprove(address(savings), 0);
        sMusd.safeTransfer(to, sMusd.balanceOf(address(this)) - before);
    }

    function _ownedEnrollment(uint256 tokenId) internal view returns (Enrollment storage e) {
        e = _enrollments[tokenId];
        if (e.owner == address(0)) revert NotEnrolled();
        if (veBTC.ownerOf(tokenId) != msg.sender || e.owner != msg.sender) revert NotNftOwner();
    }

    function _liveEnrollment(uint256 tokenId) internal view returns (Enrollment storage e) {
        e = _enrollments[tokenId];
        if (!e.active) revert NotEnrolled();
        if (veBTC.ownerOf(tokenId) != e.owner) revert OwnerChanged();
        if (!veBTC.isApprovedOrOwner(address(this), tokenId)) revert NotApproved();
    }

    function _validatePolicy(Policy calldata p) internal pure {
        if (p.maxPoolShareBps == 0 || p.maxPoolShareBps > BPS) revert BadPolicy();
        if (p.boostShareBps > BPS) revert BadPolicy();
        // Mezo caps a vote at 30 pools, so a per-pool cap below 1/30 could never add up to 100%.
        if (p.minPools > 30 || uint256(p.maxPoolShareBps) * 30 < BPS) revert BadPolicy();
    }

    function _epochStart(uint256 t) internal pure returns (uint256) {
        return t - (t % WEEK);
    }
}
