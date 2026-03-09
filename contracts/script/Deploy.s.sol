// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {StrategyManager} from "../src/StrategyManager.sol";
import {MockStrategy} from "../src/MockStrategy.sol";
import {Vault} from "../src/Vault.sol";
import {XCMRouter} from "../src/XCMRouter.sol";

contract DeployScript is Script {
    StrategyManager public strategyManager;
    MockStrategy public mockStrategy;
    XCMRouter public xcmRouter;
    Vault public vault;

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address assetAddress = vm.envAddress("ASSET_ADDRESS");
        address owner = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying contracts...");
        console.log("Deployer:", owner);
        console.log("Asset Address:", assetAddress);

        // Deploy StrategyManager
        console.log("\n1. Deploying StrategyManager...");
        strategyManager = new StrategyManager(owner);
        console.log("StrategyManager deployed at:", address(strategyManager));

        // Deploy MockStrategy
        console.log("\n2. Deploying MockStrategy...");
        mockStrategy = new MockStrategy(assetAddress);
        console.log("MockStrategy deployed at:", address(mockStrategy));

        // Deploy XCMRouter (simulation only)
        console.log("\n3. Deploying XCMRouter...");
        xcmRouter = new XCMRouter();
        console.log("XCMRouter deployed at:", address(xcmRouter));

        // Deploy Vault
        console.log("\n4. Deploying Vault...");
        vault = new Vault(assetAddress, address(strategyManager), address(xcmRouter));
        console.log("Vault deployed at:", address(vault));

        // Optional: Add MockStrategy to StrategyManager with an APY
        console.log("\n5. Adding MockStrategy to StrategyManager...");
        uint256 mockStrategyAPY = vm.envOr("MOCK_STRATEGY_APY", uint256(500)); // Default 5% (500 basis points)
        uint256 mockStrategyChainId = vm.envOr("MOCK_STRATEGY_CHAIN_ID", uint256(1284)); // Default Moonbeam
        uint256 mockStrategyRisk = vm.envOr("MOCK_STRATEGY_RISK", uint256(2)); // Default low-medium risk
        strategyManager.addStrategy(address(mockStrategy), mockStrategyAPY, mockStrategyChainId, mockStrategyRisk);
        console.log("MockStrategy added with APY:", mockStrategyAPY);
        console.log("Chain ID:", mockStrategyChainId);
        console.log("Risk Score:", mockStrategyRisk);

        console.log("\n=== Deployment Summary ===");
        console.log("StrategyManager:", address(strategyManager));
        console.log("MockStrategy:", address(mockStrategy));
        console.log("Vault:", address(vault));
        console.log("Asset:", assetAddress);

        vm.stopBroadcast();
    }
}
