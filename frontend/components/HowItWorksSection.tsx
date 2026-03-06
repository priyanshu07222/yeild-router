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
          className="text-center mb-12"
        >
          <h2 className="landing-heading text-3xl md:text-4xl mb-4">
            How It Works
          </h2>
          <p className="landing-subtext text-lg max-w-2xl mx-auto">
            Simple three-step process to start earning maximum yield
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 items-start">
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
              <div className="glass-card glass-outline rounded-xl p-8 glass-card-hover relative z-10 min-h-[260px] text-center md:text-left">
                <div className="text-5xl font-bold text-[#8795B3] mb-4 opacity-50">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-[#8795B3] leading-relaxed">
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
