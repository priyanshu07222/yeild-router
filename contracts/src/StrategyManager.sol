// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./StrategyBase.sol";

/**
 * @title StrategyManager
 * @notice Manages multiple yield strategies and allocates funds across them
 * @dev Handles strategy registration, allocation, and rebalancing
 */
contract StrategyManager is Ownable, ReentrancyGuard {
    /// @notice Array of registered strategies
    address[] public strategies;

    /// @notice Mapping of strategy address to strategy information
    mapping(address => Strategy) public strategyInfo;

    /// @notice Mapping to check if a strategy is registered
    mapping(address => bool) public isStrategy;

    /// @notice Maximum number of strategies allowed
    uint256 public maxStrategies = 10;

    /// @notice Struct to store strategy information
    struct Strategy {
        address strategy;      // Strategy contract address
        uint256 apy;           // Annual Percentage Yield in basis points (e.g., 500 = 5%)
        bool active;           // Whether the strategy is active
        uint256 allocatedAmount; // Amount currently allocated to this strategy
        uint256 targetAllocation; // Target allocation percentage (basis points, e.g., 5000 = 50%)
    }

    /// @notice Events
    event StrategyRegistered(address indexed strategy);
    event StrategyUnregistered(address indexed strategy);
    event StrategyAllocated(address indexed strategy, uint256 amount);
    event StrategyDeallocated(address indexed strategy, uint256 amount);
    event Rebalanced(address[] strategies, uint256[] amounts);

    constructor(address _owner) Ownable(_owner) {}

    /**
     * @notice Register a new strategy
     * @param strategy Address of the strategy contract
     */
    function registerStrategy(address strategy) external onlyOwner {
        require(strategy != address(0), "StrategyManager: invalid strategy address");
        require(!isStrategy[strategy], "StrategyManager: strategy already registered");
        require(strategies.length < maxStrategies, "StrategyManager: max strategies reached");

        strategies.push(strategy);
        isStrategy[strategy] = true;
        strategyInfo[strategy].strategy = strategy;
        strategyInfo[strategy].active = true;
        strategyInfo[strategy].allocatedAmount = 0;

        emit StrategyRegistered(strategy);
    }

    /**
     * @notice Unregister a strategy
     * @param strategy Address of the strategy contract
     */
    function unregisterStrategy(address strategy) external onlyOwner {
        require(isStrategy[strategy], "StrategyManager: strategy not registered");
        require(strategyInfo[strategy].allocatedAmount == 0, "StrategyManager: strategy has allocated funds");

        // Remove from strategies array
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i] == strategy) {
                strategies[i] = strategies[strategies.length - 1];
                strategies.pop();
                break;
            }
        }

        isStrategy[strategy] = false;
        strategyInfo[strategy].active = false;

        emit StrategyUnregistered(strategy);
    }

    /**
     * @notice Allocate funds to a strategy
     * @param strategy Address of the strategy
     * @param amount Amount to allocate
     */
    function allocateToStrategy(address strategy, uint256 amount) external nonReentrant {
        require(isStrategy[strategy], "StrategyManager: strategy not registered");
        require(strategyInfo[strategy].active, "StrategyManager: strategy not active");

        StrategyBase(strategy).deposit(amount);
        strategyInfo[strategy].allocatedAmount += amount;

        emit StrategyAllocated(strategy, amount);
    }

    /**
     * @notice Deallocate funds from a strategy
     * @param strategy Address of the strategy
     * @param amount Amount to deallocate
     */
    function deallocateFromStrategy(address strategy, uint256 amount) external nonReentrant {
        require(isStrategy[strategy], "StrategyManager: strategy not registered");
        require(strategyInfo[strategy].allocatedAmount >= amount, "StrategyManager: insufficient allocation");

        StrategyBase(strategy).withdraw(amount);
        strategyInfo[strategy].allocatedAmount -= amount;

        emit StrategyDeallocated(strategy, amount);
    }

    /**
     * @notice Set APY for a strategy
     * @param strategy Address of the strategy
     * @param apy APY in basis points (e.g., 500 = 5%)
     */
    function setStrategyAPY(address strategy, uint256 apy) external onlyOwner {
        require(isStrategy[strategy], "StrategyManager: strategy not registered");
        require(apy <= 10000, "StrategyManager: invalid APY (max 100%)");

        strategyInfo[strategy].apy = apy;
    }

    /**
     * @notice Set target allocation for a strategy
     * @param strategy Address of the strategy
     * @param targetAllocation Target allocation in basis points (e.g., 5000 = 50%)
     */
    function setTargetAllocation(address strategy, uint256 targetAllocation) external onlyOwner {
        require(isStrategy[strategy], "StrategyManager: strategy not registered");
        require(targetAllocation <= 10000, "StrategyManager: invalid allocation percentage");

        strategyInfo[strategy].targetAllocation = targetAllocation;
    }

    /**
     * @notice Get total allocated amount across all strategies
     * @return total Total allocated amount
     */
    function getTotalAllocated() external view returns (uint256 total) {
        for (uint256 i = 0; i < strategies.length; i++) {
            total += strategyInfo[strategies[i]].allocatedAmount;
        }
    }

    /**
     * @notice Get strategy information
     * @param strategy Address of the strategy
     * @return Strategy struct with all strategy information
     */
    function getStrategy(address strategy) external view returns (Strategy memory) {
        require(isStrategy[strategy], "StrategyManager: strategy not registered");
        return strategyInfo[strategy];
    }

    /**
     * @notice Get number of registered strategies
     * @return count Number of strategies
     */
    function getStrategyCount() external view returns (uint256) {
        return strategies.length;
    }

    /**
     * @notice Get all registered strategies
     * @return Array of strategy addresses
     */
    function getAllStrategies() external view returns (address[] memory) {
        return strategies;
    }
}
