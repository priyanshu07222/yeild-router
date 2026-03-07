"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount, useReadContract } from "wagmi";
import { formatEther } from "viem";
import { useVault } from "@/hooks/useVault";
import vaultABI from "@/contracts/abi.json";

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS || "0x0000000000000000000000000000000000000000";

// Helper to safely convert unknown to bigint
const toBigIntSafe = (value: unknown): bigint | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(value);
  if (typeof value === "string") return BigInt(value);
  return null;
};

// Helper to safely convert unknown to string (for addresses)
const toStringSafe = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  if (typeof value === "bigint") return value.toString();
  return null;
};

export default function ProfileHeader() {
  const { address, isConnected } = useAccount();
  const { userShares } = useVault();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Read total shares from contract
  const { data: totalShares } = useReadContract({
    address: VAULT_ADDRESS as `0x${string}`,
    abi: vaultABI,
    functionName: "totalShares",
  });

  // Read total assets from contract
  const { data: totalAssets } = useReadContract({
    address: VAULT_ADDRESS as `0x${string}`,
    abi: vaultABI,
    functionName: "totalAssets",
  });

  // Read current strategy
  const { data: currentStrategy } = useReadContract({
    address: VAULT_ADDRESS as `0x${string}`,
    abi: vaultABI,
    functionName: "currentStrategy",
  });

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return "Not Connected";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatValue = (value: bigint | null | undefined) => {
    if (!value) return "0.00";
    return (Number(value) / 1e18).toFixed(2);
  };

  // Convert contract responses to proper types
  const totalSharesBigInt = toBigIntSafe(totalShares);
  const totalAssetsBigInt = toBigIntSafe(totalAssets);
  const currentStrategyStr = toStringSafe(currentStrategy);

  // Calculate user's vault value: (userShares / totalShares) * totalAssets
  const calculateUserValue = (): string => {
    if (!userShares || !totalSharesBigInt || !totalAssetsBigInt) return "0.00";
    if (Number(totalSharesBigInt) === 0) return "0.00";
    
    const userSharesNum = Number(userShares);
    const totalSharesNum = Number(totalSharesBigInt);
    const totalAssetsNum = Number(totalAssetsBigInt);
    
    const userValue = (userSharesNum / totalSharesNum) * totalAssetsNum;
    return (userValue / 1e18).toFixed(2);
  };

  // Calculate estimated yield (userValue - userShares, rough approximation)
  const calculateEstimatedYield = (): string => {
    const userValue = parseFloat(calculateUserValue());
    const sharesValue = parseFloat(formatValue(userShares));
    const yieldValue = userValue - sharesValue;
    return yieldValue > 0 ? yieldValue.toFixed(2) : "0.00";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl p-8"
    >
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#8795B3] to-[#3A404D] flex items-center justify-center text-4xl font-bold text-white">
          {mounted && address ? address.slice(2, 4).toUpperCase() : "?"}
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-white mb-2">
            {mounted && isConnected ? "Your Portfolio" : "Connect Wallet"}
          </h1>
          <p className="text-[#8795B3] font-mono mb-6">
            {mounted ? formatAddress(address) : "Not Connected"}
          </p>

          {/* Stats Grid - Real Data */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[#8795B3] text-xs sm:text-sm mb-1">Vault Shares</p>
              <p className="text-lg sm:text-xl font-bold text-white">
                {formatValue(userShares)}
              </p>
            </div>
            <div>
              <p className="text-[#8795B3] text-xs sm:text-sm mb-1">Your Vault Value</p>
              <p className="text-lg sm:text-xl font-bold text-[#8795B3]">
                ${calculateUserValue()}
              </p>
              <p className="text-[10px] sm:text-xs text-[#8795B3]/60 mt-0.5">Real-time</p>
            </div>
            <div>
              <p className="text-[#8795B3] text-xs sm:text-sm mb-1">Est. Yield</p>
              <p className="text-lg sm:text-xl font-bold text-emerald-400">
                +${calculateEstimatedYield()}
              </p>
              <p className="text-[10px] sm:text-xs text-[#8795B3]/60 mt-0.5">Approx</p>
            </div>
            <div>
              <p className="text-[#8795B3] text-xs sm:text-sm mb-1">Total TVL</p>
              <p className="text-lg sm:text-xl font-bold text-white">
                ${formatValue(totalAssetsBigInt)}
              </p>
              <p className="text-[10px] sm:text-xs text-[#8795B3]/60 mt-0.5">Real-time</p>
            </div>
          </div>

          {/* Current Strategy Info */}
          {mounted && currentStrategyStr && currentStrategyStr !== "0x0000000000000000000000000000000000000000" && (
            <div className="mt-4 pt-4 border-t border-[#8795B3]/20">
              <p className="text-xs sm:text-sm text-[#8795B3] mb-1">Current Strategy</p>
              <p className="text-xs sm:text-sm font-mono text-white">
                {formatAddress(currentStrategyStr)}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
