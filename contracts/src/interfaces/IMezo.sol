// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// @notice The parts of Mezo's veBTC (VotingEscrow) that Flywheel uses.
interface IVeBTC {
    function ownerOf(uint256 tokenId) external view returns (address);
    function isApprovedOrOwner(address spender, uint256 tokenId) external view returns (bool);
    function votingPowerOfNFT(uint256 tokenId) external view returns (uint256);
    function unboostedVotingPowerOfNFT(uint256 tokenId) external view returns (uint256);
    function voter() external view returns (address);
    function booster() external view returns (address);
}

/// @notice Mezo Earn pools voter (Solidly style) for veBTC.
interface IPoolsVoter {
    function vote(uint256 tokenId, address[] calldata pools, uint256[] calldata weights) external;
    function reset(uint256 tokenId) external;
    function poke(uint256 tokenId) external;
    function claimBribes(address[] memory bribes, address[][] memory tokens, uint256 tokenId) external;
    function claimFees(address[] memory fees, address[][] memory tokens, uint256 tokenId) external;
    function gauges(address pool) external view returns (address);
    function isAlive(address gauge) external view returns (bool);
    function gaugeToBribe(address gauge) external view returns (address);
    function gaugeToFees(address gauge) external view returns (address);
    function lastVoted(uint256 tokenId) external view returns (uint256);
    function ve() external view returns (address);
}

/// @notice Mezo Earn BoostVoter: veMEZO votes on per-veBTC boost gauges.
interface IBoostVoter {
    function boostableTokenIdToGauge(uint256 tokenId) external view returns (address);
    function createBoostGauge(address gaugeFactory, uint256 tokenId, address[] memory tokens, uint256[] memory amounts)
        external
        returns (address);
    function addBribes(address gauge, address[] memory tokens, uint256[] memory amounts) external;
    function getBoost(uint256 tokenId) external view returns (uint256);
    function pokeBoost(uint256 tokenId) external;
    function boostableVe() external view returns (address);
    function isWhitelistedToken(address token) external view returns (bool);
}

/// @notice Mezo MUSD Savings Rate vault (sMUSD). Deposits mint sMUSD 1:1 to the caller.
interface IMUSDSavingsRate {
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function musdToken() external view returns (address);
}
