// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {StrategyManager} from "../src/StrategyManager.sol";
import {MockStrategy} from "../src/MockStrategy.sol";
import {Vault} from "../src/Vault.sol";

contract DeployScript is Script {
    StrategyManager public strategyManager;
    MockStrategy public mockStrategy;
    Vault public vault;

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address assetAddress = vm.envAddress("ASSET_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying contracts...");
        console.log("Deployer:", msg.sender);
        console.log("Asset Address:", assetAddress);

        // Deploy StrategyManager
        console.log("\n1. Deploying StrategyManager...");
        strategyManager = new StrategyManager();
        console.log("StrategyManager deployed at:", address(strategyManager));

        // Deploy MockStrategy
        console.log("\n2. Deploying MockStrategy...");
        mockStrategy = new MockStrategy();
        console.log("MockStrategy deployed at:", address(mockStrategy));

        // Deploy Vault
        console.log("\n3. Deploying Vault...");
        vault = new Vault(assetAddress, address(strategyManager));
        console.log("Vault deployed at:", address(vault));

        // Optional: Add MockStrategy to StrategyManager with an APY
        console.log("\n4. Adding MockStrategy to StrategyManager...");
        uint256 mockStrategyAPY = vm.envOr("MOCK_STRATEGY_APY", uint256(500)); // Default 5% (500 basis points)
        strategyManager.addStrategy(address(mockStrategy), mockStrategyAPY);
        console.log("MockStrategy added with APY:", mockStrategyAPY);

        console.log("\n=== Deployment Summary ===");
        console.log("StrategyManager:", address(strategyManager));
        console.log("MockStrategy:", address(mockStrategy));
        console.log("Vault:", address(vault));
        console.log("Asset:", assetAddress);

        vm.stopBroadcast();
    }
}
