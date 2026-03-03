// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title StrategyBase
 * @notice Abstract base contract for yield strategies
 * @dev This contract defines the interface that all yield strategies must implement
 */
abstract contract StrategyBase {
    /**
     * @notice Deposit assets into the strategy
     * @param amount Amount of assets to deposit
     */
    function deposit(uint256 amount) external virtual;

    /**
     * @notice Withdraw assets from the strategy
     * @param amount Amount of assets to withdraw
     */
    function withdraw(uint256 amount) external virtual;

    /**
     * @notice Get the total assets in the strategy
     * @return Total assets deposited in the strategy
     */
    function totalAssets() external view virtual returns (uint256);
}
