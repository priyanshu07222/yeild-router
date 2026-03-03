// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {StrategyManager} from "../src/StrategyManager.sol";
import {MockStrategy} from "../src/MockStrategy.sol";
import {MockERC20} from "./Vault.t.sol";

contract StrategyManagerTest is Test {
    StrategyManager public strategyManager;
    MockERC20 public asset;
    MockStrategy public moonbeamStrategy;
    MockStrategy public astarStrategy;
    MockStrategy public hydrationStrategy;

    address public owner = address(this);
    address public nonOwner = address(0x999);

    function setUp() public {
        // Deploy mock ERC20 token
        asset = new MockERC20();
        
        // Deploy StrategyManager
        strategyManager = new StrategyManager(owner);
        
        // Deploy MockStrategies
        moonbeamStrategy = new MockStrategy(address(asset));
        astarStrategy = new MockStrategy(address(asset));
        hydrationStrategy = new MockStrategy(address(asset));
    }

    function testAddStrategy() public {
        uint256 moonbeamAPY = 500; // 5%
        uint256 astarAPY = 1000;   // 10%
        
        // Add Moonbeam strategy
        strategyManager.addStrategy(address(moonbeamStrategy), moonbeamAPY);
        
        // Verify storage
        (address strategy, uint256 apy, bool active) = strategyManager.strategies(0);
        assertEq(strategy, address(moonbeamStrategy), "Strategy address should match");
        assertEq(apy, moonbeamAPY, "APY should match");
        assertEq(active, true, "Strategy should be active");
        
        // Add Astar strategy
        strategyManager.addStrategy(address(astarStrategy), astarAPY);
        
        // Verify second strategy
        (strategy, apy, active) = strategyManager.strategies(1);
        assertEq(strategy, address(astarStrategy), "Second strategy address should match");
        assertEq(apy, astarAPY, "Second APY should match");
        assertEq(active, true, "Second strategy should be active");
        
        // Verify count
        assertEq(strategyManager.getStrategyCount(), 2, "Should have 2 strategies");
    }

    function testAddStrategyOnlyOwner() public {
        vm.prank(nonOwner);
        vm.expectRevert();
        strategyManager.addStrategy(address(moonbeamStrategy), 500);
    }

    function testAddStrategyInvalidAddress() public {
        vm.expectRevert("StrategyManager: invalid strategy address");
        strategyManager.addStrategy(address(0), 500);
    }

    function testAddStrategyInvalidAPY() public {
        vm.expectRevert("StrategyManager: APY cannot exceed 100%");
        strategyManager.addStrategy(address(moonbeamStrategy), 10001);
    }

    function testUpdateAPY() public {
        uint256 initialAPY = 500; // 5%
        uint256 newAPY = 800;      // 8%
        
        // Add strategy
        strategyManager.addStrategy(address(moonbeamStrategy), initialAPY);
        
        // Verify initial APY
        (, uint256 apy, ) = strategyManager.strategies(0);
        assertEq(apy, initialAPY, "Initial APY should be 5%");
        
        // Update APY
        strategyManager.updateAPY(0, newAPY);
        
        // Verify APY updated
        (, apy, ) = strategyManager.strategies(0);
        assertEq(apy, newAPY, "APY should be updated to 8%");
    }

    function testUpdateAPYOnlyOwner() public {
        strategyManager.addStrategy(address(moonbeamStrategy), 500);
        
        vm.prank(nonOwner);
        vm.expectRevert();
        strategyManager.updateAPY(0, 800);
    }

    function testUpdateAPYInvalidId() public {
        vm.expectRevert("StrategyManager: invalid strategy ID");
        strategyManager.updateAPY(0, 800);
    }

    function testGetBestStrategy() public {
        uint256 moonbeamAPY = 500;  // 5%
        uint256 astarAPY = 1000;    // 10%
        uint256 hydrationAPY = 300;  // 3%
        
        // Add strategies
        strategyManager.addStrategy(address(moonbeamStrategy), moonbeamAPY);
        strategyManager.addStrategy(address(astarStrategy), astarAPY);
        strategyManager.addStrategy(address(hydrationStrategy), hydrationAPY);
        
        // Get best strategy (should be Astar with 10% APY)
        address bestStrategy = strategyManager.getBestStrategy();
        assertEq(bestStrategy, address(astarStrategy), "Best strategy should be Astar");
        
        // Update Moonbeam APY to be highest
        strategyManager.updateAPY(0, 1500); // 15%
        
        // Get best strategy again (should now be Moonbeam)
        bestStrategy = strategyManager.getBestStrategy();
        assertEq(bestStrategy, address(moonbeamStrategy), "Best strategy should now be Moonbeam");
    }

    function testGetBestStrategyNoStrategies() public {
        vm.expectRevert("StrategyManager: no strategies available");
        strategyManager.getBestStrategy();
    }

    function testGetBestStrategyNoActiveStrategies() public {
        strategyManager.addStrategy(address(moonbeamStrategy), 500);
        strategyManager.addStrategy(address(astarStrategy), 1000);
        
        // Deactivate all strategies
        strategyManager.deactivateStrategy(0);
        strategyManager.deactivateStrategy(1);
        
        vm.expectRevert("StrategyManager: no active strategies");
        strategyManager.getBestStrategy();
    }

    function testDeactivateStrategy() public {
        strategyManager.addStrategy(address(moonbeamStrategy), 500);
        
        // Verify active
        (, , bool active) = strategyManager.strategies(0);
        assertEq(active, true, "Strategy should be active");
        
        // Deactivate
        strategyManager.deactivateStrategy(0);
        
        // Verify deactivated
        (, , active) = strategyManager.strategies(0);
        assertEq(active, false, "Strategy should be deactivated");
    }

    function testGetStrategy() public {
        uint256 moonbeamAPY = 500;
        strategyManager.addStrategy(address(moonbeamStrategy), moonbeamAPY);
        
        StrategyManager.Strategy memory strategy = strategyManager.getStrategy(0);
        assertEq(strategy.strategy, address(moonbeamStrategy), "Strategy address should match");
        assertEq(strategy.apy, moonbeamAPY, "APY should match");
        assertEq(strategy.active, true, "Strategy should be active");
    }

    function testGetStrategyInvalidId() public {
        vm.expectRevert("StrategyManager: invalid strategy ID");
        strategyManager.getStrategy(0);
    }
}
