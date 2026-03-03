// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Vault} from "../src/Vault.sol";
import {StrategyManager} from "../src/StrategyManager.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Mock ERC20 token for testing
contract MockERC20 is IERC20 {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    uint256 public totalSupply;

    string public name = "Mock Token";
    string public symbol = "MOCK";
    uint8 public decimals = 18;

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
    }
}

contract VaultTest is Test {
    Vault public vault;
    StrategyManager public strategyManager;
    MockERC20 public asset;

    address public user1 = address(0x1);
    address public user2 = address(0x2);

    function setUp() public {
        // Deploy mock ERC20 token
        asset = new MockERC20();
        
        // Deploy StrategyManager
        strategyManager = new StrategyManager(address(this));
        
        // Deploy Vault
        vault = new Vault(address(asset), address(strategyManager), address(this));

        // Mint tokens to users
        asset.mint(user1, 10000e18);
        asset.mint(user2, 10000e18);
    }

    function test_DepositIncreasesUserShares() public {
        uint256 depositAmount = 1000e18;
        
        // Approve vault to spend tokens
        vm.prank(user1);
        asset.approve(address(vault), depositAmount);
        
        // Get initial shares
        uint256 initialShares = vault.userShares(user1);
        assertEq(initialShares, 0, "Initial shares should be 0");
        
        // Deposit
        vm.prank(user1);
        vault.deposit(depositAmount);
        
        // Check shares increased
        uint256 finalShares = vault.userShares(user1);
        assertEq(finalShares, depositAmount, "Shares should equal deposit amount for first deposit");
        assertGt(finalShares, initialShares, "Shares should increase after deposit");
    }

    function test_WithdrawReturnsCorrectAssets() public {
        uint256 depositAmount = 1000e18;
        
        // Approve and deposit
        vm.prank(user1);
        asset.approve(address(vault), depositAmount);
        vm.prank(user1);
        vault.deposit(depositAmount);
        
        uint256 shares = vault.userShares(user1);
        uint256 initialBalance = asset.balanceOf(user1);
        
        // Withdraw
        vm.prank(user1);
        vault.withdraw(shares);
        
        // Check assets returned
        uint256 finalBalance = asset.balanceOf(user1);
        uint256 assetsReturned = finalBalance - initialBalance;
        
        assertEq(assetsReturned, depositAmount, "Withdrawn assets should equal deposited amount");
        assertEq(vault.userShares(user1), 0, "User shares should be 0 after full withdrawal");
    }

    function test_TotalAssetsUpdatesCorrectly() public {
        uint256 depositAmount1 = 1000e18;
        uint256 depositAmount2 = 500e18;
        
        // First deposit
        vm.prank(user1);
        asset.approve(address(vault), depositAmount1);
        vm.prank(user1);
        vault.deposit(depositAmount1);
        
        assertEq(vault.totalAssets(), depositAmount1, "Total assets should equal first deposit");
        
        // Second deposit
        vm.prank(user2);
        asset.approve(address(vault), depositAmount2);
        vm.prank(user2);
        vault.deposit(depositAmount2);
        
        assertEq(vault.totalAssets(), depositAmount1 + depositAmount2, "Total assets should equal sum of deposits");
        
        // Withdraw
        uint256 user1Shares = vault.userShares(user1);
        vm.prank(user1);
        vault.withdraw(user1Shares);
        
        assertEq(vault.totalAssets(), depositAmount2, "Total assets should decrease after withdrawal");
    }

    function test_MultipleDepositsProportionalShares() public {
        uint256 depositAmount1 = 1000e18;
        uint256 depositAmount2 = 500e18;
        
        // First deposit
        vm.prank(user1);
        asset.approve(address(vault), depositAmount1);
        vm.prank(user1);
        vault.deposit(depositAmount1);
        
        uint256 shares1 = vault.userShares(user1);
        assertEq(shares1, depositAmount1, "First deposit should get 1:1 shares");
        
        // Second deposit
        vm.prank(user2);
        asset.approve(address(vault), depositAmount2);
        vm.prank(user2);
        vault.deposit(depositAmount2);
        
        uint256 shares2 = vault.userShares(user2);
        // Second deposit should get proportional shares: (500 * 1000) / 1000 = 500
        assertEq(shares2, depositAmount2, "Second deposit should get proportional shares");
    }

    function test_WithdrawPartialShares() public {
        uint256 depositAmount = 1000e18;
        
        // Deposit
        vm.prank(user1);
        asset.approve(address(vault), depositAmount);
        vm.prank(user1);
        vault.deposit(depositAmount);
        
        uint256 totalShares = vault.userShares(user1);
        uint256 withdrawShares = totalShares / 2; // Withdraw half
        uint256 initialBalance = asset.balanceOf(user1);
        
        // Withdraw half
        vm.prank(user1);
        vault.withdraw(withdrawShares);
        
        uint256 finalBalance = asset.balanceOf(user1);
        uint256 assetsReturned = finalBalance - initialBalance;
        
        // Should return approximately half (accounting for rounding)
        assertApproxEqRel(assetsReturned, depositAmount / 2, 0.01e18, "Partial withdrawal should return proportional assets");
        assertEq(vault.userShares(user1), totalShares - withdrawShares, "Remaining shares should be correct");
    }
}
