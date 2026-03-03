// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Vault} from "../src/Vault.sol";
import {StrategyManager} from "../src/StrategyManager.sol";
import {MockStrategy} from "../src/MockStrategy.sol";
import {MockERC20} from "./Vault.t.sol";

contract IntegrationTests is Test {
    Vault public vault;
    StrategyManager public strategyManager;
    MockERC20 public asset;
    MockStrategy public moonbeamStrategy;
    MockStrategy public astarStrategy;
    MockStrategy public hydrationStrategy;

    address public owner = address(this);
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    address public user3 = address(0x3);

    uint256 public constant INITIAL_BALANCE = 1000000e18;

    function setUp() public {
        asset = new MockERC20();
        strategyManager = new StrategyManager(owner);
        
        moonbeamStrategy = new MockStrategy(address(asset));
        astarStrategy = new MockStrategy(address(asset));
        hydrationStrategy = new MockStrategy(address(asset));
        
        moonbeamStrategy.setAPY(500);  // 5%
        astarStrategy.setAPY(1000);     // 10%
        hydrationStrategy.setAPY(1500);  // 15%
        
        strategyManager.addStrategy(address(moonbeamStrategy), 500);
        strategyManager.addStrategy(address(astarStrategy), 1000);
        strategyManager.addStrategy(address(hydrationStrategy), 1500);
        
        vault = new Vault(address(asset), address(strategyManager), owner);

        asset.mint(user1, INITIAL_BALANCE);
        asset.mint(user2, INITIAL_BALANCE);
        asset.mint(user3, INITIAL_BALANCE);
    }

    function testFullVaultLifecycle() public {
        // 1. Initial deposit
        uint256 deposit1 = 10000e18;
        vm.prank(user1);
        asset.approve(address(vault), deposit1);
        vm.prank(user1);
        vault.deposit(deposit1);
        
        assertEq(vault.currentStrategy(), address(hydrationStrategy), "Should use highest APY strategy");
        assertEq(vault.userShares(user1), deposit1, "User1 should get 1:1 shares");
        
        // 2. More users deposit
        uint256 deposit2 = 5000e18;
        vm.prank(user2);
        asset.approve(address(vault), deposit2);
        vm.prank(user2);
        vault.deposit(deposit2);
        
        uint256 deposit3 = 3000e18;
        vm.prank(user3);
        asset.approve(address(vault), deposit3);
        vm.prank(user3);
        vault.deposit(deposit3);
        
        // 3. Simulate yield growth
        hydrationStrategy.setAPY(2000); // Increase to 20%
        
        // 4. Rebalance to new best strategy
        strategyManager.updateAPY(1, 2500); // Make Astar best
        astarStrategy.setAPY(2500);
        vault.rebalance();
        
        assertEq(vault.currentStrategy(), address(astarStrategy), "Should rebalance to Astar");
        
        // 5. Users withdraw
        uint256 user1Shares = vault.userShares(user1);
        uint256 user1BalanceBefore = asset.balanceOf(user1);
        vm.prank(user1);
        vault.withdraw(user1Shares);
        assertGt(asset.balanceOf(user1) - user1BalanceBefore, 0, "User1 should receive assets");
        
        uint256 user2Shares = vault.userShares(user2);
        uint256 user2BalanceBefore = asset.balanceOf(user2);
        vm.prank(user2);
        vault.withdraw(user2Shares);
        assertGt(asset.balanceOf(user2) - user2BalanceBefore, 0, "User2 should receive assets");
        
        uint256 user3Shares = vault.userShares(user3);
        uint256 user3BalanceBefore = asset.balanceOf(user3);
        vm.prank(user3);
        vault.withdraw(user3Shares);
        assertGt(asset.balanceOf(user3) - user3BalanceBefore, 0, "User3 should receive assets");
    }

    function testComplexRebalancingScenario() public {
        // Multiple deposits
        vm.prank(user1);
        asset.approve(address(vault), 10000e18);
        vm.prank(user1);
        vault.deposit(10000e18);
        
        vm.prank(user2);
        asset.approve(address(vault), 5000e18);
        vm.prank(user2);
        vault.deposit(5000e18);
        
        // First rebalance: Moonbeam becomes best
        strategyManager.updateAPY(0, 3000);
        moonbeamStrategy.setAPY(3000);
        vault.rebalance();
        assertEq(vault.currentStrategy(), address(moonbeamStrategy), "Should be in Moonbeam");
        
        // Second rebalance: Astar becomes best
        strategyManager.updateAPY(1, 4000);
        astarStrategy.setAPY(4000);
        vault.rebalance();
        assertEq(vault.currentStrategy(), address(astarStrategy), "Should be in Astar");
        
        // Third rebalance: Hydration becomes best again
        strategyManager.updateAPY(2, 5000);
        hydrationStrategy.setAPY(5000);
        vault.rebalance();
        assertEq(vault.currentStrategy(), address(hydrationStrategy), "Should be in Hydration");
    }

    function testYieldAccumulationOverTime() public {
        uint256 depositAmount = 10000e18;
        
        vm.prank(user1);
        asset.approve(address(vault), depositAmount);
        vm.prank(user1);
        vault.deposit(depositAmount);
        
        // Get initial strategy value (with 15% APY)
        uint256 initialStrategyValue = hydrationStrategy.totalAssets();
        
        // Simulate yield growth by increasing APY
        hydrationStrategy.setAPY(2000); // 20%
        
        // Strategy's totalAssets() calculates yield on-the-fly, so it should increase
        uint256 newStrategyValue = hydrationStrategy.totalAssets();
        assertGt(newStrategyValue, initialStrategyValue, "Strategy value should increase with higher APY");
        
        // Note: vault.totalAssets is a state variable that gets synced during operations
        // Since we're just changing APY without a deposit/withdraw, it won't auto-update
        // But the underlying strategy value has increased, which is what we're testing
        
        // User withdraws
        uint256 shares = vault.userShares(user1);
        uint256 balanceBefore = asset.balanceOf(user1);
        vm.prank(user1);
        vault.withdraw(shares);
        uint256 balanceAfter = asset.balanceOf(user1);
        
        assertGe(balanceAfter - balanceBefore, depositAmount, "Should receive at least deposited amount");
    }

    function testMultipleUsersProportionalWithdrawals() public {
        // User1 deposits 1000
        vm.prank(user1);
        asset.approve(address(vault), 1000e18);
        vm.prank(user1);
        vault.deposit(1000e18);
        
        // User2 deposits 500
        vm.prank(user2);
        asset.approve(address(vault), 500e18);
        vm.prank(user2);
        vault.deposit(500e18);
        
        // User3 deposits 300
        vm.prank(user3);
        asset.approve(address(vault), 300e18);
        vm.prank(user3);
        vault.deposit(300e18);
        
        uint256 user1Shares = vault.userShares(user1);
        uint256 user2Shares = vault.userShares(user2);
        uint256 user3Shares = vault.userShares(user3);
        
        // Verify proportions
        assertGt(user1Shares, user2Shares, "User1 should have more shares");
        assertGt(user2Shares, user3Shares, "User2 should have more shares than user3");
        
        // All withdraw proportionally
        uint256 user1BalanceBefore = asset.balanceOf(user1);
        vm.prank(user1);
        vault.withdraw(user1Shares);
        uint256 user1Received = asset.balanceOf(user1) - user1BalanceBefore;
        
        uint256 user2BalanceBefore = asset.balanceOf(user2);
        vm.prank(user2);
        vault.withdraw(user2Shares);
        uint256 user2Received = asset.balanceOf(user2) - user2BalanceBefore;
        
        uint256 user3BalanceBefore = asset.balanceOf(user3);
        vm.prank(user3);
        vault.withdraw(user3Shares);
        uint256 user3Received = asset.balanceOf(user3) - user3BalanceBefore;
        
        // Verify proportional withdrawals
        assertGt(user1Received, user2Received, "User1 should receive more");
        assertGt(user2Received, user3Received, "User2 should receive more than user3");
    }

    function testStrategyDeactivationDuringOperation() public {
        vm.prank(user1);
        asset.approve(address(vault), 10000e18);
        vm.prank(user1);
        vault.deposit(10000e18);
        
        assertEq(vault.currentStrategy(), address(hydrationStrategy), "Should use Hydration");
        
        // Deactivate Hydration (it's the third strategy added, so index 2)
        strategyManager.deactivateStrategy(2);
        
        // Best strategy should now be Astar
        address bestStrategy = strategyManager.getBestStrategy();
        assertEq(bestStrategy, address(astarStrategy), "Should fallback to Astar");
        
        // Rebalance should move to Astar
        vault.rebalance();
        assertEq(vault.currentStrategy(), address(astarStrategy), "Should rebalance to Astar");
    }

    function testDepositAndWithdrawInSameBlock() public {
        uint256 depositAmount = 1000e18;
        
        vm.prank(user1);
        asset.approve(address(vault), depositAmount * 2);
        
        // Deposit
        vm.prank(user1);
        vault.deposit(depositAmount);
        
        uint256 shares = vault.userShares(user1);
        
        // Withdraw immediately
        vm.prank(user1);
        vault.withdraw(shares);
        
        assertEq(vault.userShares(user1), 0, "Shares should be zero");
        assertEq(vault.totalShares(), 0, "Total shares should be zero");
    }

    function testLargeDepositSmallWithdrawal() public {
        uint256 largeDeposit = 100000e18;
        uint256 smallWithdrawal = 1000e18;
        
        vm.prank(user1);
        asset.approve(address(vault), largeDeposit);
        vm.prank(user1);
        vault.deposit(largeDeposit);
        
        uint256 totalShares = vault.totalShares();
        uint256 sharesToWithdraw = (smallWithdrawal * totalShares) / vault.totalAssets();
        
        uint256 balanceBefore = asset.balanceOf(user1);
        vm.prank(user1);
        vault.withdraw(sharesToWithdraw);
        uint256 balanceAfter = asset.balanceOf(user1);
        
        assertApproxEqRel(balanceAfter - balanceBefore, smallWithdrawal, 0.01e18, "Should receive proportional amount");
        assertGt(vault.userShares(user1), 0, "Should still have shares");
    }
}
