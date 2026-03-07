"use client";

import { motion } from "framer-motion";
import { useReadContract } from "wagmi";
import { useVault } from "@/hooks/useVault";
import vaultABI from "@/contracts/abi.json";
import strategyManagerABI from "@/contracts/strategyManagerABI.json";

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS || "0x0000000000000000000000000000000000000000";
const STRATEGY_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_STRATEGY_MANAGER_ADDRESS || "0x0000000000000000000000000000000000000000";

// Helper to safely convert unknown to bigint
const toBigIntSafe = (value: unknown): bigint | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(value);
  if (typeof value === "string") return BigInt(value);
  return null;
};

export default function PortfolioStats() {
  const { userShares } = useVault();

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

  // Read current strategy address
  const { data: currentStrategyAddress } = useReadContract({
    address: VAULT_ADDRESS as `0x${string}`,
    abi: vaultABI,
    functionName: "currentStrategy",
  });

  const formatValue = (value: bigint | null | undefined) => {
    if (!value) return "0.00";
    return (Number(value) / 1e18).toFixed(2);
  };

  // Convert contract responses to bigint
  const totalSharesBigInt = toBigIntSafe(totalShares);
  const totalAssetsBigInt = toBigIntSafe(totalAssets);

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

  // Calculate estimated yield (userValue - initial deposit approximation)
  const calculateEstimatedYield = (): string => {
    const userValue = parseFloat(calculateUserValue());
    const sharesValue = parseFloat(formatValue(userShares));
    const yieldValue = userValue - sharesValue;
    return yieldValue > 0 ? yieldValue.toFixed(2) : "0.00";
  };

  // Calculate current APY from strategy (if available)
  // For now, use estimated APY - in production, query from StrategyManager
  const currentAPY = "~15.2%"; // Placeholder

  const stats = [
    {
      label: "Your Shares",
      value: formatValue(userShares),
      icon: "💎",
      color: "text-white",
      badge: "Real-time",
    },
    {
      label: "Vault Value",
      value: `$${calculateUserValue()}`,
      icon: "💰",
      color: "text-[#8795B3]",
      badge: "Calculated",
    },
    {
      label: "Est. Yield",
      value: `+$${calculateEstimatedYield()}`,
      icon: "📈",
      color: "text-emerald-400",
      badge: "Estimated",
    },
    {
      label: "Total TVL",
      value: `$${formatValue(totalAssetsBigInt)}`,
      icon: "📊",
      color: "text-white",
      badge: "Real-time",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ scale: 1.03, y: -4 }}
          className="glass-card rounded-xl p-5 sm:p-6 glass-card-hover relative overflow-hidden"
        >
          {/* Badge */}
          <div className="absolute top-3 right-3">
            <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-medium bg-[#8795B3]/20 text-[#8795B3] rounded-full border border-[#8795B3]/30">
              {stat.badge}
            </span>
          </div>

          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{stat.icon}</div>
          <p className="text-[#8795B3] text-xs sm:text-sm mb-1 sm:mb-2">{stat.label}</p>
          <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
