// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {FlywheelPilot} from "../../src/FlywheelPilot.sol";
import {IVeBTC, IPoolsVoter, IBoostVoter, IMUSDSavingsRate} from "../../src/interfaces/IMezo.sol";
import {MezoTestnet} from "../../script/MezoAddresses.sol";

interface IVeExtra {
    function tokenId() external view returns (uint256);
    function approve(address, uint256) external;
    function locked(uint256) external view returns (int128 amount, uint256 end, bool isPermanent);
}

interface IVotes {
    function votes(uint256 tokenId, address pool) external view returns (uint256);
}

/// Runs Flywheel against Mezo's real testnet contracts (chain 31611): the live veBTC, the pools
/// voter it reports through `voter()`, BoostVoter and the MUSD Savings Vault.
/// Run with: forge test --match-path "test/fork/*" -vv
contract MezoTestnetForkTest is Test {
    FlywheelPilot pilot;
    IVeBTC ve = IVeBTC(MezoTestnet.VE_BTC);
    IPoolsVoter voter = IPoolsVoter(MezoTestnet.POOLS_VOTER);
    IBoostVoter boost = IBoostVoter(MezoTestnet.BOOST_VOTER);
    IERC20 musd = IERC20(MezoTestnet.MUSD);
    IERC20 sMusd = IERC20(MezoTestnet.SMUSD);

    address keeper = makeAddr("keeper");
    address treasury = makeAddr("treasury");
    uint256 id;
    address holder;

    function setUp() public {
        vm.createSelectFork("mezo_testnet");
        assertEq(ve.voter(), MezoTestnet.POOLS_VOTER, "veBTC voter moved");
        assertEq(ve.booster(), MezoTestnet.BOOST_VOTER, "veBTC booster moved");
        pilot = new FlywheelPilot(
            ve,
            voter,
            boost,
            IMUSDSavingsRate(MezoTestnet.SMUSD),
            musd,
            MezoTestnet.BOOST_GAUGE_FACTORY,
            keeper,
            treasury,
            500
        );
        (id, holder) = _findVoteReadyNft();
        console2.log("using veBTC", id, "held by", holder);
    }

    /// Newest veBTC that an EOA holds, has voting power, is still locked and has not voted this epoch.
    function _findVoteReadyNft() internal view returns (uint256, address) {
        uint256 next = IVeExtra(address(ve)).tokenId();
        uint256 epoch = block.timestamp - (block.timestamp % 7 days);
        for (uint256 i = next; i > 0 && i + 120 > next; --i) {
            try ve.ownerOf(i) returns (address o) {
                if (o == address(0) || o.code.length != 0) continue;
                if (ve.votingPowerOfNFT(i) == 0) continue;
                if (voter.lastVoted(i) >= epoch) continue;
                (int128 amt, uint256 end, bool perm) = IVeExtra(address(ve)).locked(i);
                if (amt <= 0 || (!perm && end <= block.timestamp + 7 days)) continue;
                return (i, o);
            } catch {}
        }
        revert("no vote-ready veBTC found");
    }

    function _policy() internal pure returns (FlywheelPilot.Policy memory) {
        return FlywheelPilot.Policy({
            maxPoolShareBps: 6_000,
            boostShareBps: 5_000,
            minPools: 2,
            autoSave: true,
            epochPullCap: 1_000e18
        });
    }

    function test_fork_brainVotesThroughRealVoter() public {
        vm.startPrank(holder);
        IVeExtra(address(ve)).approve(address(pilot), id);
        pilot.enroll(id, _policy());
        vm.stopPrank();

        address[] memory pools = new address[](3);
        uint256[] memory weights = new uint256[](3);
        pools[0] = MezoTestnet.POOL_MUSD_BTC;
        pools[1] = MezoTestnet.SMUSD; // the MUSD savings gauge is voted through its vault address
        pools[2] = MezoTestnet.POOL_MUSD_MUSDC;
        weights[0] = 5_000;
        weights[1] = 3_000;
        weights[2] = 2_000;

        vm.prank(keeper);
        pilot.vote(id, pools, weights, keccak256("fork-plan"));

        uint256 v0 = IVotes(address(voter)).votes(id, pools[0]);
        uint256 v1 = IVotes(address(voter)).votes(id, pools[1]);
        uint256 v2 = IVotes(address(voter)).votes(id, pools[2]);
        assertGt(v0, 0);
        assertGt(v1, 0);
        assertGt(v2, 0);
        // the real voter splits the NFT's power in the brain's 50/30/20 ratio
        assertApproxEqRel(v0 * 3, v1 * 5, 1e15);
        assertEq(voter.lastVoted(id), block.timestamp);
        console2.log("votes on MUSD/BTC, sMUSD, MUSD/mUSDC:", v0, v1, v2);
    }

    function test_fork_policyStillBindsOnRealVoter() public {
        vm.startPrank(holder);
        IVeExtra(address(ve)).approve(address(pilot), id);
        pilot.enroll(id, _policy());
        vm.stopPrank();
        address[] memory pools = new address[](2);
        uint256[] memory weights = new uint256[](2);
        pools[0] = MezoTestnet.POOL_MUSD_BTC;
        pools[1] = MezoTestnet.SMUSD;
        weights[0] = 9;
        weights[1] = 1;
        vm.prank(keeper);
        vm.expectRevert(abi.encodeWithSelector(FlywheelPilot.PoolShareTooHigh.selector, pools[0]));
        pilot.vote(id, pools, weights, bytes32(0));
    }

    function test_fork_compoundIntoRealBoostGaugeAndSavingsVault() public {
        vm.startPrank(holder);
        IVeExtra(address(ve)).approve(address(pilot), id);
        pilot.enroll(id, _policy());
        vm.stopPrank();

        // give the holder 100 MUSD from the MUSD/BTC pool's reserves
        vm.prank(MezoTestnet.POOL_MUSD_BTC);
        musd.transfer(holder, 100e18);
        vm.prank(holder);
        musd.approve(address(pilot), 100e18);

        uint256 sBefore = sMusd.balanceOf(holder);
        vm.prank(keeper);
        pilot.compound(id, 100e18, 4_000, keccak256("fork-compound"));

        address gauge = boost.boostableTokenIdToGauge(id);
        assertTrue(gauge != address(0), "boost gauge");
        assertEq(musd.balanceOf(treasury), 5e18, "fee");
        assertEq(sMusd.balanceOf(holder) - sBefore, 57e18, "sMUSD to owner");
        assertEq(musd.balanceOf(address(pilot)), 0);
        assertEq(sMusd.balanceOf(address(pilot)), 0);
        console2.log("boost gauge", gauge);
    }
}
