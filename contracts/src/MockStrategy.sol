// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./StrategyBase.sol";

/**
 * @title MockStrategy
 * @notice Mock strategy contract that simulates yield opportunities
 * @dev Implements StrategyBase with simulated yield based on APY
 */
contract MockStrategy is StrategyBase {
    using SafeERC20 for IERC20;

    /// @notice The underlying asset token
    IERC20 public asset;

    /// @notice Total amount deposited in the strategy
    uint256 public totalDeposited;

    /// @notice Annual Percentage Yield in basis points (e.g., 500 = 5%)
    uint256 public apy;

    /// @notice Events
    event Deposited(uint256 amount);
    event Withdrawn(uint256 amount);
    event APYUpdated(uint256 newAPY);

    /**
     * @notice Constructor
     * @param _asset Address of the ERC20 asset token
     */
    constructor(address _asset) {
        require(_asset != address(0), "MockStrategy: invalid asset address");
        asset = IERC20(_asset);
    }

    /**
     * @notice Set the APY for this strategy
     * @param _apy Annual Percentage Yield in basis points
     */
    function setAPY(uint256 _apy) external {
        require(_apy <= 10000, "MockStrategy: APY cannot exceed 100%");
        apy = _apy;
        emit APYUpdated(_apy);
    }

    /**
     * @notice Deposit assets into the strategy
     * @param amount Amount of assets to deposit
     */
    function deposit(uint256 amount) external override {
        require(amount > 0, "MockStrategy: amount must be greater than 0");
        
        // Transfer tokens from caller
        asset.safeTransferFrom(msg.sender, address(this), amount);
        
        totalDeposited += amount;
        emit Deposited(amount);
    }

    /**
     * @notice Withdraw assets from the strategy
     * @param amount Amount of assets to withdraw
     */
    function withdraw(uint256 amount) external override {
        require(amount > 0, "MockStrategy: amount must be greater than 0");
        require(totalDeposited >= amount, "MockStrategy: insufficient balance");
        
        totalDeposited -= amount;
        
        // Transfer tokens back to caller
        asset.safeTransfer(msg.sender, amount);
        emit Withdrawn(amount);
    }

    /**
     * @notice Get the total assets in the strategy including simulated yield
     * @return Total assets with simulated yield: totalDeposited + (totalDeposited * apy / 10000)
     */
    function totalAssets() external view override returns (uint256) {
        if (totalDeposited == 0 || apy == 0) {
            return totalDeposited;
        }
        // Simulated yield: totalDeposited + (totalDeposited * apy / 10000)
        return totalDeposited + (totalDeposited * apy / 10000);
    }
}
