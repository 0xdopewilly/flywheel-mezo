// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {FlywheelPilot} from "../src/FlywheelPilot.sol";
import {IVeBTC, IPoolsVoter, IBoostVoter, IMUSDSavingsRate} from "../src/interfaces/IMezo.sol";
import {MezoTestnet} from "./MezoAddresses.sol";

/// forge script script/Deploy.s.sol --rpc-url mezo_testnet --broadcast --slow
/// Env: DEPLOYER_PRIVATE_KEY, optional KEEPER (defaults to deployer), TREASURY (defaults to deployer), FEE_BPS (default 500).
contract Deploy is Script {
    function run() external returns (FlywheelPilot pilot) {
        require(block.chainid == MezoTestnet.CHAIN_ID, "wrong chain");
        uint256 pk = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(pk);
        address keeper = vm.envOr("KEEPER", deployer);
        address treasury = vm.envOr("TREASURY", deployer);
        uint16 fee = uint16(vm.envOr("FEE_BPS", uint256(500)));

        // the addresses must still be wired the way the pilot expects
        require(IVeBTC(MezoTestnet.VE_BTC).voter() == MezoTestnet.POOLS_VOTER, "veBTC voter moved");
        require(IVeBTC(MezoTestnet.VE_BTC).booster() == MezoTestnet.BOOST_VOTER, "veBTC booster moved");

        vm.startBroadcast(pk);
        pilot = new FlywheelPilot(
            IVeBTC(MezoTestnet.VE_BTC),
            IPoolsVoter(MezoTestnet.POOLS_VOTER),
            IBoostVoter(MezoTestnet.BOOST_VOTER),
            IMUSDSavingsRate(MezoTestnet.SMUSD),
            IERC20(MezoTestnet.MUSD),
            MezoTestnet.BOOST_GAUGE_FACTORY,
            keeper,
            treasury,
            fee
        );
        vm.stopBroadcast();

        console2.log("FlywheelPilot", address(pilot));
        console2.log("keeper", keeper);
        console2.log("treasury", treasury);
        vm.writeJson(
            string.concat(
                '{"chainId":31611,"FlywheelPilot":"',
                vm.toString(address(pilot)),
                '","keeper":"',
                vm.toString(keeper),
                '","treasury":"',
                vm.toString(treasury),
                '","feeBps":',
                vm.toString(uint256(fee)),
                ',"block":',
                vm.toString(block.number),
                "}"
            ),
            "./deployments/31611.json"
        );
    }
}
