// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {MockStrategy} from "../src/MockStrategy.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

/**
 * @title DeployParachainStrategy
 * @notice Deploy a single MockStrategy on one parachain (Moonbeam, Astar, or HydraDX).
 * @dev Run once per chain with that chain's RPC and ASSET_ADDRESS. Use --rpc-url <CHAIN_RPC>.
 *
 * Required env:
 *   PRIVATE_KEY   - Deployer private key (hex, with 0x)
 * Optional: ASSET_ADDRESS - ERC20 on this chain; if unset, deploys a mock ERC20 and mints to deployer.
 *
 * Optional env (for logging):
 *   STRATEGY_LABEL - e.g. Moonbeam, Astar, Hydration
 *
 * Example (Moonbeam):
 *   export PRIVATE_KEY=0x...
 *   export ASSET_ADDRESS=0x...
 *   export STRATEGY_LABEL=Moonbeam
 *   forge script script/DeployParachainStrategy.s.sol:DeployParachainStrategy \
 *     --rpc-url https://rpc.api.moonbeam.network --broadcast
 *
 * Then register the logged strategy address in StrategyManager on Polkadot Hub (addStrategy).
 */
contract DeployParachainStrategy is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.addr(deployerPrivateKey);
        address assetAddress = vm.envOr("ASSET_ADDRESS", address(0));

        string memory label = vm.envOr("STRATEGY_LABEL", string("ParachainStrategy"));

        vm.startBroadcast(deployerPrivateKey);

        if (assetAddress == address(0)) {
            ERC20Mock mockAsset = new ERC20Mock();
            mockAsset.mint(owner, 1_000_000 * 10 ** 18);
            assetAddress = address(mockAsset);
        }

        MockStrategy strategy = new MockStrategy(assetAddress);
        strategy.setAPY(1000); // 10% default; owner can update on-chain if needed

        vm.stopBroadcast();

        console.log("=== Parachain strategy deployed ===");
        console.log("Label:", label);
        console.log("Strategy address:", address(strategy));
        console.log("Asset:", assetAddress);
        console.log("Save this address and call StrategyManager.addStrategy(strategy, apy, chainId, risk) on Polkadot Hub.");
        console.log("EVM chain IDs: Moonbeam=1284, Astar=592, HydraDX=2034");
    }
}
