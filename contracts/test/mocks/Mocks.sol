// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockERC20 is ERC20 {
    constructor(string memory n, string memory s) ERC20(n, s) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract MockVeBTC {
    mapping(uint256 => address) public ownerOf;
    mapping(uint256 => address) public getApproved;
    mapping(address => mapping(address => bool)) public isApprovedForAll;
    mapping(uint256 => uint256) public votingPowerOfNFT;

    function mint(address to, uint256 id, uint256 power) external {
        ownerOf[id] = to;
        votingPowerOfNFT[id] = power;
    }

    function approve(address spender, uint256 id) external {
        require(msg.sender == ownerOf[id], "not owner");
        getApproved[id] = spender;
    }

    function setApprovalForAll(address op, bool ok) external {
        isApprovedForAll[msg.sender][op] = ok;
    }

    function transferFrom(address from, address to, uint256 id) external {
        require(ownerOf[id] == from && msg.sender == from, "bad transfer");
        ownerOf[id] = to;
        getApproved[id] = address(0);
    }

    function isApprovedOrOwner(address spender, uint256 id) external view returns (bool) {
        address o = ownerOf[id];
        return spender == o || getApproved[id] == spender || isApprovedForAll[o][spender];
    }

    function unboostedVotingPowerOfNFT(uint256 id) external view returns (uint256) {
        return votingPowerOfNFT[id];
    }

    function voter() external pure returns (address) {
        return address(0);
    }

    function booster() external pure returns (address) {
        return address(0);
    }
}

contract MockPoolsVoter {
    MockVeBTC public immutable ve;
    mapping(address => address) public gauges;
    mapping(address => bool) public isAlive;
    mapping(uint256 => mapping(address => uint256)) public votes;
    mapping(uint256 => uint256) public lastVoted;
    uint256 public bribeClaims;
    uint256 public feeClaims;

    constructor(MockVeBTC _ve) {
        ve = _ve;
    }

    function addPool(address pool, address gauge, bool alive) external {
        gauges[pool] = gauge;
        isAlive[gauge] = alive;
    }

    function vote(uint256 tokenId, address[] calldata pools, uint256[] calldata weights) external {
        require(ve.isApprovedOrOwner(msg.sender, tokenId), "NotApprovedOrOwner");
        for (uint256 i; i < pools.length; ++i) {
            votes[tokenId][pools[i]] = weights[i];
        }
        lastVoted[tokenId] = block.timestamp;
    }

    function claimBribes(address[] memory, address[][] memory, uint256 tokenId) external {
        require(ve.isApprovedOrOwner(msg.sender, tokenId), "NotApprovedOrOwner");
        bribeClaims++;
    }

    function claimFees(address[] memory, address[][] memory, uint256 tokenId) external {
        require(ve.isApprovedOrOwner(msg.sender, tokenId), "NotApprovedOrOwner");
        feeClaims++;
    }
}

contract MockBoostVoter {
    MockVeBTC public immutable ve;
    mapping(uint256 => address) public boostableTokenIdToGauge;
    mapping(address => mapping(address => uint256)) public bribes; // gauge => token => amount
    uint256 internal nonce;

    constructor(MockVeBTC _ve) {
        ve = _ve;
    }

    function createBoostGauge(address, uint256 tokenId, address[] memory, uint256[] memory)
        external
        returns (address g)
    {
        require(ve.isApprovedOrOwner(msg.sender, tokenId), "NotApprovedOrOwner");
        require(boostableTokenIdToGauge[tokenId] == address(0), "exists");
        g = address(uint160(uint256(keccak256(abi.encode(tokenId, ++nonce)))));
        boostableTokenIdToGauge[tokenId] = g;
    }

    function addBribes(address gauge, address[] memory tokens, uint256[] memory amounts) external {
        for (uint256 i; i < tokens.length; ++i) {
            IERC20(tokens[i]).transferFrom(msg.sender, address(this), amounts[i]);
            bribes[gauge][tokens[i]] += amounts[i];
        }
    }

    function getBoost(uint256) external pure returns (uint256) {
        return 1e18;
    }
}

contract MockSavings is ERC20 {
    IERC20 public immutable musdToken;

    constructor(IERC20 _musd) ERC20("Savings MUSD", "sMUSD") {
        musdToken = _musd;
    }

    function deposit(uint256 amount) external {
        musdToken.transferFrom(msg.sender, address(this), amount);
        _mint(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        _burn(msg.sender, amount);
        musdToken.transfer(msg.sender, amount);
    }
}
