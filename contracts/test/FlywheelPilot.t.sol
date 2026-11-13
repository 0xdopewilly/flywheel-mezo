// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {FlywheelPilot} from "../src/FlywheelPilot.sol";
import {IVeBTC, IPoolsVoter, IBoostVoter, IMUSDSavingsRate} from "../src/interfaces/IMezo.sol";
import {MockERC20, MockVeBTC, MockPoolsVoter, MockBoostVoter, MockSavings} from "./mocks/Mocks.sol";

contract FlywheelPilotTest is Test {
    MockERC20 musd;
    MockVeBTC ve;
    MockPoolsVoter voter;
    MockBoostVoter boost;
    MockSavings savings;
    FlywheelPilot pilot;

    address keeper = makeAddr("keeper");
    address treasury = makeAddr("treasury");
    address alice = makeAddr("alice");
    address mallory = makeAddr("mallory");
    address factory = makeAddr("boostGaugeFactory");

    address poolA = makeAddr("poolA");
    address poolB = makeAddr("poolB");
    address poolC = makeAddr("poolC");
    address poolDead = makeAddr("poolDead");
    address poolUnknown = makeAddr("poolUnknown");

    uint256 constant ID = 42;

    function setUp() public {
        vm.warp(1_763_000_000);
        musd = new MockERC20("Mezo USD", "MUSD");
        ve = new MockVeBTC();
        voter = new MockPoolsVoter(ve);
        boost = new MockBoostVoter(ve);
        savings = new MockSavings(IERC20(address(musd)));
        pilot = new FlywheelPilot(
            IVeBTC(address(ve)),
            IPoolsVoter(address(voter)),
            IBoostVoter(address(boost)),
            IMUSDSavingsRate(address(savings)),
            IERC20(address(musd)),
            factory,
            keeper,
            treasury,
            500
        );
        voter.addPool(poolA, makeAddr("gaugeA"), true);
        voter.addPool(poolB, makeAddr("gaugeB"), true);
        voter.addPool(poolC, makeAddr("gaugeC"), true);
        voter.addPool(poolDead, makeAddr("gaugeDead"), false);
        ve.mint(alice, ID, 1e18);
        musd.mint(alice, 10_000e18);
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

    function _enroll() internal {
        vm.startPrank(alice);
        ve.approve(address(pilot), ID);
        pilot.enroll(ID, _policy());
        musd.approve(address(pilot), type(uint256).max);
        vm.stopPrank();
    }

    function _plan(address p1, uint256 w1, address p2, uint256 w2)
        internal
        pure
        returns (address[] memory pools, uint256[] memory weights)
    {
        pools = new address[](2);
        weights = new uint256[](2);
        (pools[0], pools[1], weights[0], weights[1]) = (p1, p2, w1, w2);
    }

    // ---------------------------------------------------------------- enroll

    function test_enroll_requiresOwnerAndApproval() public {
        vm.prank(alice);
        vm.expectRevert(FlywheelPilot.NotApproved.selector);
        pilot.enroll(ID, _policy());

        vm.prank(alice);
        ve.approve(address(pilot), ID);
        vm.prank(mallory);
        vm.expectRevert(FlywheelPilot.NotNftOwner.selector);
        pilot.enroll(ID, _policy());

        vm.prank(alice);
        pilot.enroll(ID, _policy());
        assertTrue(pilot.isLive(ID));
        assertEq(pilot.enrolledIds().length, 1);
    }

    function test_enroll_rejectsImpossiblePolicy() public {
        vm.prank(alice);
        ve.approve(address(pilot), ID);
        FlywheelPilot.Policy memory p = _policy();
        p.maxPoolShareBps = 0;
        vm.prank(alice);
        vm.expectRevert(FlywheelPilot.BadPolicy.selector);
        pilot.enroll(ID, p);
        p.maxPoolShareBps = 300; // 3% x 30 pools < 100%
        vm.prank(alice);
        vm.expectRevert(FlywheelPilot.BadPolicy.selector);
        pilot.enroll(ID, p);
        p.maxPoolShareBps = 5_000;
        p.boostShareBps = 10_001;
        vm.prank(alice);
        vm.expectRevert(FlywheelPilot.BadPolicy.selector);
        pilot.enroll(ID, p);
    }

    function test_setApprovalForAll_alsoWorks() public {
        vm.startPrank(alice);
        ve.setApprovalForAll(address(pilot), true);
        pilot.enroll(ID, _policy());
        vm.stopPrank();
        assertTrue(pilot.isLive(ID));
    }

    // ---------------------------------------------------------------- vote

    function test_vote_withinPolicy() public {
        _enroll();
        (address[] memory pools, uint256[] memory weights) = _plan(poolA, 55, poolB, 45);
        vm.prank(keeper);
        pilot.vote(ID, pools, weights, keccak256("plan-1"));
        assertEq(voter.votes(ID, poolA), 55);
        assertEq(voter.votes(ID, poolB), 45);
        assertEq(pilot.lastPlanHash(ID), keccak256("plan-1"));
    }

    function test_vote_onlyKeeper() public {
        _enroll();
        (address[] memory pools, uint256[] memory weights) = _plan(poolA, 50, poolB, 50);
        vm.prank(mallory);
        vm.expectRevert(FlywheelPilot.NotKeeper.selector);
        pilot.vote(ID, pools, weights, bytes32(0));
    }

    function test_vote_enforcesPoolShareCap() public {
        _enroll();
        (address[] memory pools, uint256[] memory weights) = _plan(poolA, 61, poolB, 39);
        vm.prank(keeper);
        vm.expectRevert(abi.encodeWithSelector(FlywheelPilot.PoolShareTooHigh.selector, poolA));
        pilot.vote(ID, pools, weights, bytes32(0));
    }

    function test_vote_enforcesMinPools() public {
        _enroll();
        address[] memory pools = new address[](1);
        uint256[] memory weights = new uint256[](1);
        pools[0] = poolA;
        weights[0] = 1;
        vm.prank(keeper);
        vm.expectRevert(FlywheelPilot.TooFewPools.selector);
        pilot.vote(ID, pools, weights, bytes32(0));
    }

    function test_vote_rejectsDeadUnknownAndBlockedPools() public {
        _enroll();
        (address[] memory pools, uint256[] memory weights) = _plan(poolA, 50, poolDead, 50);
        vm.prank(keeper);
        vm.expectRevert(abi.encodeWithSelector(FlywheelPilot.PoolNotAllowed.selector, poolDead));
        pilot.vote(ID, pools, weights, bytes32(0));

        (pools, weights) = _plan(poolA, 50, poolUnknown, 50);
        vm.prank(keeper);
        vm.expectRevert(abi.encodeWithSelector(FlywheelPilot.PoolNotAllowed.selector, poolUnknown));
        pilot.vote(ID, pools, weights, bytes32(0));

        address[] memory blocked = new address[](1);
        blocked[0] = poolB;
        vm.prank(alice);
        pilot.setPoolBlocked(ID, blocked, true);
        (pools, weights) = _plan(poolA, 50, poolB, 50);
        vm.prank(keeper);
        vm.expectRevert(abi.encodeWithSelector(FlywheelPilot.PoolNotAllowed.selector, poolB));
        pilot.vote(ID, pools, weights, bytes32(0));
    }

    function test_vote_rejectsZeroWeightsAndMismatch() public {
        _enroll();
        (address[] memory pools, uint256[] memory weights) = _plan(poolA, 0, poolB, 10);
        vm.prank(keeper);
        vm.expectRevert(FlywheelPilot.BadPlan.selector);
        pilot.vote(ID, pools, weights, bytes32(0));
        uint256[] memory short = new uint256[](1);
        short[0] = 1;
        vm.prank(keeper);
        vm.expectRevert(FlywheelPilot.BadPlan.selector);
        pilot.vote(ID, pools, short, bytes32(0));
    }

    function test_vote_stopsAfterNftLeavesOwner() public {
        _enroll();
        vm.prank(alice);
        ve.transferFrom(alice, mallory, ID);
        (address[] memory pools, uint256[] memory weights) = _plan(poolA, 50, poolB, 50);
        vm.prank(keeper);
        vm.expectRevert(FlywheelPilot.OwnerChanged.selector);
        pilot.vote(ID, pools, weights, bytes32(0));
        assertFalse(pilot.isLive(ID));
    }

    function test_vote_stopsAfterApprovalRevoked() public {
        _enroll();
        vm.prank(alice);
        ve.approve(address(0), ID);
        (address[] memory pools, uint256[] memory weights) = _plan(poolA, 50, poolB, 50);
        vm.prank(keeper);
        vm.expectRevert(FlywheelPilot.NotApproved.selector);
        pilot.vote(ID, pools, weights, bytes32(0));
    }

    function test_exit_stopsEverything() public {
        _enroll();
        vm.prank(alice);
        pilot.exit(ID);
        (address[] memory pools, uint256[] memory weights) = _plan(poolA, 50, poolB, 50);
        vm.prank(keeper);
        vm.expectRevert(FlywheelPilot.NotEnrolled.selector);
        pilot.vote(ID, pools, weights, bytes32(0));
        vm.prank(keeper);
        vm.expectRevert(FlywheelPilot.NotEnrolled.selector);
        pilot.compound(ID, 1e18, 0, bytes32(0));
    }

    function test_onlyOwnerCanTunePolicy() public {
        _enroll();
        vm.prank(mallory);
        vm.expectRevert(FlywheelPilot.NotNftOwner.selector);
        pilot.updatePolicy(ID, _policy());
        vm.prank(mallory);
        vm.expectRevert(FlywheelPilot.NotNftOwner.selector);
        pilot.exit(ID);
    }

    // ---------------------------------------------------------------- harvest

    function test_harvest_keeperOrOwnerOnly() public {
        _enroll();
        address[] memory b = new address[](1);
        address[][] memory bt = new address[][](1);
        address[] memory f = new address[](0);
        address[][] memory ft = new address[][](0);
        vm.prank(keeper);
        pilot.harvest(ID, b, bt, f, ft);
        vm.prank(alice);
        pilot.harvest(ID, b, bt, f, ft);
        assertEq(voter.bribeClaims(), 2);
        vm.prank(mallory);
        vm.expectRevert(FlywheelPilot.NotKeeper.selector);
        pilot.harvest(ID, b, bt, f, ft);
    }

    // ---------------------------------------------------------------- compound

    function test_compound_splitsFeeBoostAndSavings() public {
        _enroll();
        uint256 before = musd.balanceOf(alice);
        vm.prank(keeper);
        pilot.compound(ID, 100e18, 4_000, keccak256("plan-2"));

        // 5% fee, then 40% of the rest to boost, 60% to savings
        assertEq(musd.balanceOf(treasury), 5e18);
        address gauge = boost.boostableTokenIdToGauge(ID);
        assertTrue(gauge != address(0));
        assertEq(boost.bribes(gauge, address(musd)), 38e18);
        assertEq(savings.balanceOf(alice), 57e18);
        assertEq(musd.balanceOf(alice), before - 100e18);
        assertEq(musd.balanceOf(address(pilot)), 0);
        assertEq(savings.balanceOf(address(pilot)), 0);
        assertEq(musd.allowance(address(pilot), address(boost)), 0);
        assertEq(musd.allowance(address(pilot), address(savings)), 0);
    }

    function test_compound_reusesExistingBoostGauge() public {
        _enroll();
        vm.prank(keeper);
        pilot.compound(ID, 10e18, 5_000, bytes32(0));
        address g1 = boost.boostableTokenIdToGauge(ID);
        vm.prank(keeper);
        pilot.compound(ID, 10e18, 5_000, bytes32(0));
        assertEq(boost.boostableTokenIdToGauge(ID), g1);
    }

    function test_compound_enforcesEpochCap() public {
        _enroll();
        vm.prank(keeper);
        pilot.compound(ID, 600e18, 0, bytes32(0));
        assertEq(pilot.remainingPull(ID), 400e18);
        vm.prank(keeper);
        vm.expectRevert(FlywheelPilot.OverEpochCap.selector);
        pilot.compound(ID, 401e18, 0, bytes32(0));
        // a new epoch resets the cap
        vm.warp(block.timestamp + 7 days);
        vm.prank(keeper);
        pilot.compound(ID, 1_000e18, 0, bytes32(0));
    }

    function test_compound_enforcesBoostShare() public {
        _enroll();
        vm.prank(keeper);
        vm.expectRevert(FlywheelPilot.BoostShareTooHigh.selector);
        pilot.compound(ID, 10e18, 5_001, bytes32(0));
    }

    function test_compound_withoutAutoSaveOnlyAllowsFullBoost() public {
        vm.startPrank(alice);
        ve.approve(address(pilot), ID);
        FlywheelPilot.Policy memory p = _policy();
        p.autoSave = false;
        p.boostShareBps = 10_000;
        pilot.enroll(ID, p);
        musd.approve(address(pilot), type(uint256).max);
        vm.stopPrank();
        vm.prank(keeper);
        vm.expectRevert(FlywheelPilot.SavingDisabled.selector);
        pilot.compound(ID, 10e18, 5_000, bytes32(0));
        vm.prank(keeper);
        pilot.compound(ID, 10e18, 10_000, bytes32(0));
        assertEq(savings.balanceOf(alice), 0);
    }

    function test_compound_onlyKeeper() public {
        _enroll();
        vm.prank(mallory);
        vm.expectRevert(FlywheelPilot.NotKeeper.selector);
        pilot.compound(ID, 1e18, 0, bytes32(0));
    }

    function testFuzz_compound_conservesValue(uint256 amount, uint16 boostBps, uint16 fee) public {
        fee = uint16(bound(fee, 0, 1_000));
        boostBps = uint16(bound(boostBps, 0, 5_000));
        amount = bound(amount, 1, 1_000e18);
        pilot.setFee(fee);
        _enroll();
        uint256 aliceBefore = musd.balanceOf(alice);
        vm.prank(keeper);
        pilot.compound(ID, amount, boostBps, bytes32(0));
        address gauge = boost.boostableTokenIdToGauge(ID);
        uint256 boosted = gauge == address(0) ? 0 : boost.bribes(gauge, address(musd));
        assertEq(musd.balanceOf(treasury) + boosted + savings.balanceOf(alice), amount);
        assertEq(aliceBefore - musd.balanceOf(alice), amount);
        assertEq(musd.balanceOf(address(pilot)), 0);
    }

    // ---------------------------------------------------------------- admin

    function test_admin_feeCeilingAndOwnership() public {
        vm.expectRevert(FlywheelPilot.FeeTooHigh.selector);
        pilot.setFee(1_001);
        vm.prank(mallory);
        vm.expectRevert();
        pilot.setFee(10);
        vm.prank(mallory);
        vm.expectRevert();
        pilot.setKeeper(mallory);
    }
}
