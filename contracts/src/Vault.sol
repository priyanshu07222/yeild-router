// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./StrategyManager.sol";

/**
 * @title Vault
 * @notice Vault contract that accepts deposits and manages shares
 * @dev Users deposit assets and receive shares proportional to their deposit
 */
contract Vault {
    using SafeERC20 for IERC20;

    /// @notice The underlying asset token (e.g., USDC, USDT)
    IERC20 public asset;

    /// @notice The strategy manager contract
    StrategyManager public strategyManager;

    /// @notice Total shares issued
    uint256 public totalShares;

    /// @notice Total assets in the vault
    uint256 public totalAssets;

    /// @notice Mapping of user addresses to their share balances
    mapping(address => uint256) public userShares;

    constructor(address _asset, address _strategyManager) {
        asset = IERC20(_asset);
        strategyManager = StrategyManager(_strategyManager);
    }

    /**
     * @notice Deposit assets into the vault
     * @param amount Amount of assets to deposit
     */
    function deposit(uint256 amount) external {
        require(amount > 0, "Vault: amount must be greater than 0");

        // Transfer assets from user
        asset.safeTransferFrom(msg.sender, address(this), amount);

        // Calculate shares to mint
        uint256 shares;
        if (totalShares == 0) {
            // First deposit: 1:1 ratio
            shares = amount;
        } else {
            // Subsequent deposits: proportional to existing shares
            shares = (amount * totalShares) / totalAssets;
        }

        // Increase total assets
        totalAssets += amount;

        // Mint shares
        totalShares += shares;
        userShares[msg.sender] += shares;
    }

    /**
     * @notice Withdraw assets from the vault
     * @param shares Amount of shares to burn
     */
    function withdraw(uint256 shares) external {
        require(shares > 0, "Vault: shares must be greater than 0");
        require(userShares[msg.sender] >= shares, "Vault: insufficient shares");
        require(totalShares > 0, "Vault: no shares issued");

        // Calculate proportional assets
        uint256 assets = (shares * totalAssets) / totalShares;

        // Burn shares
        totalShares -= shares;
        userShares[msg.sender] -= shares;

        // Decrease total assets
        totalAssets -= assets;

        // Transfer assets to user
        asset.safeTransfer(msg.sender, assets);
    }
}
