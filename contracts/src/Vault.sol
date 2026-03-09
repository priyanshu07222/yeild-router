// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./StrategyManager.sol";
import "./StrategyBase.sol";
import "./XCMRouter.sol";

/**
 * @title Vault
 * @notice DeFi Yield Router Vault that allocates funds to the best strategy
 * @dev Users deposit ERC20 tokens and receive shares. Funds are allocated to highest APY strategy.
 */
contract Vault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice The underlying asset token (e.g., USDC, USDT)
    IERC20 public asset;

    /// @notice The strategy manager contract
    StrategyManager public strategyManager;

    /// @notice Simulated Polkadot XCM router for cross-chain messaging
    XCMRouter public xcmRouter;

    /// @notice Total shares issued
    uint256 public totalShares;

    /// @notice Total assets in the vault (including yield from strategies)
    uint256 public totalAssets;

    /// @notice Mapping of user addresses to their share balances
    mapping(address => uint256) public userShares;

    /// @notice Current strategy where funds are allocated
    address public currentStrategy;

    /// @notice Events
    event Deposit(address indexed user, uint256 amount, uint256 shares);
    event Withdraw(address indexed user, uint256 amount, uint256 shares);
    event Rebalance(address indexed oldStrategy, address indexed newStrategy);

    /**
     * @notice Constructor
     * @param _asset Address of the ERC20 asset token
     * @param _strategyManager Address of the StrategyManager contract
     * @param _xcmRouter Address of the XCMRouter contract (simulation-only)
     */
    constructor(address _asset, address _strategyManager, address _xcmRouter) Ownable(msg.sender) {
        require(_asset != address(0), "Vault: invalid asset address");
        require(_strategyManager != address(0), "Vault: invalid strategy manager address");
        
        asset = IERC20(_asset);
        strategyManager = StrategyManager(_strategyManager);
        xcmRouter = XCMRouter(_xcmRouter);
    }

    /**
     * @notice Deposit assets into the vault
     * @param amount Amount of assets to deposit
     */
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Vault: amount must be greater than 0");

        // Transfer assets from user
        asset.safeTransferFrom(msg.sender, address(this), amount);

        // Sync totalAssets with current strategy value BEFORE calculating shares
        _syncTotalAssets();

        // Calculate shares to mint
        uint256 shares;
        if (totalShares == 0) {
            // First deposit: 1:1 ratio
            shares = amount;
        } else {
            // Subsequent deposits: proportional to existing shares
            shares = (amount * totalShares) / totalAssets;
        }

        // Update state BEFORE allocation
        totalShares += shares;
        userShares[msg.sender] += shares;

        // Allocate funds to best strategy (this moves funds to strategy)
        _allocateToBestStrategy();

        // Sync totalAssets AFTER allocation to include the new funds
        _syncTotalAssets();

        emit Deposit(msg.sender, amount, shares);
    }

    /**
     * @notice Withdraw assets from the vault
     * @param shares Amount of shares to burn
     */
    function withdraw(uint256 shares) external nonReentrant {
        require(shares > 0, "Vault: shares must be greater than 0");
        require(userShares[msg.sender] >= shares, "Vault: insufficient shares");
        require(totalShares > 0, "Vault: no shares issued");

        // Sync totalAssets with current strategy value
        _syncTotalAssets();

        // Get actual available assets (vault balance + strategy actual balance)
        uint256 vaultBalance = asset.balanceOf(address(this));
        uint256 strategyActualBalance = 0;
        if (currentStrategy != address(0)) {
            strategyActualBalance = asset.balanceOf(currentStrategy);
        }
        uint256 totalAvailableAssets = vaultBalance + strategyActualBalance;
        
        // Calculate proportional assets based on totalAssets (includes yield)
        // But cap to actual available assets (can't withdraw simulated yield)
        uint256 assets = (shares * totalAssets) / totalShares;
        require(assets > 0, "Vault: calculated assets is zero");
        
        // Cap assets to what's actually available (can't withdraw simulated yield)
        if (assets > totalAvailableAssets) {
            assets = totalAvailableAssets;
        }

        // Withdraw from strategy if needed
        if (currentStrategy != address(0) && vaultBalance < assets) {
            uint256 neededFromStrategy = assets - vaultBalance;
            
            // Don't withdraw more than strategy actually has
            if (neededFromStrategy > strategyActualBalance) {
                neededFromStrategy = strategyActualBalance;
                // Recalculate assets based on what we can actually withdraw
                assets = vaultBalance + neededFromStrategy;
            }
            
            if (neededFromStrategy > 0) {
                StrategyBase(currentStrategy).withdraw(neededFromStrategy);
            }
        }

        // Update state
        totalShares -= shares;
        userShares[msg.sender] -= shares;
        totalAssets -= assets;

        // Transfer assets to user
        asset.safeTransfer(msg.sender, assets);

        emit Withdraw(msg.sender, assets, shares);
    }

    /**
     * @notice Rebalance funds to the best strategy
     * @dev Only owner can call this function
     */
    function rebalance() external onlyOwner nonReentrant {
        // Sync totalAssets with current strategy value
        _syncTotalAssets();

        // Get best strategy
        address bestStrategy = strategyManager.getBestStrategy();
        require(bestStrategy != address(0), "Vault: no best strategy found");

        // If best strategy is same as current, do nothing
        if (bestStrategy == currentStrategy) {
            return;
        }

        address oldStrategy = currentStrategy;

        // Withdraw all funds from old strategy if exists
        if (oldStrategy != address(0)) {
            // Get the actual balance in the strategy (what we can withdraw)
            uint256 strategyBalance = asset.balanceOf(oldStrategy);
            if (strategyBalance > 0) {
                StrategyBase(oldStrategy).withdraw(strategyBalance);
            }
        }

        // Update current strategy
        currentStrategy = bestStrategy;

        // Deposit all available funds into new strategy
        uint256 vaultBalance = asset.balanceOf(address(this));
        if (vaultBalance > 0) {
            // Simulation-only: emit a cross-chain transfer event via the XCM router
            // In production, this is where Polkadot XCM messaging would be dispatched via precompiles/endpoints.
            if (oldStrategy != address(0) && address(xcmRouter) != address(0)) {
                uint256 oldStrategyChainId = _getStrategyChainId(oldStrategy);
                uint256 newStrategyChainId = _getStrategyChainId(bestStrategy);
                try xcmRouter.sendXCM(oldStrategyChainId, newStrategyChainId, bestStrategy, vaultBalance) {
                    // no-op
                } catch {
                    // best-effort simulation; do not impact vault rebalance behavior
                }
            }

            // Reset approval to 0 first, then set to amount
            uint256 currentAllowance = asset.allowance(address(this), bestStrategy);
            if (currentAllowance > 0) {
                asset.safeDecreaseAllowance(bestStrategy, currentAllowance);
            }
            asset.safeIncreaseAllowance(bestStrategy, vaultBalance);
            StrategyBase(bestStrategy).deposit(vaultBalance);
            // Reset approval - check current allowance first
            uint256 remainingAllowance = asset.allowance(address(this), bestStrategy);
            if (remainingAllowance > 0) {
                asset.safeDecreaseAllowance(bestStrategy, remainingAllowance);
            }
        }

        emit Rebalance(oldStrategy, bestStrategy);
    }

    function _getStrategyChainId(address strategy) internal view returns (uint256) {
        uint256 count = strategyManager.getStrategyCount();
        for (uint256 i = 0; i < count; i++) {
            StrategyManager.Strategy memory info = strategyManager.getStrategy(i);
            if (info.strategy == strategy) {
                return info.chainId;
            }
        }
        return 0;
    }

    /**
     * @notice Sync totalAssets with current strategy value
     * @dev Internal function to update totalAssets based on strategy returns
     */
    function _syncTotalAssets() internal {
        uint256 vaultBalance = asset.balanceOf(address(this));
        uint256 strategyValue = 0;

        if (currentStrategy != address(0)) {
            strategyValue = StrategyBase(currentStrategy).totalAssets();
        }

        totalAssets = vaultBalance + strategyValue;
    }

    /**
     * @notice Allocate funds to the best strategy
     * @dev Internal function called after deposits
     */
    function _allocateToBestStrategy() internal {
        // Get best strategy
        try strategyManager.getBestStrategy() returns (address bestStrategy) {
            if (bestStrategy == address(0)) {
                return; // No strategies available
            }

            // Determine which strategy to allocate to
            // If no current strategy, use best strategy
            // Otherwise, allocate to current strategy (rebalance happens explicitly)
            address targetStrategy = currentStrategy == address(0) ? bestStrategy : currentStrategy;

            // Allocate funds to target strategy
            uint256 vaultBalance = asset.balanceOf(address(this));
            if (vaultBalance > 0 && targetStrategy != address(0)) {
                // Reset approval to 0 first, then set to amount
                uint256 currentAllowance = asset.allowance(address(this), targetStrategy);
                if (currentAllowance > 0) {
                    asset.safeDecreaseAllowance(targetStrategy, currentAllowance);
                }
                asset.safeIncreaseAllowance(targetStrategy, vaultBalance);
                StrategyBase(targetStrategy).deposit(vaultBalance);
                // Reset approval - check current allowance first
                uint256 remainingAllowance = asset.allowance(address(this), targetStrategy);
                if (remainingAllowance > 0) {
                    asset.safeDecreaseAllowance(targetStrategy, remainingAllowance);
                }
                
                // Update current strategy if it was unset
                if (currentStrategy == address(0)) {
                    currentStrategy = bestStrategy;
                }
            }
        } catch {
            // If getBestStrategy fails (no strategies), funds stay in vault
            return;
        }
    }
}
