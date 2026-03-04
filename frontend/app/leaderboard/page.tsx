"use client";

import DashboardSidebar from "@/components/DashboardSidebar";
import { motion } from "framer-motion";

// Mock leaderboard data
const leaderboard = [
  { rank: 1, address: "0x1234...5678", deposited: "$50,000", yield: "$7,500", apy: "15.0%" },
  { rank: 2, address: "0xabcd...efgh", deposited: "$45,000", yield: "$6,300", apy: "14.0%" },
  { rank: 3, address: "0x9876...5432", deposited: "$40,000", yield: "$5,600", apy: "14.0%" },
];

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen flex">
      <DashboardSidebar />
      
      <main className="flex-1 p-4 sm:p-6 lg:p-8 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-8"
          >
            Leaderboard
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 overflow-hidden"
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-[#A8C1D9] text-sm font-medium">Rank</th>
                  <th className="text-left py-3 px-4 text-[#A8C1D9] text-sm font-medium">Address</th>
                  <th className="text-left py-3 px-4 text-[#A8C1D9] text-sm font-medium">Deposited</th>
                  <th className="text-left py-3 px-4 text-[#A8C1D9] text-sm font-medium">Yield</th>
                  <th className="text-left py-3 px-4 text-[#A8C1D9] text-sm font-medium">APY</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr
                    key={index}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-4 text-white font-bold">#{entry.rank}</td>
                    <td className="py-4 px-4 text-[#A8C1D9] font-mono text-sm">{entry.address}</td>
                    <td className="py-4 px-4 text-white">{entry.deposited}</td>
                    <td className="py-4 px-4 text-[#4DA6FF]">{entry.yield}</td>
                    <td className="py-4 px-4 text-[#2B6EFF] font-semibold">{entry.apy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
