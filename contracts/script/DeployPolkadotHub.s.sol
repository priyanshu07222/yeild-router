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
 * @title DeployPolkadotHub
 * @notice Deploy ParaX router stack on Polkadot Hub. Optionally deploy strategies on Hub (single-chain demo) or leave for parachains.
 * @dev Set HUB_ONLY=true to deploy only: asset, Adapter, StrategyManager, (optional XCMRouter), Vault. No strategies on Hub.
 *      Set SKIP_XCM_ROUTER=true to skip deploying XCMRouter (e.g. on Polkadot Hub where PUSH0 fails); Vault receives address(0) and skips XCM in rebalance().
 *      Set HUB_ONLY=false or omit to deploy router + 3 MockStrategies on Hub (single-chain demo).
 */
contract DeployPolkadotHub is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.addr(deployerPrivateKey);
        address assetAddress = vm.envOr("ASSET_ADDRESS", address(0));
        bool hubOnly = vm.envOr("HUB_ONLY", false);
        bool skipXcmRouter = vm.envOr("SKIP_XCM_ROUTER", false);

        // Optional: set in .env for production; leave unset for simulation (address(0) = emit-only / fallback)
        address xcmPrecompile = vm.envOr("XCM_PRECOMPILE_ADDRESS", address(0));
        address pvmOptimizer = vm.envOr("PVM_OPTIMIZER_ADDRESS", address(0));

        vm.startBroadcast(deployerPrivateKey);

        console.log("=== Deploying on Polkadot Hub ===");
        console.log("Deployer:", owner);
        console.log("HUB_ONLY (router only, no strategies on Hub):", hubOnly);
        console.log("SKIP_XCM_ROUTER (Vault gets address(0) for xcmRouter):", skipXcmRouter);
        if (assetAddress == address(0)) {
            ERC20Mock mockAsset = new ERC20Mock();
            mockAsset.mint(owner, 1_000_000 * 10 ** 18);
            assetAddress = address(mockAsset);
            console.log("No ASSET_ADDRESS - deployed Mock ERC20:", assetAddress);
            console.log("Minted 1,000,000 tokens to deployer.");
        } else {
            console.log("Asset (from env):", assetAddress);
        }
        console.log("XCM precompile (0 = simulation):", xcmPrecompile);
        console.log("PVM optimizer (0 = fallback):", pvmOptimizer);

        // 1. XCMRouter (optional; skip on chains where it fails e.g. PUSH0 on Polkadot Hub)
        address xcmRouterAddr;
        if (!skipXcmRouter) {
            XCMRouter xcmRouter = new XCMRouter(xcmPrecompile);
            xcmRouterAddr = address(xcmRouter);
            console.log("\n1. XCMRouter:", xcmRouterAddr);
        } else {
            xcmRouterAddr = address(0);
            console.log("\n1. XCMRouter: skipped (SKIP_XCM_ROUTER=true); Vault will have no XCM notifications.");
        }

        // 2. Adapter (PVM optimizer or fallback)
        StrategyOptimizerAdapter optimizer = new StrategyOptimizerAdapter(pvmOptimizer);
        console.log("2. StrategyOptimizerAdapter:", address(optimizer));

        // 3. StrategyManager
        StrategyManager strategyManager = new StrategyManager(owner, address(optimizer));
        console.log("3. StrategyManager:", address(strategyManager));

        // 4. Strategies: on Hub only if !hubOnly (single-chain demo); otherwise deploy on parachains and register later
        address moonbeamStrategyAddr;
        address astarStrategyAddr;
        address hydrationStrategyAddr;
        if (!hubOnly) {
            MockStrategy moonbeamStrategy = new MockStrategy(assetAddress);
            MockStrategy astarStrategy = new MockStrategy(assetAddress);
            MockStrategy hydrationStrategy = new MockStrategy(assetAddress);
            moonbeamStrategy.setAPY(800);
            astarStrategy.setAPY(1200);
            hydrationStrategy.setAPY(1500);
            moonbeamStrategyAddr = address(moonbeamStrategy);
            astarStrategyAddr = address(astarStrategy);
            hydrationStrategyAddr = address(hydrationStrategy);
            console.log("4. Moonbeam Strategy (on Hub):", moonbeamStrategyAddr);
            console.log("   Astar Strategy (on Hub):", astarStrategyAddr);
            console.log("   Hydration Strategy (on Hub):", hydrationStrategyAddr);
        } else {
            console.log("4. Skipped (HUB_ONLY): deploy strategies on Moonbeam, Astar, HydraDX; then call StrategyManager.addStrategy on Hub.");
        }

        // 5. Vault (xcmRouterAddr can be 0; Vault skips XCM in rebalance when 0)
        Vault vault = new Vault(assetAddress, address(strategyManager), xcmRouterAddr);
        console.log("5. Vault:", address(vault));

        // 6. Register strategies (only if we deployed them on Hub)
        if (!hubOnly) {
            strategyManager.addStrategy(moonbeamStrategyAddr, 800, 1284, 2);
            strategyManager.addStrategy(astarStrategyAddr, 1200, 592, 4);
            strategyManager.addStrategy(hydrationStrategyAddr, 1500, 2034, 7);
            console.log("6. Strategies registered on Hub.");
        } else {
            console.log("6. Skipped. After deploying strategies on parachains, call on Hub:");
            console.log("   strategyManager.addStrategy(MOONBEAM_STRATEGY_ADDR, 800, 1284, 2);");
            console.log("   strategyManager.addStrategy(ASTAR_STRATEGY_ADDR, 1200, 592, 4);");
            console.log("   strategyManager.addStrategy(HYDRATION_STRATEGY_ADDR, 1500, 2034, 7);");
        }

        vm.stopBroadcast();

        console.log("\n=== Polkadot Hub deployment summary ===");
        console.log("Vault:", address(vault));
        console.log("StrategyManager:", address(strategyManager));
        console.log("StrategyOptimizerAdapter:", address(optimizer));
        console.log("XCMRouter:", xcmRouterAddr);
        console.log("Asset:", assetAddress);
        if (!hubOnly) {
            console.log("Moonbeam Strategy:", moonbeamStrategyAddr);
            console.log("Astar Strategy:", astarStrategyAddr);
            console.log("Hydration Strategy:", hydrationStrategyAddr);
        }
    }
}
