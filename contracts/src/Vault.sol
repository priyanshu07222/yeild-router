// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./StrategyManager.sol";

/**
 * @title Vault
 * @notice Main vault contract that accepts user deposits and manages funds across strategies
 * @dev Users deposit assets into the vault, which are then allocated to various yield strategies
 */
contract Vault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice The strategy manager that handles strategy allocation
    StrategyManager public strategyManager;

    /// @notice The underlying asset token (e.g., USDC, USDT)
    IERC20 public asset;

    /// @notice Total assets deposited in the vault
    uint256 public totalAssets;

    /// @notice Mapping of user addresses to their share balances
    mapping(address => uint256) public userShares;

    /// @notice Total shares issued
    uint256 public totalShares;

    /// @notice Mapping of strategy addresses to their allocated amounts
    mapping(address => uint256) public strategyAllocations;

    /// @notice Array of strategies that currently have allocations
    address[] public currentStrategies;

    /// @notice Events
    event Deposit(address indexed user, uint256 assets, uint256 shares);
    event Withdraw(address indexed user, uint256 assets, uint256 shares);
    event StrategyAllocated(address indexed strategy, uint256 amount);
    event StrategyDeallocated(address indexed strategy, uint256 amount);

    constructor(address _asset, address _strategyManager, address _owner) Ownable(_owner) {
        asset = IERC20(_asset);
        strategyManager = StrategyManager(_strategyManager);
    }

    /**
     * @notice Get current total assets including yield from strategies
     * @return Current total assets value
     */
    function getTotalAssets() public view returns (uint256) {
        uint256 totalStrategyValue = 0;
        
        // Calculate total value from all strategies
        for (uint256 i = 0; i < currentStrategies.length; i++) {
            address strategy = currentStrategies[i];
            StrategyBase strategyContract = StrategyBase(strategy);
            totalStrategyValue += strategyContract.getValue();
        }
        
        // Return vault balance + strategy values
        return asset.balanceOf(address(this)) + totalStrategyValue;
    }

    /**
     * @notice Sync totalAssets with current strategy values (including yield)
     * @dev Should be called periodically to update totalAssets with accrued yield
     */
    function syncTotalAssets() public {
        totalAssets = getTotalAssets();
    }

    /**
     * @notice Deposit assets into the vault
     * @param amount Amount of assets to deposit
     * @return sharesMinted Amount of shares minted
     */
    function deposit(uint256 amount) external nonReentrant returns (uint256 sharesMinted) {
        require(amount > 0, "Vault: amount must be greater than 0");
        
        asset.safeTransferFrom(msg.sender, address(this), amount);
        
        sharesMinted = convertToShares(amount);
        userShares[msg.sender] += sharesMinted;
        totalShares += sharesMinted;
        totalAssets += amount;

        emit Deposit(msg.sender, amount, sharesMinted);
        return sharesMinted;
    }

    /**
     * @notice Withdraw assets from the vault
     * @param sharesToBurn Amount of shares to burn
     * @return assetsWithdrawn Amount of assets withdrawn
     */
    function withdraw(uint256 sharesToBurn) external nonReentrant returns (uint256 assetsWithdrawn) {
        require(sharesToBurn > 0, "Vault: shares must be greater than 0");
        require(userShares[msg.sender] >= sharesToBurn, "Vault: insufficient shares");

        // Sync totalAssets with current strategy values before withdrawal
        syncTotalAssets();
        
        assetsWithdrawn = convertToAssets(sharesToBurn);
        require(totalAssets >= assetsWithdrawn, "Vault: insufficient assets");

        userShares[msg.sender] -= sharesToBurn;
        totalShares -= sharesToBurn;
        totalAssets -= assetsWithdrawn;

        asset.safeTransfer(msg.sender, assetsWithdrawn);

        emit Withdraw(msg.sender, assetsWithdrawn, sharesToBurn);
        return assetsWithdrawn;
    }

    /**
     * @notice Convert assets to shares
     * @param assets Amount of assets
     * @return shares Amount of shares
     */
    function convertToShares(uint256 assets) public view returns (uint256) {
        if (totalShares == 0) return assets;
        return (assets * totalShares) / totalAssets;
    }

    /**
     * @notice Convert shares to assets
     * @param sharesAmount Amount of shares
     * @return assets Amount of assets
     */
    function convertToAssets(uint256 sharesAmount) public view returns (uint256) {
        if (totalShares == 0) return 0;
        uint256 currentTotalAssets = getTotalAssets();
        return (sharesAmount * currentTotalAssets) / totalShares;
    }

    /**
     * @notice Allocate funds to a strategy
     * @param strategy Address of the strategy
     * @param amount Amount to allocate
     */
    function allocateToStrategy(address strategy, uint256 amount) external onlyOwner {
        require(amount > 0, "Vault: amount must be greater than 0");
        require(totalAssets >= amount, "Vault: insufficient assets");

        // Reset allowance to 0 first, then set to amount
        uint256 currentAllowance = asset.allowance(address(this), strategy);
        if (currentAllowance > 0) {
            asset.safeDecreaseAllowance(strategy, currentAllowance);
        }
        asset.safeIncreaseAllowance(strategy, amount);
        
        strategyManager.allocateToStrategy(strategy, amount);
        totalAssets -= amount;
        
        // Track strategy allocation
        if (strategyAllocations[strategy] == 0) {
            currentStrategies.push(strategy);
        }
        strategyAllocations[strategy] += amount;

        emit StrategyAllocated(strategy, amount);
    }

    /**
     * @notice Deallocate funds from a strategy
     * @param strategy Address of the strategy
     * @param amount Amount to deallocate
     */
    function deallocateFromStrategy(address strategy, uint256 amount) external onlyOwner {
        require(strategyAllocations[strategy] >= amount, "Vault: insufficient strategy allocation");
        
        strategyManager.deallocateFromStrategy(strategy, amount);
        totalAssets += amount;
        
        // Update strategy allocation tracking
        strategyAllocations[strategy] -= amount;
        if (strategyAllocations[strategy] == 0) {
            // Remove strategy from currentStrategies array
            for (uint256 i = 0; i < currentStrategies.length; i++) {
                if (currentStrategies[i] == strategy) {
                    currentStrategies[i] = currentStrategies[currentStrategies.length - 1];
                    currentStrategies.pop();
                    break;
                }
            }
        }

        emit StrategyDeallocated(strategy, amount);
    }

    /**
     * @notice Get all current strategies with allocations
     * @return Array of strategy addresses
     */
    function getCurrentStrategies() external view returns (address[] memory) {
        return currentStrategies;
    }
}
