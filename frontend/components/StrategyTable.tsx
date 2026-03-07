"use client";

import { useReadContract } from "wagmi";
import { useStrategies } from "@/hooks/useStrategies";
import vaultABI from "@/contracts/abi.json";

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS || "0x0000000000000000000000000000000000000000";

// Chain ID to name mapping
const CHAIN_NAMES: Record<number, string> = {
  1284: "Moonbeam",
  1285: "Moonriver",
  592: "Astar",
  2034: "Hydration",
  1: "Ethereum",
  31337: "Localhost",
};

// Protocol name mapping (can be extended)
const getProtocolName = (chainId: number, address: string): string => {
  const chainName = CHAIN_NAMES[chainId] || `Chain ${chainId}`;
  // For demo, we'll use chain name + "Strategy"
  // In production, you'd maintain a registry or fetch from contract metadata
  return `${chainName} Strategy`;
};

export default function StrategyTable() {
  const { strategies, isLoading, error, rebalance } = useStrategies();

  // Get current strategy from Vault contract
  const { data: currentStrategy } = useReadContract({
    address: VAULT_ADDRESS as `0x${string}`,
    abi: vaultABI,
    functionName: "currentStrategy",
  });

  const formatAddress = (address: string) => {
    if (!address || address === "0x0000000000000000000000000000000000000000") {
      return "N/A";
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAPY = (apy: number) => {
    // APY is stored in basis points (e.g., 500 = 5%)
    return (apy / 100).toFixed(2);
  };

  const getRiskLabel = (riskScore: number): { label: string; color: string } => {
    if (riskScore >= 1 && riskScore <= 3) {
      return { label: "Low", color: "emerald" };
    } else if (riskScore >= 4 && riskScore <= 6) {
      return { label: "Medium", color: "amber" };
    } else if (riskScore >= 7 && riskScore <= 10) {
      return { label: "High", color: "red" };
    }
    return { label: "Unknown", color: "gray" };
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-8">
        <div className="text-center text-gray-400">Loading strategies...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-xl p-8">
        <div className="text-red-400 text-center">{error}</div>
      </div>
    );
  }

  const currentStrategyAddress = currentStrategy as string | undefined;

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Available Strategies</h2>
        <button
          onClick={rebalance}
          className="px-4 py-2 bg-[#8795B3] hover:bg-[#3A404D] text-white font-medium rounded-lg transition-colors cursor-pointer"
        >
          Rebalance
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
          {strategies && strategies.length > 0 ? (
            strategies.map((strategy, index) => {
              const isCurrentStrategy = currentStrategyAddress?.toLowerCase() === strategy.address.toLowerCase();
              const chainName = CHAIN_NAMES[strategy.chainId] || `Chain ${strategy.chainId}`;
              const protocolName = getProtocolName(strategy.chainId, strategy.address);
              const riskInfo = getRiskLabel(strategy.riskScore);
              
              return (
                <div
                  key={index}
                  className={`glass-card rounded-xl p-5 sm:p-6 border transition-all hover:scale-[1.02] ${
                    isCurrentStrategy
                      ? "border-[#8795B3]/60 bg-[#8795B3]/10 shadow-lg shadow-[#8795B3]/20"
                      : "border-[#8795B3]/25 hover:border-[#8795B3]/40"
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                        {protocolName}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#8795B3] mt-0.5">
                        Chain: {chainName}
                      </p>
                    </div>
                    {isCurrentStrategy && (
                      <span className="ml-2 px-2.5 py-1 text-xs font-semibold bg-[#8795B3]/40 text-white rounded-full border border-[#8795B3]/60 whitespace-nowrap">
                        Current
                      </span>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className="space-y-3 mb-4">
                    {/* APY */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-[#A8C1D9]">APY</span>
                      <span className="text-xl sm:text-2xl font-bold text-[#8795B3]">
                        {formatAPY(strategy.apy)}%
                      </span>
                    </div>

                    {/* Risk */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-[#A8C1D9]">Risk</span>
                      <span
                        className={`px-3 py-1 text-xs sm:text-sm font-semibold rounded-full border
                          ${riskInfo.color === "emerald" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : ""}
                          ${riskInfo.color === "amber" ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : ""}
                          ${riskInfo.color === "red" ? "bg-red-500/15 text-red-400 border-red-500/30" : ""}
                        `}
                      >
                        {riskInfo.label}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-[#A8C1D9]">Status</span>
                      <span
                        className={`px-3 py-1 text-xs sm:text-sm font-semibold rounded-full border ${
                          strategy.active
                            ? "bg-green-500/15 text-green-400 border-green-500/30"
                            : "bg-gray-500/15 text-gray-400 border-gray-500/30"
                        }`}
                      >
                        {strategy.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* Address Footer */}
                  <div className="pt-3 border-t border-[#8795B3]/20">
                    <p className="text-[10px] sm:text-xs text-[#8795B3]/70 font-mono truncate">
                      {strategy.address}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full glass-card rounded-xl p-8 text-center">
              <p className="text-sm text-[#A8C1D9]">No strategies available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
