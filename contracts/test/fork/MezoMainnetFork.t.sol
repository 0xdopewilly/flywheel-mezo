// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {FlywheelPilot} from "../../src/FlywheelPilot.sol";
import {IVeBTC, IPoolsVoter, IBoostVoter, IMUSDSavingsRate} from "../../src/interfaces/IMezo.sol";

interface IVeApprove {
    function approve(address, uint256) external;
}

interface IRewardView {
    function earned(address token, uint256 tokenId) external view returns (uint256);
}

interface IVotesView {
    function votes(uint256 tokenId, address pool) external view returns (uint256);
}

/// Mezo MAINNET (chain 31612), forked one block before a real holder claimed. veBTC #5803's owner
/// called claimFeesAndBribes on the MUSD Savings gauge's fee reward in block 13,202,860
/// (tx 0x0376d2b7...) and then voted 100% to sMUSD in block 13,202,931 (tx 0xce35bf3e...).
/// At block 13,202,859 the rewards were provably unclaimed, so Flywheel can harvest them instead.
contract MezoMainnetForkTest is Test {
    address constant VE_BTC = 0x3D4b1b884A7a1E59fE8589a3296EC8f8cBB6f279;
    address constant POOLS_VOTER = 0x48233cCC97B87Ba93bCA212cbEe48e3210211f03;
    address constant BOOST_VOTER = 0x2Ba614a598Cffa5a19d683cDCA97bac3a49313d1;
    address constant BOOST_GAUGE_FACTORY = 0x2c015840D034fE74BEA8C62Dd00A11e3aa338aD5; // unused here
    address constant MUSD = 0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186;
    address constant SMUSD = 0xb4D498029af77680cD1eF828b967f010d06C51CC;
    address constant SMUSD_FEES_REWARD = 0x33b8B1162F0b86d68CAd418D96246Ee2c5164a01;
    address constant POOL_TOP = 0xCC372B7E15535aB225fe17c1075831D38ef7aC1a;
    uint256 constant ID = 5803;
    address constant HOLDER = 0x8B95aB83D350b6BA7e352cDD77FBF8b8f30f8d57;

    FlywheelPilot pilot;
    address keeper = makeAddr("keeper");

    function setUp() public {
        vm.createSelectFork("mezo_mainnet", 13_202_859);
        assertEq(IVeBTC(VE_BTC).voter(), POOLS_VOTER);
        assertEq(IVeBTC(VE_BTC).ownerOf(ID), HOLDER);
        pilot = new FlywheelPilot(
            IVeBTC(VE_BTC),
            IPoolsVoter(POOLS_VOTER),
            IBoostVoter(BOOST_VOTER),
            IMUSDSavingsRate(SMUSD),
            IERC20(MUSD),
            BOOST_GAUGE_FACTORY,
            keeper,
            makeAddr("treasury"),
            500
        );
        vm.startPrank(HOLDER);
        IVeApprove(VE_BTC).approve(address(pilot), ID);
        pilot.enroll(
            ID,
            FlywheelPilot.Policy({
                maxPoolShareBps: 7_000,
                boostShareBps: 3_000,
                minPools: 2,
                autoSave: true,
                epochPullCap: 100e18
            })
        );
        vm.stopPrank();
    }

    function test_mainnet_harvestPaysRealRewardsToOwner() public {
        uint256 owed = IRewardView(SMUSD_FEES_REWARD).earned(MUSD, ID);
        assertGt(owed, 0, "nothing owed at this block");
        uint256 before = IERC20(MUSD).balanceOf(HOLDER);

        address[] memory fees = new address[](1);
        fees[0] = SMUSD_FEES_REWARD;
        address[][] memory feeTokens = new address[][](1);
        feeTokens[0] = new address[](1);
        feeTokens[0][0] = MUSD;
        vm.prank(keeper);
        pilot.harvest(ID, new address[](0), new address[][](0), fees, feeTokens);

        assertEq(IERC20(MUSD).balanceOf(HOLDER) - before, owed, "owner got exactly what Mezo owed");
        assertEq(IERC20(MUSD).balanceOf(address(pilot)), 0, "pilot kept nothing");
        assertEq(IRewardView(SMUSD_FEES_REWARD).earned(MUSD, ID), 0);
        console2.log("MUSD harvested to the owner (wei):", owed);
    }

    function test_mainnet_brainVoteRespectsCap() public {
        address[] memory pools = new address[](2);
        uint256[] memory weights = new uint256[](2);
        pools[0] = SMUSD;
        pools[1] = POOL_TOP;
        weights[0] = 7_000;
        weights[1] = 3_000;
        vm.prank(keeper);
        pilot.vote(ID, pools, weights, bytes('{"why":"mainnet fork"}'));
        uint256 a = IVotesView(POOLS_VOTER).votes(ID, SMUSD);
        uint256 b = IVotesView(POOLS_VOTER).votes(ID, POOL_TOP);
        assertGt(a, 0);
        assertApproxEqRel(a * 3, b * 7, 1e15);
        console2.log("mainnet votes sMUSD / top pool:", a, b);

        // the owner's real all-in vote would breach this policy's 70% cap
        weights[0] = 10_000;
        weights[1] = 1;
        vm.warp(block.timestamp + 7 days);
        vm.prank(keeper);
        vm.expectRevert(abi.encodeWithSelector(FlywheelPilot.PoolShareTooHigh.selector, SMUSD));
        pilot.vote(ID, pools, weights, "");
    }
}
