"use client";

import { motion } from "framer-motion";

const strategies = [
  {
    name: "Moonbeam",
    apy: "15.2%",
    tvl: "$2.4M",
    riskLevel: "Low",
    riskColor: "text-green-400",
  },
  {
    name: "Astar",
    apy: "12.8%",
    tvl: "$1.8M",
    riskLevel: "Medium",
    riskColor: "text-yellow-400",
  },
  {
    name: "Hydration",
    apy: "18.5%",
    tvl: "$950K",
    riskLevel: "Medium",
    riskColor: "text-yellow-400",
  },
];

export default function StrategiesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Available Strategies
          </h2>
          <p className="text-lg text-[#A8C1D9] max-w-2xl mx-auto">
            Choose from multiple yield strategies across Polkadot parachains
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {strategies.map((strategy, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="glass-card rounded-xl p-8 glass-card-hover"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-white">
                  {strategy.name}
                </h3>
                <span className={`text-sm font-semibold ${strategy.riskColor}`}>
                  {strategy.riskLevel}
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[#A8C1D9] text-sm mb-1">APY</p>
                  <p className="text-3xl font-bold text-[#4DA6FF]">
                    {strategy.apy}
                  </p>
                </div>
                
                <div>
                  <p className="text-[#A8C1D9] text-sm mb-1">Total Value Locked</p>
                  <p className="text-xl font-semibold text-white">
                    {strategy.tvl}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
