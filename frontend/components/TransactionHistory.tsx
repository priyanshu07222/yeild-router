"use client";

import { motion } from "framer-motion";

// Mock transaction data - in production, fetch from blockchain
const transactions = [
  {
    date: "2024-01-15",
    type: "Deposit",
    amount: "100.00",
    strategy: "Moonbeam",
    hash: "0x1234...5678",
    color: "text-[#4DA6FF]",
  },
  {
    date: "2024-01-14",
    type: "Rebalance",
    amount: "100.00",
    strategy: "Astar → Moonbeam",
    hash: "0xabcd...efgh",
    color: "text-yellow-400",
  },
  {
    date: "2024-01-13",
    type: "Deposit",
    amount: "50.00",
    strategy: "Astar",
    hash: "0x9876...5432",
    color: "text-[#4DA6FF]",
  },
  {
    date: "2024-01-12",
    type: "Withdraw",
    amount: "25.00",
    strategy: "Moonbeam",
    hash: "0x1111...2222",
    color: "text-red-400",
  },
];

export default function TransactionHistory() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl p-6 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Transaction History</h2>
        <span className="px-2.5 py-1 text-[10px] sm:text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full">
          Demo Data
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-[#8795B3] text-sm font-medium">
                Date
              </th>
              <th className="text-left py-3 px-4 text-[#8795B3] text-sm font-medium">
                Type
              </th>
              <th className="text-left py-3 px-4 text-[#8795B3] text-sm font-medium">
                Amount
              </th>
              <th className="text-left py-3 px-4 text-[#8795B3] text-sm font-medium">
                Strategy
              </th>
              <th className="text-left py-3 px-4 text-[#8795B3] text-sm font-medium">
                Transaction Hash
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-4 px-4 text-white text-sm">{tx.date}</td>
                <td className="py-4 px-4">
                  <span className={`font-semibold ${tx.color}`}>{tx.type}</span>
                </td>
                <td className="py-4 px-4 text-white text-sm">${tx.amount}</td>
                  <td className="py-4 px-4 text-[#8795B3] text-sm">{tx.strategy}</td>
                <td className="py-4 px-4">
                  <a
                    href={`https://etherscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8795B3] hover:text-[#3A404D] text-sm font-mono transition-colors"
                  >
                    {tx.hash}
                  </a>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
