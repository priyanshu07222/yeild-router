// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {StrategyManager} from "../src/StrategyManager.sol";
import {MockStrategy} from "../src/MockStrategy.sol";
import {Vault} from "../src/Vault.sol";
import {XCMRouter} from "../src/XCMRouter.sol";

/**
 * @title DeployVault
 * @notice Deployment script for Vault, StrategyManager, and multiple MockStrategy contracts
 * @dev Deploys 3 strategies representing different Polkadot parachains
 */
contract DeployVault is Script {
    StrategyManager public strategyManager;
    MockStrategy public moonbeamStrategy;
    MockStrategy public astarStrategy;
    MockStrategy public hydrationStrategy;
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

        // 1. Deploy XCMRouter (simulation only)
        console.log("\n1. Deploying XCMRouter...");
        xcmRouter = new XCMRouter();
        console.log("XCMRouter deployed at:", address(xcmRouter));

        // 2. Deploy StrategyManager
        console.log("\n2. Deploying StrategyManager...");
        strategyManager = new StrategyManager(owner);
        console.log("StrategyManager deployed at:", address(strategyManager));

        // 3. Deploy multiple MockStrategies (representing different parachains)
        console.log("\n3. Deploying MockStrategies...");
        
        moonbeamStrategy = new MockStrategy(assetAddress);
        console.log("Moonbeam Strategy:", address(moonbeamStrategy));
        
        astarStrategy = new MockStrategy(assetAddress);
        console.log("Astar Strategy:", address(astarStrategy));
        
        hydrationStrategy = new MockStrategy(assetAddress);
        console.log("Hydration Strategy:", address(hydrationStrategy));

        // 4. Deploy Vault
        console.log("\n4. Deploying Vault...");
        vault = new Vault(assetAddress, address(strategyManager), address(xcmRouter));
        console.log("Vault deployed at:", address(vault));

        // Add strategies to StrategyManager with different APYs and risk scores
        console.log("\n5. Adding strategies to StrategyManager...");
        
        // Moonbeam: 8% APY (800 basis points), Low risk (2), Chain ID 1284
        strategyManager.addStrategy(address(moonbeamStrategy), 800, 1284, 2);
        moonbeamStrategy.setAPY(800);
        console.log("Moonbeam Strategy added:");
        console.log("  APY: 8% (800 bp)");
        console.log("  Chain ID: 1284");
        console.log("  Risk Score: 2 (Low)");
        console.log("  Score: 800 - (2 * 100) = 600");
        
        // Astar: 12% APY (1200 basis points), Medium risk (4), Chain ID 592
        strategyManager.addStrategy(address(astarStrategy), 1200, 592, 4);
        astarStrategy.setAPY(1200);
        console.log("\nAstar Strategy added:");
        console.log("  APY: 12% (1200 bp)");
        console.log("  Chain ID: 592");
        console.log("  Risk Score: 4 (Medium)");
        console.log("  Score: 1200 - (4 * 100) = 800");
        
        // Hydration: 15% APY (1500 basis points), High risk (7), Chain ID 2034
        strategyManager.addStrategy(address(hydrationStrategy), 1500, 2034, 7);
        hydrationStrategy.setAPY(1500);
        console.log("\nHydration Strategy added:");
        console.log("  APY: 15% (1500 bp)");
        console.log("  Chain ID: 2034");
        console.log("  Risk Score: 7 (High)");
        console.log("  Score: 1500 - (7 * 100) = 800");
        
        // Check best strategy
        address bestStrategy = strategyManager.getBestStrategy();
        console.log("\nBest Strategy (highest score):", bestStrategy);
        console.log("Note: Astar and Hydration tie at 800, but Astar is added first");

        console.log("\n=== Deployment Summary ===");
        console.log("XCMRouter:", address(xcmRouter));
        console.log("StrategyManager:", address(strategyManager));
        console.log("Moonbeam Strategy:", address(moonbeamStrategy));
        console.log("Astar Strategy:", address(astarStrategy));
        console.log("Hydration Strategy:", address(hydrationStrategy));
        console.log("Vault:", address(vault));
        console.log("Asset:", assetAddress);
        console.log("\nTotal Strategies: 3");
        console.log("All strategies are active and ready for routing!");

        vm.stopBroadcast();
    }
}
