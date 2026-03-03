// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StrategyBase
 * @notice Base contract for all yield strategies
 * @dev All strategies should inherit from this contract and implement the abstract functions
 */
abstract contract StrategyBase is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice The underlying asset token
    IERC20 public asset;

    /// @notice Total assets deposited in this strategy
    uint256 public totalAssets;

    /// @notice Strategy name
    string public name;

    /// @notice Events
    event Deposited(uint256 amount);
    event Withdrawn(uint256 amount);
    event Harvested(uint256 yield);

    constructor(address _asset, string memory _name, address _owner) Ownable(_owner) {
        asset = IERC20(_asset);
        name = _name;
    }

    /**
     * @notice Deposit assets into the strategy
     * @param amount Amount of assets to deposit
     */
    function deposit(uint256 amount) external virtual nonReentrant {
        require(amount > 0, "StrategyBase: amount must be greater than 0");
        
        asset.safeTransferFrom(msg.sender, address(this), amount);
        totalAssets += amount;

        _deposit(amount);
        emit Deposited(amount);
    }

    /**
     * @notice Withdraw assets from the strategy
     * @param amount Amount of assets to withdraw
     */
    function withdraw(uint256 amount) external virtual nonReentrant {
        require(amount > 0, "StrategyBase: amount must be greater than 0");
        require(totalAssets >= amount, "StrategyBase: insufficient assets");

        _withdraw(amount);
        totalAssets -= amount;

        asset.safeTransfer(msg.sender, amount);
        emit Withdrawn(amount);
    }

    /**
     * @notice Harvest yield from the strategy
     * @return yield Amount of yield harvested
     */
    function harvest() external virtual returns (uint256 yield) {
        yield = _harvest();
        if (yield > 0) {
            emit Harvested(yield);
        }
        return yield;
    }

    /**
     * @notice Get the current value of assets in the strategy
     * @return value Current value of assets
     */
    function getValue() external view virtual returns (uint256) {
        return _getValue();
    }

    /**
     * @notice Internal function to handle deposit logic (to be implemented by child contracts)
     * @param amount Amount of assets to deposit
     */
    function _deposit(uint256 amount) internal virtual;

    /**
     * @notice Internal function to handle withdraw logic (to be implemented by child contracts)
     * @param amount Amount of assets to withdraw
     */
    function _withdraw(uint256 amount) internal virtual;

    /**
     * @notice Internal function to handle harvest logic (to be implemented by child contracts)
     * @return yield Amount of yield harvested
     */
    function _harvest() internal virtual returns (uint256 yield);

    /**
     * @notice Internal function to get current value (to be implemented by child contracts)
     * @return value Current value of assets
     */
    function _getValue() internal view virtual returns (uint256 value);
}
