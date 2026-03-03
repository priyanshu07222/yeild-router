// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./StrategyBase.sol";

/**
 * @title StrategyManager
 * @notice Manages multiple yield strategies and finds the best one
 * @dev Only owner can modify strategies
 */
contract StrategyManager is Ownable {
    /// @notice Struct to store strategy information
    struct Strategy {
        address strategy;  // Strategy contract address
        uint256 apy;       // Annual Percentage Yield in basis points
        bool active;       // Whether the strategy is active
    }

    /// @notice Array of strategies
    Strategy[] public strategies;

    /// @notice Events
    event StrategyAdded(address indexed strategy, uint256 apy);
    event APYUpdated(uint256 indexed strategyId, uint256 newAPY);
    event StrategyDeactivated(uint256 indexed strategyId);

    constructor(address _owner) Ownable(_owner) {}

    /**
     * @notice Add a new strategy
     * @param strategy Address of the strategy contract
     * @param apy Annual Percentage Yield in basis points (e.g., 500 = 5%)
     */
    function addStrategy(address strategy, uint256 apy) external onlyOwner {
        require(strategy != address(0), "StrategyManager: invalid strategy address");
        require(apy <= 10000, "StrategyManager: APY cannot exceed 100%");
        
        strategies.push(Strategy({
            strategy: strategy,
            apy: apy,
            active: true
        }));

        emit StrategyAdded(strategy, apy);
    }

    /**
     * @notice Update the APY of a strategy
     * @param strategyId Index of the strategy in the strategies array
     * @param newAPY New APY value in basis points
     */
    function updateAPY(uint256 strategyId, uint256 newAPY) external onlyOwner {
        require(strategyId < strategies.length, "StrategyManager: invalid strategy ID");
        require(newAPY <= 10000, "StrategyManager: APY cannot exceed 100%");
        
        strategies[strategyId].apy = newAPY;
        emit APYUpdated(strategyId, newAPY);
    }

    /**
     * @notice Deactivate a strategy
     * @param strategyId Index of the strategy to deactivate
     */
    function deactivateStrategy(uint256 strategyId) external onlyOwner {
        require(strategyId < strategies.length, "StrategyManager: invalid strategy ID");
        strategies[strategyId].active = false;
        emit StrategyDeactivated(strategyId);
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

    /**
     * @notice Get strategy information by ID
     * @param id Index of the strategy
     * @return Strategy struct with strategy information
     */
    function getStrategy(uint256 id) external view returns (Strategy memory) {
        require(id < strategies.length, "StrategyManager: invalid strategy ID");
        return strategies[id];
    }

    /**
     * @notice Get total number of strategies
     * @return Number of strategies
     */
    function getStrategyCount() external view returns (uint256) {
        return strategies.length;
    }
}
