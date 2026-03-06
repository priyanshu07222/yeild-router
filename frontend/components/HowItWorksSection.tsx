"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Deposit Assets",
    description:
      "Deposit your assets into the Yield Router vault. We support multiple ERC20 tokens.",
  },
  {
    number: "02",
    title: "Router Finds Best Strategy",
      description:
        "Our smart contract automatically identifies the strategy with the highest APY across all available parachains.",
  },
  {
    number: "03",
    title: "Auto Rebalance for Highest Yield",
    description:
      "The auto-rebalance bot continuously monitors APY and moves your funds to maximize returns.",
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
