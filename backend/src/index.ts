import cron from "node-cron";
import { ethers } from "ethers";
import dotenv from "dotenv";
import VaultABI from "../contracts/Vault.json";
import StrategyManagerABI from "../contracts/StrategyManager.json";

dotenv.config();

// Configuration
const VAULT_ADDRESS = process.env.VAULT_ADDRESS || "";
const STRATEGY_MANAGER_ADDRESS = process.env.STRATEGY_MANAGER_ADDRESS || "";
const RPC_URL = process.env.RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

// Check required environment variables
if (!VAULT_ADDRESS || !STRATEGY_MANAGER_ADDRESS || !RPC_URL || !PRIVATE_KEY) {
  console.error("❌ Missing required environment variables!");
  console.error("Required: VAULT_ADDRESS, STRATEGY_MANAGER_ADDRESS, RPC_URL, PRIVATE_KEY");
  process.exit(1);
}

// Initialize provider and signer
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const vault = new ethers.Contract(VAULT_ADDRESS, VaultABI, wallet);
const strategyManager = new ethers.Contract(
  STRATEGY_MANAGER_ADDRESS,
  StrategyManagerABI,
  provider
);

/**
 * Check APY and rebalance if needed
 */
async function checkAndRebalance(): Promise<void> {
  try {
    console.log(`\n[${new Date().toISOString()}] 🔍 Checking APY and rebalancing...`);

    // Get current strategy from vault
    const currentStrategy = await vault.currentStrategy();
    console.log(`Current Strategy: ${currentStrategy}`);

    // Get best strategy from strategy manager
    const bestStrategy = await strategyManager.getBestStrategy();
    console.log(`Best Strategy: ${bestStrategy}`);

    // Compare strategies
    if (currentStrategy.toLowerCase() === bestStrategy.toLowerCase()) {
      console.log("✅ Current strategy is already the best. No rebalance needed.");
      return;
    }

    // Get strategy count to fetch APY info
    const strategyCount = await strategyManager.getStrategyCount();
    console.log(`\nFound ${strategyCount} strategies`);

    // Find current and best strategy info
    let currentStrategyAPY = 0;
    let bestStrategyAPY = 0;

    for (let i = 0; i < strategyCount; i++) {
      const strategy = await strategyManager.getStrategy(i);
      const strategyAddress = strategy.strategy.toLowerCase();

      if (strategyAddress === currentStrategy.toLowerCase()) {
        currentStrategyAPY = Number(strategy.apy);
        console.log(`Current Strategy APY: ${currentStrategyAPY / 100}%`);
      }

      if (strategyAddress === bestStrategy.toLowerCase()) {
        bestStrategyAPY = Number(strategy.apy);
        console.log(`Best Strategy APY: ${bestStrategyAPY / 100}%`);
      }
    }

    // Rebalance if best strategy is different
    console.log(`\n🔄 Rebalancing from ${currentStrategy.slice(0, 10)}... to ${bestStrategy.slice(0, 10)}...`);
    
    const tx = await vault.rebalance();
    console.log(`Transaction hash: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`✅ Rebalance successful! Block: ${receipt.blockNumber}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);

  } catch (error: any) {
    console.error(`❌ Error during rebalance check:`, error.message);
    
    // Don't exit on error - continue running
    if (error.code === "CALL_EXCEPTION") {
      console.error("⚠️  Contract call failed. Check contract addresses and RPC connection.");
    } else if (error.code === "INSUFFICIENT_FUNDS") {
      console.error("⚠️  Insufficient funds for gas. Check wallet balance.");
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log("🚀 Auto-Rebalance Bot Starting...");
  console.log(`Vault Address: ${VAULT_ADDRESS}`);
  console.log(`Strategy Manager: ${STRATEGY_MANAGER_ADDRESS}`);
  console.log(`RPC URL: ${RPC_URL}`);
  console.log(`Wallet Address: ${wallet.address}`);

  // Check connection
  try {
    const balance = await provider.getBalance(wallet.address);
    console.log(`Wallet Balance: ${ethers.formatEther(balance)} ETH`);
  } catch (error) {
    console.error("❌ Failed to connect to RPC. Check RPC_URL.");
    process.exit(1);
  }

  // Run initial check
  await checkAndRebalance();

  // Schedule cron job: Every 10 minutes
  // Format: "*/10 * * * *" = every 10 minutes
  cron.schedule("*/10 * * * *", async () => {
    await checkAndRebalance();
  });

  console.log("\n⏰ Bot scheduled to run every 10 minutes");
  console.log("Press Ctrl+C to stop\n");
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n👋 Shutting down bot...");
  process.exit(0);
});

// Start the bot
main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
