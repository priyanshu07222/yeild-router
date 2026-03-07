"use client";

import { motion } from "framer-motion";
import { Code2, Shield, Zap, GitBranch } from "lucide-react";

const technicalFeatures = [
  {
    icon: Code2,
    title: "Smart Contract Architecture",
    details: [
      "ERC4626-style share-based accounting",
      "Modular strategy interface (StrategyBase)",
      "ReentrancyGuard protection",
      "SafeERC20 token handling",
    ],
  },
  {
    icon: Shield,
    title: "Risk-Aware Algorithm",
    details: [
      "Score formula: APY - (risk × 100)",
      "Risk scores: 1 (safest) to 10 (highest)",
      "Balances yield vs risk exposure",
      "Configurable per strategy",
    ],
  },
  {
    icon: GitBranch,
    title: "Cross-Chain Support",
    details: [
      "Multi-parachain strategy registry",
      "ChainId-based routing (Moonbeam, Astar, Hydration)",
      "XCM bridge integration ready",
      "Extensible to new parachains",
    ],
  },
  {
    icon: Zap,
    title: "Automated Execution",
    details: [
      "Node.js cron job (10-min intervals)",
      "On-chain rebalancing transactions",
      "Event-driven analytics",
      "Zero manual intervention",
    ],
  },
];

export default function TechnicalDetails() {
  return (
    <section className="landing-section">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-10 md:mb-12 px-4"
        >
          <h2 className="landing-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4">
            Technical Architecture
          </h2>
          <p className="landing-subtext text-base sm:text-lg md:text-xl max-w-xs sm:max-w-md md:max-w-2xl mx-auto">
            Production-ready smart contracts built with Foundry
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
          {technicalFeatures.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="glass-card glass-outline rounded-lg sm:rounded-xl p-6 sm:p-8 glass-card-hover relative overflow-hidden"
              >
                {/* Icon */}
                <div className="mb-4 sm:mb-5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#8795B3]/15 border border-[#8795B3]/30 flex items-center justify-center">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-[#8795B3]" strokeWidth={2} />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
                  {feature.title}
                </h3>

                {/* Details List */}
                <ul className="space-y-2 sm:space-y-2.5">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#8795B3] mt-1.5 text-xs">▸</span>
                      <span className="text-[#8795B3] text-sm sm:text-base leading-relaxed">
                        {detail}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Ambient glow */}
                <div
                  className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-20 pointer-events-none"
                  style={{ background: "#8795B3" }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
