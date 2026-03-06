"use client";

import { useAccount, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { formatEther } from "viem";

export default function WalletPage() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8"
      >
        Wallet
      </motion.h1>

      {!isConnected ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center"
        >
          <p className="text-[#A8C1D9] text-sm sm:text-base mb-6">Connect your wallet to view your balance</p>
          <ConnectButton />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8"
        >
          <div className="space-y-6">
            <div>
              <p className="text-[#A8C1D9] text-xs sm:text-sm mb-2">Wallet Address</p>
              <p className="text-white font-mono text-xs sm:text-sm md:text-base break-all">{address}</p>
            </div>
            <div>
              <p className="text-[#A8C1D9] text-xs sm:text-sm mb-2">Balance</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white break-words">
                {balance ? formatEther(balance.value) : "0.0"} {balance?.symbol}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
