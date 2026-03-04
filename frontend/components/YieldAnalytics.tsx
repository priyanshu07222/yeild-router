"use client";

import { motion } from "framer-motion";

const analytics = [
  {
    label: "Average APY",
    value: "14.8%",
    icon: "📊",
    description: "Your average yield across all strategies",
  },
  {
    label: "Best Strategy Used",
    value: "Moonbeam",
    icon: "🏆",
    description: "Highest performing strategy in your portfolio",
  },
  {
    label: "Total Rebalances",
    value: "12",
    icon: "🔄",
    description: "Automatic rebalances to optimize yield",
  },
];

export default function YieldAnalytics() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl p-6"
    >
      <h2 className="text-2xl font-bold text-white mb-6">Yield Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {analytics.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="glass-card rounded-xl p-6 glass-card-hover"
          >
            <div className="text-4xl mb-3">{item.icon}</div>
            <p className="text-[#8795B3] text-sm mb-2">{item.label}</p>
            <p className="text-2xl font-bold text-white mb-2">{item.value}</p>
            <p className="text-[#8795B3] text-xs">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
