"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Deposit ERC20 Assets",
    description:
      "Transfer tokens to the Vault contract. Receive proportional shares representing your vault ownership. First deposit establishes 1:1 share ratio.",
  },
  {
    number: "02",
    title: "Risk-Adjusted Routing",
      description:
        "Smart contract calculates risk-adjusted scores (APY - risk×100) for all parachain strategies. Funds allocate to optimal strategy across Moonbeam, Astar, or Hydration.",
  },
  {
    number: "03",
    title: "Automated Rebalancing",
    description:
      "Cron job monitors strategy scores every 10 minutes. When a better opportunity emerges, funds migrate on-chain automatically. Zero user intervention required.",
  },
];

export default function HowItWorksSection() {
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
            How It Works
          </h2>
          <p className="landing-subtext text-base sm:text-lg md:text-xl max-w-xs sm:max-w-md md:max-w-2xl mx-auto">
            Simple three-step process to start earning maximum yield
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 items-start">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className={`relative ${
                index === 1 ? "md:translate-y-12 lg:translate-y-16" : "md:translate-y-0"
              }`}
            >
              <div className="glass-card glass-outline rounded-lg sm:rounded-xl p-6 sm:p-8 glass-card-hover relative z-10 min-h-[220px] sm:min-h-[260px] text-center md:text-left">
                <div className="text-4xl sm:text-5xl font-bold text-[#8795B3] mb-3 sm:mb-4 opacity-50">
                  {step.number}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                  {step.title}
                </h3>
                <p className="text-[#8795B3] text-sm sm:text-base leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
