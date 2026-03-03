// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Vault} from "../src/Vault.sol";
import {StrategyManager} from "../src/StrategyManager.sol";
import {MockStrategy} from "../src/MockStrategy.sol";
import {MockERC20} from "./Vault.t.sol";

contract VaultEdgeCasesTest is Test {
    Vault public vault;
    StrategyManager public strategyManager;
    MockERC20 public asset;
    MockStrategy public strategy1;
    MockStrategy public strategy2;
    MockStrategy public strategy3;

    address public owner = address(this);
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    address public user3 = address(0x3);

    uint256 public constant INITIAL_BALANCE = 1000000e18;

    function setUp() public {
        asset = new MockERC20();
        strategyManager = new StrategyManager(owner);
        
        strategy1 = new MockStrategy(address(asset));
        strategy2 = new MockStrategy(address(asset));
        strategy3 = new MockStrategy(address(asset));
        
        strategy1.setAPY(500);  // 5%
        strategy2.setAPY(1000); // 10%
        strategy3.setAPY(1500); // 15%
        
        strategyManager.addStrategy(address(strategy1), 500);
        strategyManager.addStrategy(address(strategy2), 1000);
        strategyManager.addStrategy(address(strategy3), 1500);
        
        vault = new Vault(address(asset), address(strategyManager), owner);

        asset.mint(user1, INITIAL_BALANCE);
        asset.mint(user2, INITIAL_BALANCE);
        asset.mint(user3, INITIAL_BALANCE);
    }

    function testDepositWithZeroTotalAssets() public {
        // First deposit should work even with zero totalAssets
        uint256 depositAmount = 1000e18;
        
        vm.prank(user1);
        asset.approve(address(vault), depositAmount);
        vm.prank(user1);
        vault.deposit(depositAmount);
        
        assertEq(vault.userShares(user1), depositAmount, "First deposit should be 1:1");
        assertEq(vault.totalShares(), depositAmount, "Total shares should equal deposit");
    }

    function testMultipleSmallDeposits() public {
        uint256 deposit1 = 100e18;
        uint256 deposit2 = 50e18;
        uint256 deposit3 = 25e18;
        
        // User1 deposits
        vm.prank(user1);
        asset.approve(address(vault), deposit1);
        vm.prank(user1);
        vault.deposit(deposit1);
        
        // User2 deposits
        vm.prank(user2);
        asset.approve(address(vault), deposit2);
        vm.prank(user2);
        vault.deposit(deposit2);
        
        // User3 deposits
        vm.prank(user3);
        asset.approve(address(vault), deposit3);
        vm.prank(user3);
        vault.deposit(deposit3);
        
        // Total shares will be less than sum of deposits due to yield appreciation
        // User1 gets 1:1 (100), User2 gets proportional (less than 50), User3 gets proportional (less than 25)
        uint256 totalShares = vault.totalShares();
        assertLt(totalShares, deposit1 + deposit2 + deposit3, "Total shares should be less than sum due to yield");
        assertGt(totalShares, deposit1, "Total shares should be more than first deposit");
        assertGt(vault.totalAssets(), deposit1 + deposit2 + deposit3, "Total assets should include yield");
    }

    function testWithdrawAllShares() public {
        uint256 depositAmount = 1000e18;
        
        vm.prank(user1);
        asset.approve(address(vault), depositAmount);
        vm.prank(user1);
        vault.deposit(depositAmount);
        
        uint256 shares = vault.userShares(user1);
        uint256 balanceBefore = asset.balanceOf(user1);
        
        vm.prank(user1);
        vault.withdraw(shares);
        
        uint256 balanceAfter = asset.balanceOf(user1);
        assertGe(balanceAfter - balanceBefore, depositAmount, "Should receive at least deposited amount");
        assertEq(vault.userShares(user1), 0, "All shares should be burned");
        assertEq(vault.totalShares(), 0, "Total shares should be zero");
    }

    function testWithdrawPartialSharesMultipleTimes() public {
        uint256 depositAmount = 1000e18;
        
        vm.prank(user1);
        asset.approve(address(vault), depositAmount);
        vm.prank(user1);
        vault.deposit(depositAmount);
        
        uint256 totalShares = vault.userShares(user1);
        uint256 balanceBefore = asset.balanceOf(user1);
        
        // Withdraw 25%
        vm.prank(user1);
        vault.withdraw(totalShares / 4);
        
        // Withdraw another 25%
        vm.prank(user1);
        vault.withdraw(totalShares / 4);
        
        // Withdraw remaining 50%
        uint256 remainingShares = vault.userShares(user1);
        vm.prank(user1);
        vault.withdraw(remainingShares);
        
        uint256 balanceAfter = asset.balanceOf(user1);
        assertGe(balanceAfter - balanceBefore, depositAmount, "Should receive at least deposited amount");
        assertEq(vault.userShares(user1), 0, "All shares should be burned");
    }

    function testDepositAfterYieldAccrual() public {
        uint256 deposit1 = 1000e18;
        uint256 deposit2 = 500e18;
        
        // First deposit
        vm.prank(user1);
        asset.approve(address(vault), deposit1);
        vm.prank(user1);
        vault.deposit(deposit1);
        
        uint256 totalAssets1 = vault.totalAssets();
        
        // Increase APY to simulate yield
        strategy3.setAPY(2000); // 20%
        
        // Second deposit after yield accrual
        vm.prank(user2);
        asset.approve(address(vault), deposit2);
        vm.prank(user2);
        vault.deposit(deposit2);
        
        uint256 shares2 = vault.userShares(user2);
        
        // User2 should get fewer shares per token due to yield appreciation
        assertLt(shares2, deposit2, "User2 should get fewer shares due to yield");
        assertGt(vault.totalAssets(), totalAssets1 + deposit2, "Total assets should increase");
    }

    function testRebalanceWithMultipleStrategies() public {
        uint256 depositAmount = 1000e18;
        
        // Deposit
        vm.prank(user1);
        asset.approve(address(vault), depositAmount);
        vm.prank(user1);
        vault.deposit(depositAmount);
        
        // Should be in strategy3 (highest APY)
        assertEq(vault.currentStrategy(), address(strategy3), "Should use strategy3");
        
        // Update strategy1 to be best
        strategyManager.updateAPY(0, 2000);
        strategy1.setAPY(2000);
        
        // Rebalance
        vault.rebalance();
        
        assertEq(vault.currentStrategy(), address(strategy1), "Should rebalance to strategy1");
        assertGt(asset.balanceOf(address(strategy1)), 0, "Strategy1 should have funds");
    }

    function testRebalanceWhenNoFunds() public {
        // Rebalance with no funds should not revert
        vault.rebalance();
        
        assertEq(vault.currentStrategy(), address(strategy3), "Should set to best strategy");
    }

    function testDepositWhenBestStrategyChanges() public {
        uint256 deposit1 = 500e18;
        uint256 deposit2 = 300e18;
        
        // First deposit goes to strategy3 (best)
        vm.prank(user1);
        asset.approve(address(vault), deposit1);
        vm.prank(user1);
        vault.deposit(deposit1);
        
        assertEq(vault.currentStrategy(), address(strategy3), "Should use strategy3");
        
        // Make strategy2 the best
        strategyManager.updateAPY(1, 2500);
        strategy2.setAPY(2500);
        
        // Second deposit should still go to currentStrategy (strategy3)
        vm.prank(user2);
        asset.approve(address(vault), deposit2);
        vm.prank(user2);
        vault.deposit(deposit2);
        
        // Funds should still be in strategy3 until rebalance
        assertEq(vault.currentStrategy(), address(strategy3), "Current strategy unchanged until rebalance");
        
        // Rebalance moves to strategy2
        vault.rebalance();
        assertEq(vault.currentStrategy(), address(strategy2), "Should rebalance to strategy2");
    }

    function testWithdrawWhenStrategyHasYield() public {
        uint256 depositAmount = 1000e18;
        
        vm.prank(user1);
        asset.approve(address(vault), depositAmount);
        vm.prank(user1);
        vault.deposit(depositAmount);
        
        // Increase APY to simulate yield
        strategy3.setAPY(2000); // 20%
        
        uint256 shares = vault.userShares(user1);
        uint256 balanceBefore = asset.balanceOf(user1);
        
        vm.prank(user1);
        vault.withdraw(shares);
        
        uint256 balanceAfter = asset.balanceOf(user1);
        // Should receive at least deposited amount (yield is simulated)
        assertGe(balanceAfter - balanceBefore, depositAmount, "Should receive at least deposited amount");
    }

    function testMultipleUsersWithdrawProportionally() public {
        uint256 deposit1 = 1000e18;
        uint256 deposit2 = 500e18;
        
        // User1 deposits
        vm.prank(user1);
        asset.approve(address(vault), deposit1);
        vm.prank(user1);
        vault.deposit(deposit1);
        
        // User2 deposits
        vm.prank(user2);
        asset.approve(address(vault), deposit2);
        vm.prank(user2);
        vault.deposit(deposit2);
        
        uint256 totalShares = vault.totalShares();
        uint256 user1Shares = vault.userShares(user1);
        uint256 user2Shares = vault.userShares(user2);
        
        // User1 withdraws half
        uint256 user1BalanceBefore = asset.balanceOf(user1);
        vm.prank(user1);
        vault.withdraw(user1Shares / 2);
        assertGt(asset.balanceOf(user1) - user1BalanceBefore, 0, "User1 should receive assets");
        
        // User2 withdraws all
        uint256 user2BalanceBefore = asset.balanceOf(user2);
        vm.prank(user2);
        vault.withdraw(user2Shares);
        assertGt(asset.balanceOf(user2) - user2BalanceBefore, 0, "User2 should receive assets");
        assertEq(vault.userShares(user2), 0, "User2 shares should be zero");
    }

    function testDepositMaxAmount() public {
        uint256 maxAmount = INITIAL_BALANCE;
        
        vm.prank(user1);
        asset.approve(address(vault), maxAmount);
        vm.prank(user1);
        vault.deposit(maxAmount);
        
        assertEq(vault.userShares(user1), maxAmount, "Should get 1:1 shares for first deposit");
        assertEq(vault.totalShares(), maxAmount, "Total shares should equal deposit");
    }

    function testRebalanceMultipleTimes() public {
        uint256 depositAmount = 1000e18;
        
        vm.prank(user1);
        asset.approve(address(vault), depositAmount);
        vm.prank(user1);
        vault.deposit(depositAmount);
        
        // Rebalance to strategy2
        strategyManager.updateAPY(1, 2000);
        strategy2.setAPY(2000);
        vault.rebalance();
        assertEq(vault.currentStrategy(), address(strategy2), "Should be in strategy2");
        
        // Rebalance to strategy1
        strategyManager.updateAPY(0, 3000);
        strategy1.setAPY(3000);
        vault.rebalance();
        assertEq(vault.currentStrategy(), address(strategy1), "Should be in strategy1");
        
        // Rebalance back to strategy3
        strategyManager.updateAPY(2, 4000);
        strategy3.setAPY(4000);
        vault.rebalance();
        assertEq(vault.currentStrategy(), address(strategy3), "Should be in strategy3");
    }

    function testWithdrawAfterRebalance() public {
        uint256 depositAmount = 1000e18;
        
        vm.prank(user1);
        asset.approve(address(vault), depositAmount);
        vm.prank(user1);
        vault.deposit(depositAmount);
        
        // Rebalance
        strategyManager.updateAPY(1, 2000);
        strategy2.setAPY(2000);
        vault.rebalance();
        
        // Withdraw after rebalance
        uint256 shares = vault.userShares(user1);
        uint256 balanceBefore = asset.balanceOf(user1);
        
        vm.prank(user1);
        vault.withdraw(shares);
        
        uint256 balanceAfter = asset.balanceOf(user1);
        assertGe(balanceAfter - balanceBefore, depositAmount, "Should receive at least deposited amount");
    }

    function testDepositWithDifferentAPYs() public {
        uint256 deposit1 = 500e18;
        uint256 deposit2 = 500e18;
        
        // First deposit
        vm.prank(user1);
        asset.approve(address(vault), deposit1);
        vm.prank(user1);
        vault.deposit(deposit1);
        
        // Change APY between deposits
        strategy3.setAPY(5000); // 50%
        
        // Second deposit
        vm.prank(user2);
        asset.approve(address(vault), deposit2);
        vm.prank(user2);
        vault.deposit(deposit2);
        
        // User2 should get fewer shares due to higher yield
        uint256 user2Shares = vault.userShares(user2);
        assertLt(user2Shares, deposit2, "User2 should get fewer shares due to yield");
    }

    function testTotalAssetsAccuracy() public {
        uint256 deposit1 = 1000e18;
        uint256 deposit2 = 500e18;
        
        vm.prank(user1);
        asset.approve(address(vault), deposit1);
        vm.prank(user1);
        vault.deposit(deposit1);
        
        uint256 totalAssets1 = vault.totalAssets();
        assertGt(totalAssets1, deposit1, "Total assets should include yield");
        
        vm.prank(user2);
        asset.approve(address(vault), deposit2);
        vm.prank(user2);
        vault.deposit(deposit2);
        
        uint256 totalAssets2 = vault.totalAssets();
        assertGt(totalAssets2, totalAssets1 + deposit2, "Total assets should increase");
    }

    function testShareCalculationPrecision() public {
        uint256 deposit1 = 1000e18;
        uint256 deposit2 = 1e18; // Very small deposit
        
        vm.prank(user1);
        asset.approve(address(vault), deposit1);
        vm.prank(user1);
        vault.deposit(deposit1);
        
        vm.prank(user2);
        asset.approve(address(vault), deposit2);
        vm.prank(user2);
        vault.deposit(deposit2);
        
        // Small deposit should still get shares
        assertGt(vault.userShares(user2), 0, "Small deposit should get shares");
        assertLt(vault.userShares(user2), deposit2, "Should get fewer shares due to yield");
    }
}
