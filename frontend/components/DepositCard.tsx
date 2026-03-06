"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { useVault } from "@/hooks/useVault";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function DepositCard() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [mounted, setMounted] = useState(false);
  const { deposit, isLoading, error, totalAssets, userShares } = useVault();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDeposit = async () => {
    if (!isConnected) {
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }
    try {
      await deposit(amount);
      // Clear input on success
      setAmount("");
    } catch (err) {
      // Error is handled by the hook
      console.error("Deposit error:", err);
    }
  };

  const formatBigInt = (value: bigint | null): string => {
    if (!value) return "0.00";
    try {
      return parseFloat(formatEther(value)).toFixed(2);
    } catch {
      return "0.00";
    }
  };

  return (
    <div className="glass-card rounded-xl p-6 w-full">
      <h2 className="text-2xl font-semibold mb-6 text-white">Deposit to Vault</h2>
      
      {/* Wallet Connection Status */}
      {mounted && !isConnected && (
        <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-400 text-sm mb-3">Please connect your wallet to deposit</p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      )}

      {/* Vault Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <p className="text-xs text-[#8795B3] mb-1">Total Vault Assets</p>
          <p className="text-xl font-bold text-white">
            {formatBigInt(totalAssets)}
          </p>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <p className="text-xs text-[#8795B3] mb-1">Your Shares</p>
          <p className="text-xl font-bold text-white">
            {mounted && isConnected ? formatBigInt(userShares) : "0.00"}
          </p>
        </div>
      </div>

      {/* Deposit Form */}
      <div className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-2 text-[#8795B3]">
            Token Amount
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#8795B3] focus:border-[#8795B3] text-white placeholder-[#8795B3]/50 backdrop-blur-sm text-lg"
            step="0.01"
            min="0"
            disabled={!isConnected || isLoading}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleDeposit}
          disabled={!mounted || !isConnected || isLoading || !amount || parseFloat(amount) <= 0}
          className="w-full bg-[#8795B3] hover:bg-[#3A404D] disabled:bg-[#3A404D]/50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors text-lg cursor-pointer"
        >
          {isLoading ? "Processing..." : "Deposit"}
        </button>

        {mounted && isConnected && (
          <p className="text-xs text-[#8795B3] text-center">
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        )}
      </div>
    </div>
  );
}
