import { parseAbi } from "viem";

export const voterAbi = parseAbi([
  "function length() view returns (uint256)",
  "function pools(uint256) view returns (address)",
  "function gauges(address) view returns (address)",
  "function isAlive(address) view returns (bool)",
  "function gaugeToBribe(address) view returns (address)",
  "function gaugeToFees(address) view returns (address)",
  "function weights(address) view returns (uint256)",
  "function totalWeight() view returns (uint256)",
  "function votes(uint256 tokenId, address pool) view returns (uint256)",
  "function lastVoted(uint256) view returns (uint256)",
  "function poke(uint256 tokenId)",
]);

export const rewardAbi = parseAbi([
  "function rewardsListLength() view returns (uint256)",
  "function rewards(uint256) view returns (address)",
  "function tokenRewardsPerEpoch(address token, uint256 epochStart) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function earned(address token, uint256 tokenId) view returns (uint256)",
]);

export const veAbi = parseAbi([
  "function ownerOf(uint256) view returns (address)",
  "function balanceOf(address) view returns (uint256)",
  "function ownerToNFTokenIdList(address owner, uint256 index) view returns (uint256)",
  "function votingPowerOfNFT(uint256) view returns (uint256)",
  "function unboostedVotingPowerOfNFT(uint256) view returns (uint256)",
  "function totalVotingPower() view returns (uint256)",
  "function unboostedTotalVotingPower() view returns (uint256)",
  "function locked(uint256) view returns (int128 amount, uint256 end, bool isPermanent, uint256 boost)",
  "function getApproved(uint256) view returns (address)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function isApprovedOrOwner(address spender, uint256 tokenId) view returns (bool)",
  "function approve(address to, uint256 tokenId)",
  "function createLock(uint256 value, uint256 lockDuration) returns (uint256)",
  "function tokenId() view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
]);

export const boostVoterAbi = parseAbi([
  "function length() view returns (uint256)",
  "function gauges(uint256) view returns (address)",
  "function weights(address) view returns (uint256)",
  "function gaugeToBribe(address) view returns (address)",
  "function boostableTokenIdToGauge(uint256) view returns (address)",
  "function getBoost(uint256) view returns (uint256)",
  "function totalWeight() view returns (uint256)",
  "function pokeBoost(uint256 tokenId)",
]);

export const erc20Abi = parseAbi([
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function totalSupply() view returns (uint256)",
]);

export const poolAbi = parseAbi([
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function getReserves() view returns (uint256 reserve0, uint256 reserve1, uint256 blockTimestampLast)",
  "function stable() view returns (bool)",
  "function symbol() view returns (string)",
]);
