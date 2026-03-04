"use client";

import DashboardSidebar from "@/components/DashboardSidebar";
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
    <div className="min-h-screen">
      <DashboardSidebar />
      
      <main className="p-4 sm:p-6 lg:p-8 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-8"
          >
            Wallet
          </motion.h1>

          {!isConnected ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-12 text-center"
            >
              <p className="text-[#A8C1D9] mb-6">Connect your wallet to view your balance</p>
              <ConnectButton />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-8"
            >
              <div className="space-y-6">
                <div>
                  <p className="text-[#A8C1D9] text-sm mb-2">Wallet Address</p>
                  <p className="text-white font-mono">{address}</p>
                </div>
                <div>
                  <p className="text-[#A8C1D9] text-sm mb-2">Balance</p>
                  <p className="text-3xl font-bold text-white">
                    {balance ? formatEther(balance.value) : "0.0"} {balance?.symbol}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
