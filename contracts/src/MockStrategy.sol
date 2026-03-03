// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./StrategyBase.sol";

/**
 * @title MockStrategy
 * @notice Mock strategy for testing purposes
 * @dev Simulates a yield strategy with configurable yield rate
 */
contract MockStrategy is StrategyBase {
    /// @notice Annual yield rate in basis points (e.g., 500 = 5%)
    uint256 public yieldRate;

    /// @notice Last harvest timestamp
    uint256 public lastHarvest;

    /// @notice Time period for yield calculation (default: 1 year = 365 days)
    uint256 public constant YIELD_PERIOD = 365 days;

    /// @notice Events
    event YieldRateUpdated(uint256 newRate);

    constructor(
        address _asset,
        string memory _name,
        uint256 _yieldRate,
        address _owner
    ) StrategyBase(_asset, _name, _owner) {
        yieldRate = _yieldRate;
        lastHarvest = block.timestamp;
    }

    /**
     * @notice Set the yield rate
     * @param _yieldRate New yield rate in basis points
     */
    function setYieldRate(uint256 _yieldRate) external onlyOwner {
        require(_yieldRate <= 10000, "MockStrategy: yield rate too high");
        yieldRate = _yieldRate;
        emit YieldRateUpdated(_yieldRate);
    }

    /**
     * @notice Internal deposit function - just holds assets
     * @param amount Amount deposited
     */
    function _deposit(uint256 amount) internal override {
        // Mock strategy just holds the assets
        // In a real strategy, this would deploy assets to a yield protocol
    }

    /**
     * @notice Internal withdraw function - returns assets
     * @param amount Amount to withdraw
     */
    function _withdraw(uint256 amount) internal override {
        // Mock strategy just returns the assets
        // In a real strategy, this would withdraw from a yield protocol
    }

    /**
     * @notice Internal harvest function - calculates and mints yield
     * @return yield Amount of yield generated
     */
    function _harvest() internal override returns (uint256 yield) {
        if (totalAssets == 0 || yieldRate == 0) {
            return 0;
        }

        uint256 timeElapsed = block.timestamp - lastHarvest;
        if (timeElapsed == 0) {
            return 0;
        }

        // Calculate yield: (totalAssets * yieldRate * timeElapsed) / (YIELD_PERIOD * 10000)
        yield = (totalAssets * yieldRate * timeElapsed) / (YIELD_PERIOD * 10000);
        
        if (yield > 0) {
            // In a real scenario, yield would come from the protocol
            // For mock, we simulate by minting or transferring from a mock yield source
            // For now, we just update the timestamp
            lastHarvest = block.timestamp;
        }

        return yield;
    }

    /**
     * @notice Get current value including accrued yield
     * @return value Current value of assets plus accrued yield
     */
    function _getValue() internal view override returns (uint256 value) {
        if (totalAssets == 0 || yieldRate == 0) {
            return totalAssets;
        }

        uint256 timeElapsed = block.timestamp - lastHarvest;
        if (timeElapsed == 0) {
            return totalAssets;
        }

        // Calculate accrued yield
        uint256 accruedYield = (totalAssets * yieldRate * timeElapsed) / (YIELD_PERIOD * 10000);
        value = totalAssets + accruedYield;

        return value;
    }
}
