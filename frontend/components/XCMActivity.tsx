"use client";

import { motion } from "framer-motion";
import { useXCMTransfers } from "@/hooks/useXCMTransfers";

const CHAIN_NAMES: Record<number, string> = {
  1284: "Moonbeam",
  592: "Astar",
  2034: "Hydration",
};

function getChainName(chainId: bigint): string {
  const id = Number(chainId);
  return CHAIN_NAMES[id] ?? `Chain ${id}`;
}

function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatAmount(amount: bigint): string {
  const value = Number(amount) / 1e18;
  return value >= 1e6 ? value.toExponential(2) : value.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

function formatTimestamp(ts: number): { date: string; time: string } {
  const date = new Date(ts);
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
}

export default function XCMActivity() {
  const { transfers, isLoading } = useXCMTransfers();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl p-6 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">XCM Activity</h2>
        <span className="px-2.5 py-1 text-[10px] sm:text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full">
          Live
        </span>
      </div>
      <p className="text-sm text-[#8795B3] mb-4">
        Cross-chain transfers via XCM (Polkadot parachains)
      </p>

      {isLoading ? (
        <div className="py-12 text-center">
          <p className="text-[#A8C1D9] text-sm">Loading XCM transfers...</p>
        </div>
      ) : transfers.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[#A8C1D9] text-sm">No XCM transfers yet</p>
          <p className="text-[#8795B3] text-xs mt-1">Transfers will appear when the vault rebalances across chains</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-[#8795B3] text-sm font-medium">From Chain</th>
                  <th className="text-left py-3 px-4 text-[#8795B3] text-sm font-medium">To Chain</th>
                  <th className="text-left py-3 px-4 text-[#8795B3] text-sm font-medium">Strategy</th>
                  <th className="text-left py-3 px-4 text-[#8795B3] text-sm font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-[#8795B3] text-sm font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((tx, index) => {
                  const { date, time } = formatTimestamp(tx.timestamp);
                  return (
                    <motion.tr
                      key={`${tx.blockNumber}-${index}-${tx.amount}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-4 text-white text-sm">{getChainName(tx.fromChain)}</td>
                      <td className="py-4 px-4 text-white text-sm">{getChainName(tx.toChain)}</td>
                      <td className="py-4 px-4 text-[#8795B3] text-sm font-mono">{formatAddress(tx.strategy)}</td>
                      <td className="py-4 px-4 text-white text-sm">{formatAmount(tx.amount)}</td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white text-sm">{date}</p>
                          <p className="text-[#8795B3] text-xs">{time}</p>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {transfers.map((tx, index) => {
              const { date, time } = formatTimestamp(tx.timestamp);
              return (
                <motion.div
                  key={`${tx.blockNumber}-${index}-${tx.amount}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-[#8795B3]/5 border border-[#8795B3]/20 rounded-lg p-4 space-y-3"
                >
                  <p className="text-emerald-400/90 text-xs font-medium">Cross-chain transfer via XCM</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-[#8795B3] text-xs">From Chain</p>
                      <p className="text-white">{getChainName(tx.fromChain)}</p>
                    </div>
                    <div>
                      <p className="text-[#8795B3] text-xs">To Chain</p>
                      <p className="text-white">{getChainName(tx.toChain)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[#8795B3] text-xs">Strategy</p>
                      <p className="text-white font-mono text-xs">{formatAddress(tx.strategy)}</p>
                    </div>
                    <div>
                      <p className="text-[#8795B3] text-xs">Amount</p>
                      <p className="text-white">{formatAmount(tx.amount)}</p>
                    </div>
                    <div>
                      <p className="text-[#8795B3] text-xs">Time</p>
                      <p className="text-white text-xs">{date} {time}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Table caption / type label on desktop */}
          <p className="text-xs text-[#8795B3]/80 mt-4 pt-3 border-t border-[#8795B3]/20">
            Each row: <span className="text-emerald-400/90">Cross-chain transfer via XCM</span>
          </p>
        </>
      )}
    </motion.div>
  );
}
