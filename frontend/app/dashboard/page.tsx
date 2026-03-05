"use client";

import { useVault } from "@/hooks/useVault";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { totalAssets, userShares } = useVault();

  const formatValue = (value: bigint | null) => {
    if (!value) return "0.00";
    return (Number(value) / 1e18).toFixed(2);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-white mb-8"
      >
        Dashboard
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-[#A8C1D9] text-sm mb-2">Total Assets</h3>
          <p className="text-3xl font-bold text-white">
            ${formatValue(totalAssets)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-[#A8C1D9] text-sm mb-2">Your Shares</h3>
          <p className="text-3xl font-bold text-white">
            {formatValue(userShares)}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
