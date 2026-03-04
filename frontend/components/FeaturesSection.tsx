"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: "⚡",
    title: "Auto Rebalancing",
    description:
      "Automatically rebalances your assets to the highest-yielding strategy every 10 minutes, ensuring maximum returns.",
  },
  {
    icon: "🌐",
    title: "Cross-Chain Strategies",
    description:
      "Access yield opportunities across multiple Polkadot parachains including Moonbeam, Astar, and Hydration.",
  },
  {
    icon: "📈",
    title: "Maximum Yield Optimization",
    description:
      "Our algorithm continuously monitors APY across all strategies and routes funds to maximize your returns.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Key Features
          </h2>
          <p className="text-lg text-[#A8C1D9] max-w-2xl mx-auto">
            Everything you need to optimize your yield across the Polkadot ecosystem
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="glass-card rounded-xl p-8 glass-card-hover"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-[#A8C1D9] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
