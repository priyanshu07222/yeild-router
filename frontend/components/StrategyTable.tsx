"use client";

import { useReadContract } from "wagmi";
import { useStrategies } from "@/hooks/useStrategies";
import vaultABI from "@/contracts/abi.json";

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS || "0x0000000000000000000000000000000000000000";

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
          className="px-4 py-2 bg-[#8795B3] hover:bg-[#3A404D] text-white font-medium rounded-lg transition-colors"
        >
          Rebalance
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Strategy Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                APY
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Active Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {strategies && strategies.length > 0 ? (
              strategies.map((strategy, index) => {
                const isCurrentStrategy = currentStrategyAddress?.toLowerCase() === strategy.address.toLowerCase();
                
                return (
                  <tr
                    key={index}
                    className={`transition-colors ${
                      isCurrentStrategy
                        ? "bg-[#8795B3]/20 border-l-4 border-[#8795B3]"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          {formatAddress(strategy.address)}
                        </span>
                        {isCurrentStrategy && (
                          <span className="px-2 py-1 text-xs font-semibold bg-[#8795B3]/30 text-[#8795B3] rounded-full border border-[#8795B3]/50">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1 font-mono">
                        {strategy.address}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${
                        isCurrentStrategy ? "text-[#8795B3]" : "text-[#8795B3]"
                      }`}>
                        {formatAPY(strategy.apy)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          strategy.active
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                        }`}
                      >
                        {strategy.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-400">
                  No strategies available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
