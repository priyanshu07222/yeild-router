// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./StrategyBase.sol";

/**
 * @title StrategyManager
 * @notice Manages multiple yield strategies
 * @dev Stores strategies and provides functions to add, update, and find the best strategy
 */
contract StrategyManager {
    /// @notice Struct to store strategy information
    struct Strategy {
        address strategy;  // Strategy contract address
        uint256 apy;       // Annual Percentage Yield
        bool active;       // Whether the strategy is active
    }

    /// @notice Array of strategies
    Strategy[] public strategies;

    /**
     * @notice Add a new strategy
     * @param strategy Address of the strategy contract
     * @param apy Annual Percentage Yield for the strategy
     */
    function addStrategy(address strategy, uint256 apy) external {
        require(strategy != address(0), "StrategyManager: invalid strategy address");
        
        strategies.push(Strategy({
            strategy: strategy,
            apy: apy,
            active: true
        }));
    }

    /**
     * @notice Update the APY of a strategy
     * @param strategyId Index of the strategy in the strategies array
     * @param newAPY New APY value
     */
    function updateAPY(uint256 strategyId, uint256 newAPY) external {
        require(strategyId < strategies.length, "StrategyManager: invalid strategy ID");
        
        strategies[strategyId].apy = newAPY;
    }

    /**
     * @notice Get the strategy with the highest APY
     * @return Address of the strategy with the highest APY
     */
    function getBestStrategy() external view returns (address) {
        require(strategies.length > 0, "StrategyManager: no strategies available");
        
        uint256 bestAPY = 0;
        address bestStrategy = address(0);
        
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i].active && strategies[i].apy > bestAPY) {
                bestAPY = strategies[i].apy;
                bestStrategy = strategies[i].strategy;
            }
        }
        
        require(bestStrategy != address(0), "StrategyManager: no active strategies");
        return bestStrategy;
    }
}
