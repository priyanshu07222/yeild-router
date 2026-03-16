// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {StrategyManager} from "../src/StrategyManager.sol";
import {StrategyOptimizerAdapter} from "../src/StrategyOptimizerAdapter.sol";
import {MockStrategy} from "../src/MockStrategy.sol";
import {Vault} from "../src/Vault.sol";
import {XCMRouter} from "../src/XCMRouter.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

/**
 * @title DeployVault
 * @notice Deployment script for Vault, StrategyManager, and multiple MockStrategy contracts
 * @dev Deploys 3 strategies representing different Polkadot parachains
 */
contract DeployVault is Script {
    StrategyOptimizerAdapter public optimizer;
    StrategyManager public strategyManager;
    MockStrategy public moonbeamStrategy;
    MockStrategy public astarStrategy;
    MockStrategy public hydrationStrategy;
    XCMRouter public xcmRouter;
    Vault public vault;

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.addr(deployerPrivateKey);
        address assetAddress = vm.envOr("ASSET_ADDRESS", address(0));

        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying contracts...");
        console.log("Deployer:", owner);

        // If no ASSET_ADDRESS provided, deploy a mock ERC20 and mint to deployer for testing
        if (assetAddress == address(0)) {
            ERC20Mock mockAsset = new ERC20Mock();
            mockAsset.mint(owner, 1_000_000 * 10 ** 18);
            assetAddress = address(mockAsset);
            console.log("No ASSET_ADDRESS in .env - deployed Mock ERC20:", assetAddress);
            console.log("Minted 1,000,000 tokens to deployer for testing.");
        } else {
            console.log("Asset Address (from env):", assetAddress);
        }

        // 1. Deploy StrategyOptimizerAdapter (address(0) = use PVM_OPTIMIZER constant; on Hub pass PVM contract)
        console.log("\n1. Deploying StrategyOptimizerAdapter...");
        optimizer = new StrategyOptimizerAdapter(address(0));
        console.log("StrategyOptimizerAdapter deployed at:", address(optimizer));

        // 2. Deploy StrategyManager (pass adapter address)
        console.log("\n2. Deploying StrategyManager...");
        strategyManager = new StrategyManager(owner, address(optimizer));
        console.log("StrategyManager deployed at:", address(strategyManager));
        console.log("Adapter address:", address(optimizer));

        // 3. Deploy Strategies (MockStrategies representing different parachains)
        console.log("\n3. Deploying Strategies...");
        
        moonbeamStrategy = new MockStrategy(assetAddress);
        console.log("Moonbeam Strategy:", address(moonbeamStrategy));
        
        astarStrategy = new MockStrategy(assetAddress);
        console.log("Astar Strategy:", address(astarStrategy));
        
        hydrationStrategy = new MockStrategy(assetAddress);
        console.log("Hydration Strategy:", address(hydrationStrategy));

        // XCMRouter: address(0) = simulation (emit only); on Hub pass XCM precompile address from docs
        xcmRouter = new XCMRouter(address(0));
        console.log("XCMRouter:", address(xcmRouter));

        // 4. Deploy Vault
        console.log("\n4. Deploying Vault...");
        vault = new Vault(assetAddress, address(strategyManager), address(xcmRouter));
        console.log("Vault deployed at:", address(vault));

        // Add strategies to StrategyManager (EVM chain IDs per README: 1284 Moonbeam, 592 Astar, 2034 HydraDX)
        console.log("\n5. Adding strategies to StrategyManager...");
        
        // Moonbeam: 8% APY (800 bp), Low risk (2), EVM chain ID 1284
        strategyManager.addStrategy(address(moonbeamStrategy), 800, 1284, 2);
        moonbeamStrategy.setAPY(800);
        console.log("Moonbeam Strategy added:");
        console.log("  APY: 8% (800 bp)");
        console.log("  EVM chain ID: 1284");
        console.log("  Risk Score: 2 (Low)");
        console.log("  Score: 800 - (2 * 100) = 600");
        
        // Astar: 12% APY (1200 bp), Medium risk (4), EVM chain ID 592
        strategyManager.addStrategy(address(astarStrategy), 1200, 592, 4);
        astarStrategy.setAPY(1200);
        console.log("\nAstar Strategy added:");
        console.log("  APY: 12% (1200 bp)");
        console.log("  EVM chain ID: 592");
        console.log("  Risk Score: 4 (Medium)");
        console.log("  Score: 1200 - (4 * 100) = 800");
        
        // HydraDX/Hydration: 15% APY (1500 bp), High risk (7), EVM chain ID 2034 (parachain ID also 2034)
        strategyManager.addStrategy(address(hydrationStrategy), 1500, 2034, 7);
        hydrationStrategy.setAPY(1500);
        console.log("\nHydration Strategy added:");
        console.log("  APY: 15% (1500 bp)");
        console.log("  EVM chain ID: 2034");
        console.log("  Risk Score: 7 (High)");
        console.log("  Score: 1500 - (7 * 100) = 800");
        
        // Check best strategy
        address bestStrategy = strategyManager.getBestStrategy();
        console.log("\nBest Strategy (highest score):", bestStrategy);
        console.log("Note: Astar and Hydration tie at 800, but Astar is added first");

        console.log("\n=== Deployment Summary ===");
        console.log("StrategyOptimizerAdapter:", address(optimizer));
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
