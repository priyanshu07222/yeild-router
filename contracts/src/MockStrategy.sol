// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./StrategyBase.sol";

/**
 * @title MockStrategy
 * @notice Mock strategy contract for testing purposes
 * @dev Simulates a yield strategy by tracking deposits and withdrawals
 */
contract MockStrategy is StrategyBase {
    /// @notice Total amount deposited in the strategy
    uint256 public totalDeposited;

    /**
     * @notice Deposit assets into the strategy
     * @param amount Amount of assets to deposit
     */
    function deposit(uint256 amount) external override {
        totalDeposited += amount;
    }

    /**
     * @notice Withdraw assets from the strategy
     * @param amount Amount of assets to withdraw
     */
    function withdraw(uint256 amount) external override {
        require(totalDeposited >= amount, "MockStrategy: insufficient balance");
        totalDeposited -= amount;
    }

    /**
     * @notice Get the total assets in the strategy
     * @return Total assets deposited in the strategy
     */
    function totalAssets() external view override returns (uint256) {
        return totalDeposited;
    }
}
