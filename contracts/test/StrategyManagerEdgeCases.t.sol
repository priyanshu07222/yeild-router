// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {StrategyManager} from "../src/StrategyManager.sol";
import {StrategyOptimizerAdapter} from "../src/StrategyOptimizerAdapter.sol";
import {MockStrategy} from "../src/MockStrategy.sol";
import {MockERC20} from "./Vault.t.sol";

contract StrategyManagerEdgeCasesTest is Test {
    StrategyOptimizerAdapter public optimizer;
    StrategyManager public strategyManager;
    MockERC20 public asset;
    MockStrategy public strategy1;
    MockStrategy public strategy2;
    MockStrategy public strategy3;
    MockStrategy public strategy4;

    address public owner = address(this);
    address public nonOwner = address(0x999);

    function setUp() public {
        asset = new MockERC20();
        optimizer = new StrategyOptimizerAdapter(address(0));
        strategyManager = new StrategyManager(owner, address(optimizer));
        
        strategy1 = new MockStrategy(address(asset));
        strategy2 = new MockStrategy(address(asset));
        strategy3 = new MockStrategy(address(asset));
        strategy4 = new MockStrategy(address(asset));
    }

    function testAddManyStrategies() public {
        // Add multiple strategies
        for (uint256 i = 0; i < 10; i++) {
            MockStrategy newStrategy = new MockStrategy(address(asset));
            newStrategy.setAPY(uint256(500 + i * 100)); // Different APYs
            strategyManager.addStrategy(address(newStrategy), uint256(500 + i * 100), 1284 + i, 2 + (i % 9));
        }
        
        assertEq(strategyManager.getStrategyCount(), 10, "Should have 10 strategies");
        
        // Best strategy should be the one with highest APY (1400 = 14%)
        address bestStrategy = strategyManager.getBestStrategy();
        assertTrue(bestStrategy != address(0), "Should have a best strategy");
    }

    function testUpdateAPYToZero() public {
        strategyManager.addStrategy(address(strategy1), 1000, 1284, 3);
        
        strategyManager.updateAPY(0, 0); // Update strategy at index 0
        
        StrategyManager.Strategy memory strategy = strategyManager.getStrategy(0);
        assertEq(strategy.apy, 0, "APY should be updated to 0");
    }

    function testUpdateAPYToMaximum() public {
        strategyManager.addStrategy(address(strategy1), 1000, 1284, 3);
        
        strategyManager.updateAPY(0, 10000); // 100%, strategy at index 0
        
        StrategyManager.Strategy memory strategy = strategyManager.getStrategy(0);
        assertEq(strategy.apy, 10000, "APY should be updated to 100%");
    }

    function testDeactivateAndReactivateStrategy() public {
        strategyManager.addStrategy(address(strategy1), 1000, 1284, 3);
        strategyManager.addStrategy(address(strategy2), 500, 592, 2);
        
        // Deactivate strategy1 (using index 0)
        strategyManager.deactivateStrategy(0);
        
        // Best strategy should now be strategy2
        address bestStrategy = strategyManager.getBestStrategy();
        assertEq(bestStrategy, address(strategy2), "Best strategy should be strategy2");
    }

    function testGetBestStrategyWithTies() public {
        strategyManager.addStrategy(address(strategy1), 1000, 1284, 3);
        strategyManager.addStrategy(address(strategy2), 1000, 592, 4); // Same APY and risk
        
        // Should return one of them (implementation dependent)
        address bestStrategy = strategyManager.getBestStrategy();
        assertTrue(
            bestStrategy == address(strategy1) || bestStrategy == address(strategy2),
            "Should return one of the tied strategies"
        );
    }

    function testUpdateAPYMultipleTimes() public {
        strategyManager.addStrategy(address(strategy1), 500, 1284, 2);
        
        strategyManager.updateAPY(0, 1000); // Update strategy at index 0
        StrategyManager.Strategy memory strategy = strategyManager.getStrategy(0);
        assertEq(strategy.apy, 1000, "First update should work");
        
        strategyManager.updateAPY(0, 1500);
        strategy = strategyManager.getStrategy(0);
        assertEq(strategy.apy, 1500, "Second update should work");
        
        strategyManager.updateAPY(0, 2000);
        strategy = strategyManager.getStrategy(0);
        assertEq(strategy.apy, 2000, "Third update should work");
    }

    function testAddStrategyWithZeroAPY() public {
        strategyManager.addStrategy(address(strategy1), 0, 1284, 1);
        
        StrategyManager.Strategy memory strategy = strategyManager.getStrategy(0);
        assertEq(strategy.apy, 0, "Should allow zero APY");
        assertEq(strategy.active, true, "Should be active");
    }

    function testGetStrategyCount() public {
        assertEq(strategyManager.getStrategyCount(), 0, "Initial count should be 0");
        
        strategyManager.addStrategy(address(strategy1), 500, 1284, 2);
        assertEq(strategyManager.getStrategyCount(), 1, "Count should be 1");
        
        strategyManager.addStrategy(address(strategy2), 1000, 592, 4);
        assertEq(strategyManager.getStrategyCount(), 2, "Count should be 2");
        
        strategyManager.addStrategy(address(strategy3), 1500, 2034, 5);
        assertEq(strategyManager.getStrategyCount(), 3, "Count should be 3");
    }

    function testBestStrategyChangesAfterAPYUpdate() public {
        strategyManager.addStrategy(address(strategy1), 500, 1284, 2);
        strategyManager.addStrategy(address(strategy2), 1000, 592, 4);
        
        // Strategy2 should be best initially
        assertEq(strategyManager.getBestStrategy(), address(strategy2), "Strategy2 should be best");
        
        // Update strategy1 (index 0) to be better
        strategyManager.updateAPY(0, 2000);
        
        // Strategy1 should now be best
        assertEq(strategyManager.getBestStrategy(), address(strategy1), "Strategy1 should be best");
    }

    function testDeactivateAllStrategies() public {
        strategyManager.addStrategy(address(strategy1), 500, 1284, 2);
        strategyManager.addStrategy(address(strategy2), 1000, 592, 4);
        
        // Deactivate all (using indices 0 and 1)
        strategyManager.deactivateStrategy(0);
        strategyManager.deactivateStrategy(1);
        
        // Should revert when getting best strategy
        vm.expectRevert("StrategyManager: no active strategies");
        strategyManager.getBestStrategy();
    }

    function testAddDuplicateStrategy() public {
        strategyManager.addStrategy(address(strategy1), 500, 1284, 2);
        
        // StrategyManager allows adding the same strategy address multiple times
        // (This is a design choice - strategies are identified by index, not address)
        // So we test that it's allowed
        strategyManager.addStrategy(address(strategy1), 1000, 1284, 3);
        
        assertEq(strategyManager.getStrategyCount(), 2, "Should have 2 strategies");
        assertEq(strategyManager.getStrategy(0).strategy, address(strategy1), "First strategy should match");
        assertEq(strategyManager.getStrategy(1).strategy, address(strategy1), "Second strategy should also match");
    }

    function testUpdateNonExistentStrategy() public {
        vm.expectRevert("StrategyManager: invalid strategy ID");
        strategyManager.updateAPY(999, 1000); // Invalid index
    }

    function testDeactivateNonExistentStrategy() public {
        vm.expectRevert("StrategyManager: invalid strategy ID");
        strategyManager.deactivateStrategy(999); // Invalid index
    }

    function testGetStrategyByIndex() public {
        strategyManager.addStrategy(address(strategy1), 500, 1284, 2);
        strategyManager.addStrategy(address(strategy2), 1000, 592, 4);
        strategyManager.addStrategy(address(strategy3), 1500, 2034, 5);
        
        StrategyManager.Strategy memory s1 = strategyManager.getStrategy(0);
        StrategyManager.Strategy memory s2 = strategyManager.getStrategy(1);
        StrategyManager.Strategy memory s3 = strategyManager.getStrategy(2);
        
        assertEq(s1.strategy, address(strategy1), "First strategy should match");
        assertEq(s2.strategy, address(strategy2), "Second strategy should match");
        assertEq(s3.strategy, address(strategy3), "Third strategy should match");
    }

    function testBestStrategyWithSingleStrategy() public {
        strategyManager.addStrategy(address(strategy1), 500, 1284, 2);
        
        address bestStrategy = strategyManager.getBestStrategy();
        assertEq(bestStrategy, address(strategy1), "Single strategy should be best");
    }

    function testAPYBoundaryValues() public {
        strategyManager.addStrategy(address(strategy1), 1, 1284, 1); // Minimum APY, Minimum risk
        strategyManager.addStrategy(address(strategy2), 10000, 592, 10); // Maximum APY, Maximum risk
        
        StrategyManager.Strategy memory s1 = strategyManager.getStrategy(0);
        StrategyManager.Strategy memory s2 = strategyManager.getStrategy(1);
        
        assertEq(s1.apy, 1, "Should accept minimum APY");
        assertEq(s2.apy, 10000, "Should accept maximum APY");
        
        // Best should be strategy2
        assertEq(strategyManager.getBestStrategy(), address(strategy2), "Highest APY should be best");
    }
}
