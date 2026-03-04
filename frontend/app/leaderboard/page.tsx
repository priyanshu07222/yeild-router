"use client";

import DashboardSidebar from "@/components/DashboardSidebar";
import { motion } from "framer-motion";

const monthlyRows = [
  { user: "EURIS", roi: "8.45% ($3.5K)", pnl: "$715" },
  { user: "NEMO", roi: "8.45% ($3.5K)", pnl: "$655" },
  { user: "PODDO", roi: "8.45% ($3.5K)", pnl: "$520" },
];

const rewards = [
  { place: "1st place", amount: "$560" },
  { place: "2nd place", amount: "$500" },
  { place: "3rd place", amount: "$480" },
  { place: "4th place", amount: "$210" },
  { place: "5th place", amount: "$180" },
  { place: "6th place", amount: "$160" },
  { place: "7th place", amount: "$140" },
];

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen">
      <DashboardSidebar />
      
      <main className="p-4 sm:p-6 lg:p-8 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Leaderboard
          </motion.h1>

          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <section className="min-w-0 xl:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="glass-card glass-outline rounded-3xl p-5 h-full min-h-[460px] flex flex-col"
              >
                <h3 className="text-white text-2xl font-semibold mb-5">Top 3 Podium</h3>
                <div className="flex items-end justify-center gap-2 md:gap-3 h-40">
                  <div className="w-20 md:w-24 h-24 bg-[#2c4f93] rounded-t-xl flex items-end justify-center pb-3 text-4xl font-bold text-white">
                    2
                  </div>
                  <div className="w-24 md:w-28 h-32 bg-[#3c69b7] rounded-t-xl flex items-end justify-center pb-4 text-5xl font-bold text-white">
                    1
                  </div>
                  <div className="w-20 md:w-24 h-20 bg-[#23417c] rounded-t-xl flex items-end justify-center pb-3 text-4xl font-bold text-white">
                    3
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-3">
                  <div className="glass-card rounded-2xl p-3 text-center">
                    <p className="text-[#8795B3] text-xs">1st</p>
                    <p className="text-white text-lg font-semibold">$560</p>
                  </div>
                  <div className="glass-card rounded-2xl p-3 text-center">
                    <p className="text-[#8795B3] text-xs">2nd</p>
                    <p className="text-white text-lg font-semibold">$500</p>
                  </div>
                  <div className="glass-card rounded-2xl p-3 text-center">
                    <p className="text-[#8795B3] text-xs">3rd</p>
                    <p className="text-white text-lg font-semibold">$480</p>
                  </div>
                </div>

                <div className="mt-auto pt-8">
                  <div className="glass-card rounded-2xl px-4 py-3 flex items-center justify-between">
                    <span className="text-[#8795B3]">Active Pool</span>
                    <span className="text-white font-semibold">$2,570</span>
                  </div>
                </div>
              </motion.div>
              </section>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="glass-card glass-outline rounded-3xl p-5 xl:col-span-2"
              >
                <h3 className="text-white text-xl font-semibold leading-tight mb-4">
                  Monthly
                  <br />
                  Rewards
                </h3>

                <div className="space-y-3">
                  {rewards.map((reward) => (
                    <div key={reward.place} className="glass-card rounded-2xl px-4 py-3 flex justify-between items-center">
                      <span className="text-white text-base md:text-lg">{reward.place}</span>
                      <span className="text-white text-xl md:text-2xl font-semibold">{reward.amount}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="glass-card glass-outline rounded-3xl p-4 md:p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h3 className="text-white text-2xl font-semibold">Monthly Leaderboard</h3>
                <div className="glass-card rounded-full p-1 inline-flex w-fit">
                  <button className="px-4 py-1.5 rounded-full bg-[#3A404D] text-white text-sm">Monthly</button>
                  <button className="px-4 py-1.5 rounded-full text-[#8795B3] text-sm">All Time</button>
                </div>
              </div>

              <div className="space-y-3">
                {monthlyRows.map((row) => (
                  <div key={row.user} className="glass-card rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
                    <p className="text-white font-medium">{row.user}</p>
                    <p className="text-green-300 text-sm">{row.roi}</p>
                    <p className="text-[#8795B3]">PnL: <span className="text-white">{row.pnl}</span></p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
