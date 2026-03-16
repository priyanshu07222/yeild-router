// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./StrategyBase.sol";
import "./StrategyOptimizerAdapter.sol";

/**
 * @title StrategyManager
 * @notice Manages multiple yield strategies and finds the best one
 * @dev Only owner can modify strategies
 */
contract StrategyManager is Ownable {
    /// @notice Struct to store strategy information (see README: chainId = EVM chain ID for network identity).
    struct Strategy {
        address strategy;  // Strategy contract address
        uint256 apy;       // Annual Percentage Yield in basis points
        uint256 chainId;   // EVM chain ID: network identity, frontend, RPC (e.g. Moonbeam=1284, Astar=592, HydraDX=2034)
        uint256 riskScore; // Risk score from 1 (lowest) to 10 (highest)
        bool active;       // Whether the strategy is active
    }

    /// @notice Array of strategies
    Strategy[] public strategies;

    /// @notice Events
    event StrategyAdded(address indexed strategy, uint256 apy, uint256 chainId, uint256 riskScore);
    event APYUpdated(uint256 indexed strategyId, uint256 newAPY);
    event StrategyDeactivated(uint256 indexed strategyId);

    /// @notice Adapter: invokes Rust optimizer (contract or precompile) or Solidity fallback (see README).
    StrategyOptimizerAdapter public optimizer;

    /// @param _owner Owner of the strategy manager
    /// @param _optimizer Address of the StrategyOptimizerAdapter (deployed separately, e.g. in DeployVault)
    constructor(address _owner, address _optimizer) Ownable(_owner) {
        require(_optimizer != address(0), "StrategyManager: invalid optimizer address");
        optimizer = StrategyOptimizerAdapter(_optimizer);
    }

    /**
     * @notice Add a new strategy
     * @param strategy Address of the strategy contract
     * @param apy Annual Percentage Yield in basis points (e.g., 500 = 5%)
     * @param chainId EVM chain ID for network identity (e.g. Moonbeam=1284, Astar=592, HydraDX=2034). See README; production XCM uses parachain IDs.
     * @param riskScore Risk score from 1 (lowest risk) to 10 (highest risk)
     */
    function addStrategy(
        address strategy,
        uint256 apy,
        uint256 chainId,
        uint256 riskScore
    ) external onlyOwner {
        require(strategy != address(0), "StrategyManager: invalid strategy address");
        require(apy <= 10000, "StrategyManager: APY cannot exceed 100%");
        require(riskScore >= 1 && riskScore <= 10, "StrategyManager: risk score must be between 1 and 10");
        
        strategies.push(Strategy({
            strategy: strategy,
            apy: apy,
            chainId: chainId,
            riskScore: riskScore,
            active: true
        }));

        emit StrategyAdded(strategy, apy, chainId, riskScore);
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
     * @notice Get the strategy with the highest risk-adjusted score
     * @dev Score = APY - (riskScore * 100)
     * @dev Higher score is better (balances yield vs risk)
     * @return Address of the strategy with the highest score
     */
    function getBestStrategy() external view returns (address) {
        require(strategies.length > 0, "StrategyManager: no strategies available");

        // Build arrays for active strategies only, plus an index map back to `strategies`.
        uint256 activeCount = 0;
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i].active) activeCount++;
        }

        require(activeCount > 0, "StrategyManager: no active strategies");

        uint256[] memory apys = new uint256[](activeCount);
        uint256[] memory risks = new uint256[](activeCount);
        uint256[] memory indexMap = new uint256[](activeCount);

        uint256 j = 0;
        for (uint256 i = 0; i < strategies.length; i++) {
            if (!strategies[i].active) continue;
            apys[j] = strategies[i].apy;
            risks[j] = strategies[i].riskScore;
            indexMap[j] = i;
            j++;
        }

        uint256 bestActiveIndex = optimizer.getBestStrategyIndex(apys, risks);
        uint256 bestIndex = indexMap[bestActiveIndex];
        return strategies[bestIndex].strategy;
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
     * @notice Get the EVM chain ID for a given strategy address (network identity; see README).
     * @param strategy Strategy contract address
     * @return chainId EVM chain ID (e.g. 1284, 592, 2034). For XCM routing in production use parachain IDs from docs.
     */
    function getStrategyChain(address strategy) external view returns (uint256 chainId) {
        require(strategy != address(0), "StrategyManager: invalid strategy address");

        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i].strategy == strategy) {
                return strategies[i].chainId;
            }
        }

        revert("StrategyManager: strategy not found");
    }

    /**
     * @notice Get total number of strategies
     * @return Number of strategies
     */
    function getStrategyCount() external view returns (uint256) {
        return strategies.length;
    }
}
