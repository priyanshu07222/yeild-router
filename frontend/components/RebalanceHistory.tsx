"use client";

import { motion } from "framer-motion";

// EVM chain ID to name (README: 1284 Moonbeam, 592 Astar, 2034 HydraDX)
const CHAIN_NAMES: Record<number, string> = {
  1284: "Moonbeam",
  592: "Astar",
  2034: "Hydration",
};

// Temporary mock data - will be replaced with real blockchain events
// TODO: Replace with actual Rebalance event queries using viem or The Graph
const MOCK_REBALANCE_HISTORY = [
  {
    timestamp: new Date("2026-03-07T10:30:00").getTime(),
    oldStrategy: "0x1234567890123456789012345678901234567890",
    oldChain: 592, // Astar
    newStrategy: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    newChain: 1284, // Moonbeam
    reason: "Higher APY (15% vs 12%)",
    txHash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",
  },
  {
    timestamp: new Date("2026-03-06T14:15:00").getTime(),
    oldStrategy: "0x2345678901234567890123456789012345678901",
    oldChain: 2034, // Hydration
    newStrategy: "0x1234567890123456789012345678901234567890",
    newChain: 592, // Astar
    reason: "Better risk-adjusted score",
    txHash: "0x2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab",
  },
  {
    timestamp: new Date("2026-03-05T08:45:00").getTime(),
    oldStrategy: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    oldChain: 1284, // Moonbeam
    newStrategy: "0x2345678901234567890123456789012345678901",
    newChain: 2034, // Hydration
    reason: "APY increase to 18%",
    txHash: "0x3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcd",
  },
];

interface RebalanceHistoryProps {
  maxItems?: number;
}

export default function RebalanceHistory({ maxItems = 10 }: RebalanceHistoryProps) {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const getChainName = (chainId: number) => {
    return CHAIN_NAMES[chainId] || `Chain ${chainId}`;
  };

  const displayedHistory = MOCK_REBALANCE_HISTORY.slice(0, maxItems);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-[#8795B3]/20">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Rebalance History</h2>
          <span className="px-3 py-1 text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full">
            Demo Data
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#8795B3] mt-1">
          Showing strategy allocation changes
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#8795B3]/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A8C1D9] uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A8C1D9] uppercase tracking-wider">
                From Strategy
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A8C1D9] uppercase tracking-wider">
                To Strategy
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A8C1D9] uppercase tracking-wider">
                Reason
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#8795B3]/10">
            {displayedHistory.map((event, index) => {
              const { date, time } = formatTimestamp(event.timestamp);
              
              return (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-[#8795B3]/5 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm text-white font-medium">{date}</p>
                      <p className="text-xs text-[#8795B3]">{time}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-white font-mono">
                        {formatAddress(event.oldStrategy)}
                      </p>
                      <p className="text-xs text-[#8795B3] mt-0.5">
                        {getChainName(event.oldChain)}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-white font-mono">
                        {formatAddress(event.newStrategy)}
                      </p>
                      <p className="text-xs text-emerald-400 mt-0.5">
                        {getChainName(event.newChain)}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#A8C1D9]">{event.reason}</span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3 p-4">
        {displayedHistory.map((event, index) => {
          const { date, time } = formatTimestamp(event.timestamp);
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-[#8795B3]/5 border border-[#8795B3]/20 rounded-lg p-4 space-y-3"
            >
              {/* Timestamp */}
              <div className="flex items-center justify-between pb-2 border-b border-[#8795B3]/15">
                <div>
                  <p className="text-sm text-white font-medium">{date}</p>
                  <p className="text-xs text-[#8795B3]">{time}</p>
                </div>
              </div>

              {/* From/To */}
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-[#8795B3] mb-1">From</p>
                  <p className="text-sm text-white font-mono">{formatAddress(event.oldStrategy)}</p>
                  <p className="text-xs text-[#8795B3] mt-0.5">{getChainName(event.oldChain)}</p>
                </div>
                
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#8795B3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>

                <div>
                  <p className="text-xs text-[#8795B3] mb-1">To</p>
                  <p className="text-sm text-white font-mono">{formatAddress(event.newStrategy)}</p>
                  <p className="text-xs text-emerald-400 mt-0.5">{getChainName(event.newChain)}</p>
                </div>
              </div>

              {/* Reason */}
              <div className="pt-2 border-t border-[#8795B3]/15">
                <p className="text-xs text-[#8795B3] mb-1">Reason</p>
                <p className="text-sm text-[#A8C1D9]">{event.reason}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {displayedHistory.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-sm text-[#A8C1D9]">No rebalance events yet</p>
        </div>
      )}

      {/* Footer Note */}
      <div className="px-4 sm:px-6 py-3 bg-[#8795B3]/5 border-t border-[#8795B3]/20">
        <p className="text-xs text-[#8795B3]/80">
          💡 Tip: In production, this will display real blockchain events indexed from Vault.Rebalance emissions
        </p>
      </div>
    </motion.div>
  );
}
