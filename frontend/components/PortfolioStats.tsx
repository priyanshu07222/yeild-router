"use client";

import { motion } from "framer-motion";
import { useVault } from "@/hooks/useVault";

export default function PortfolioStats() {
  const { totalAssets, userShares } = useVault();

  const formatValue = (value: bigint | null) => {
    if (!value) return "0.00";
    return (Number(value) / 1e18).toFixed(2);
  };

  // Calculate yield
  const totalYield = totalAssets && userShares
    ? Number(totalAssets) - Number(userShares)
    : 0;
  const totalYieldFormatted = totalYield > 0 ? (totalYield / 1e18).toFixed(2) : "0.00";

  // Calculate current APY (mock - in production, get from strategy)
  const currentAPY = "15.2%";

  const stats = [
    {
      label: "Total Deposited",
      value: `$${formatValue(userShares)}`,
      icon: "💰",
      color: "text-white",
    },
    {
      label: "Current Vault Value",
      value: `$${formatValue(totalAssets)}`,
      icon: "📊",
      color: "text-[#8795B3]",
    },
    {
      label: "Total Yield Earned",
      value: `+$${totalYieldFormatted}`,
      icon: "📈",
      color: "text-[#8795B3]",
    },
    {
      label: "Current APY",
      value: currentAPY,
      icon: "⚡",
      color: "text-[#8795B3]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="glass-card rounded-xl p-6 glass-card-hover cursor-pointer"
        >
          <div className="text-3xl mb-3">{stat.icon}</div>
          <p className="text-[#8795B3] text-sm mb-2">{stat.label}</p>
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
