"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { useVault } from "@/hooks/useVault";

export default function ProfileHeader() {
  const { address, isConnected } = useAccount();
  const { totalAssets, userShares } = useVault();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return "Not Connected";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatValue = (value: bigint | null) => {
    if (!value) return "0.00";
    return (Number(value) / 1e18).toFixed(2);
  };

  // Mock data for total yield (in production, calculate from transaction history)
  const totalYield = totalAssets && userShares
    ? Number(totalAssets) - Number(userShares)
    : 0;
  const totalYieldFormatted = totalYield > 0 ? (totalYield / 1e18).toFixed(2) : "0.00";

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

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[#8795B3] text-sm mb-1">Total Deposited</p>
              <p className="text-xl font-bold text-white">
                ${formatValue(userShares)}
              </p>
            </div>
            <div>
              <p className="text-[#8795B3] text-sm mb-1">Total Yield</p>
              <p className="text-xl font-bold text-[#8795B3]">
                +${totalYieldFormatted}
              </p>
            </div>
            <div>
              <p className="text-[#8795B3] text-sm mb-1">Vault Shares</p>
              <p className="text-xl font-bold text-white">
                {formatValue(userShares)}
              </p>
            </div>
            <div>
              <p className="text-[#8795B3] text-sm mb-1">Current Value</p>
              <p className="text-xl font-bold text-white">
                ${formatValue(totalAssets)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
