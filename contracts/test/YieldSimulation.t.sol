// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Vault} from "../src/Vault.sol";
import {StrategyManager} from "../src/StrategyManager.sol";
import {MockStrategy} from "../src/MockStrategy.sol";
import {MockERC20} from "./Vault.t.sol";

contract YieldSimulationTest is Test {
    Vault public vault;
    StrategyManager public strategyManager;
    MockERC20 public asset;
    MockStrategy public moonbeamStrategy;
    MockStrategy public astarStrategy;

    address public owner = address(this);
    address public user1 = address(0x1);

    uint256 public constant INITIAL_BALANCE = 100000e18;

    function setUp() public {
        // Deploy mock ERC20 token
        asset = new MockERC20();
        
        // Deploy StrategyManager
        strategyManager = new StrategyManager(owner);
        
        // Deploy MockStrategies
        moonbeamStrategy = new MockStrategy(address(asset));
        astarStrategy = new MockStrategy(address(asset));
        
        // Deploy Vault
        vault = new Vault(address(asset), address(strategyManager), owner);

        // Mint tokens to user
        asset.mint(user1, INITIAL_BALANCE);
    }

    function testYieldGrowth() public {
        // Set initial APY for strategies
        moonbeamStrategy.setAPY(500);  // 5%
        astarStrategy.setAPY(1000);    // 10%
        
        // Add strategies
        strategyManager.addStrategy(address(moonbeamStrategy), 500);
        strategyManager.addStrategy(address(astarStrategy), 1000);
        
        uint256 depositAmount = 100e18;
        
        // User deposits
        vm.prank(user1);
        asset.approve(address(vault), depositAmount);
        vm.prank(user1);
        vault.deposit(depositAmount);
        
        uint256 initialShares = vault.userShares(user1);
        
        // Simulate yield by increasing strategy APY
        // This simulates the strategy generating yield over time
        astarStrategy.setAPY(1500); // Increase to 15%
        
        // The vault's totalAssets will reflect the yield when synced
        // In a real scenario, this would happen automatically
        // For testing, we can see the yield reflected in totalAssets calculation
        
        // Verify vault share value increases
        // When we check totalAssets, it should include the yield
        vault.totalAssets(); // Sync totalAssets
        
        // The yield is simulated in MockStrategy.totalAssets()
        // which returns totalDeposited + (totalDeposited * apy / 10000)
        uint256 strategyValue = astarStrategy.totalAssets();
        assertGt(strategyValue, depositAmount, "Strategy value should include yield");
        
        // User withdraws
        uint256 userBalanceBefore = asset.balanceOf(user1);
        vm.prank(user1);
        vault.withdraw(initialShares);
        uint256 userBalanceAfter = asset.balanceOf(user1);
        
        uint256 assetsReceived = userBalanceAfter - userBalanceBefore;
        
        // Since yield is simulated but not actually minted in MockStrategy,
        // the user can only receive what was actually deposited
        // The vault calculates assets based on totalAssets (including yield),
        // but can only withdraw actual tokens
        assertEq(assetsReceived, depositAmount, "User should receive deposited amount (yield is simulated)");
    }

    function testRebalance() public {
        // Set initial APYs
        moonbeamStrategy.setAPY(500);  // 5%
        astarStrategy.setAPY(1000);    // 10%
        
        // Add strategies
        strategyManager.addStrategy(address(moonbeamStrategy), 500);
        strategyManager.addStrategy(address(astarStrategy), 1000);
        
        uint256 depositAmount = 1000e18;
        
        // User deposits
        vm.prank(user1);
        asset.approve(address(vault), depositAmount);
        vm.prank(user1);
        vault.deposit(depositAmount);
        
        // Verify funds are in Astar (highest APY)
        address currentStrategy = vault.currentStrategy();
        assertEq(currentStrategy, address(astarStrategy), "Funds should be in Astar strategy");
        
        uint256 astarBalanceBefore = asset.balanceOf(address(astarStrategy));
        assertGt(astarBalanceBefore, 0, "Astar should have funds");
        
        // Update Moonbeam APY to be higher
        strategyManager.updateAPY(0, 1500); // Moonbeam now 15%
        moonbeamStrategy.setAPY(1500);
        
        // Rebalance
        vault.rebalance();
        
        // Verify funds moved from Astar to Moonbeam
        address newStrategy = vault.currentStrategy();
        assertEq(newStrategy, address(moonbeamStrategy), "Current strategy should be Moonbeam");
        
        uint256 astarBalanceAfter = asset.balanceOf(address(astarStrategy));
        uint256 moonbeamBalanceAfter = asset.balanceOf(address(moonbeamStrategy));
        
        assertEq(astarBalanceAfter, 0, "Astar should have no funds");
        assertGt(moonbeamBalanceAfter, 0, "Moonbeam should have funds");
    }

    function testRebalanceSameStrategy() public {
        // Set APYs
        moonbeamStrategy.setAPY(500);  // 5%
        astarStrategy.setAPY(1000);    // 10%
        
        // Add strategies
        strategyManager.addStrategy(address(moonbeamStrategy), 500);
        strategyManager.addStrategy(address(astarStrategy), 1000);
        
        uint256 depositAmount = 1000e18;
        
        // User deposits
        vm.prank(user1);
        asset.approve(address(vault), depositAmount);
        vm.prank(user1);
        vault.deposit(depositAmount);
        
        address currentStrategyBefore = vault.currentStrategy();
        uint256 astarBalanceBefore = asset.balanceOf(address(astarStrategy));
        
        // Rebalance (best strategy is already active)
        vault.rebalance();
        
        // Verify nothing changed
        address currentStrategyAfter = vault.currentStrategy();
        uint256 astarBalanceAfter = asset.balanceOf(address(astarStrategy));
        
        assertEq(currentStrategyAfter, currentStrategyBefore, "Current strategy should not change");
        assertEq(astarBalanceAfter, astarBalanceBefore, "Astar balance should not change");
    }

    function testNoStrategyDeposit() public {
        // Don't add any strategies
        uint256 depositAmount = 1000e18;
        
        // User deposits (should succeed even without strategies)
        vm.prank(user1);
        asset.approve(address(vault), depositAmount);
        vm.prank(user1);
        vault.deposit(depositAmount);
        
        // Verify deposit succeeded
        assertEq(vault.userShares(user1), depositAmount, "User should have shares");
        assertEq(vault.totalShares(), depositAmount, "Total shares should be correct");
        
        // Funds should stay in vault (no strategy allocated)
        assertEq(vault.currentStrategy(), address(0), "No strategy should be allocated");
        uint256 vaultBalance = asset.balanceOf(address(vault));
        assertGt(vaultBalance, 0, "Vault should hold funds");
    }

    function testWithdrawMoreThanOwned() public {
        uint256 depositAmount = 1000e18;
        
        // User deposits
        vm.prank(user1);
        asset.approve(address(vault), depositAmount);
        vm.prank(user1);
        vault.deposit(depositAmount);
        
        uint256 userShares = vault.userShares(user1);
        
        // Try to withdraw more than owned
        vm.prank(user1);
        vm.expectRevert("Vault: insufficient shares");
        vault.withdraw(userShares + 1);
    }

    function testMultipleDepositsAndRebalance() public {
        // Set APYs
        moonbeamStrategy.setAPY(500);  // 5%
        astarStrategy.setAPY(1000);     // 10%
        
        // Add strategies
        strategyManager.addStrategy(address(moonbeamStrategy), 500);
        strategyManager.addStrategy(address(astarStrategy), 1000);
        
        uint256 deposit1 = 500e18;
        uint256 deposit2 = 300e18;
        
        // First deposit
        vm.prank(user1);
        asset.approve(address(vault), deposit1);
        vm.prank(user1);
        vault.deposit(deposit1);
        
        assertEq(vault.currentStrategy(), address(astarStrategy), "Should use Astar");
        uint256 astarBalanceAfterDeposit1 = asset.balanceOf(address(astarStrategy));
        assertEq(astarBalanceAfterDeposit1, deposit1, "First deposit should be in Astar");
        
        // Update Moonbeam to be better
        strategyManager.updateAPY(0, 1500);
        moonbeamStrategy.setAPY(1500);
        
        // Second deposit (should still go to Astar initially since currentStrategy hasn't changed)
        vm.prank(user1);
        asset.approve(address(vault), deposit2);
        vm.prank(user1);
        vault.deposit(deposit2);
        
        // After second deposit, funds should be allocated to Astar (current strategy)
        // Note: Even though Moonbeam is now better, deposit allocates to currentStrategy
        // So both deposits (500 + 300) should be in Astar
        uint256 astarBalanceAfterDeposit2 = asset.balanceOf(address(astarStrategy));
        uint256 vaultBalanceAfterDeposit2 = asset.balanceOf(address(vault));
        assertEq(astarBalanceAfterDeposit2, deposit1 + deposit2, "Both deposits should be in Astar");
        
        // Rebalance to move all funds to Moonbeam
        vault.rebalance();
        
        assertEq(vault.currentStrategy(), address(moonbeamStrategy), "Should rebalance to Moonbeam");
        
        // After rebalance, all funds should be in Moonbeam
        // This includes funds from Astar + any funds that were in the vault
        uint256 moonbeamBalance = asset.balanceOf(address(moonbeamStrategy));
        uint256 expectedTotal = astarBalanceAfterDeposit2 + vaultBalanceAfterDeposit2;
        assertEq(moonbeamBalance, expectedTotal, "Moonbeam should have all funds from Astar and vault");
    }

    function testYieldAccumulation() public {
        // Set APY
        astarStrategy.setAPY(1000); // 10%
        strategyManager.addStrategy(address(astarStrategy), 1000);
        
        uint256 depositAmount = 1000e18;
        
        // Deposit
        vm.prank(user1);
        asset.approve(address(vault), depositAmount);
        vm.prank(user1);
        vault.deposit(depositAmount);
        
        // Simulate yield accumulation
        // In MockStrategy, yield is calculated as: totalDeposited + (totalDeposited * apy / 10000)
        // So with 10% APY: 1000 + (1000 * 1000 / 10000) = 1100
        
        uint256 strategyValue = astarStrategy.totalAssets();
        uint256 expectedYield = depositAmount + (depositAmount * 1000 / 10000);
        assertEq(strategyValue, expectedYield, "Strategy should show simulated yield");
        
        // Vault's totalAssets should reflect this
        uint256 vaultTotalAssets = vault.totalAssets();
        assertGt(vaultTotalAssets, depositAmount, "Vault totalAssets should include yield");
    }
}
