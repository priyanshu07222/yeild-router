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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-[#0C2A44]/50">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-[#A8C1D9] max-w-2xl mx-auto">
            Simple three-step process to start earning maximum yield
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-[#2B6EFF] to-transparent z-0" />
              )}
              
              <div className="glass-card rounded-xl p-8 glass-card-hover relative z-10">
                <div className="text-5xl font-bold text-[#2B6EFF] mb-4 opacity-50">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-[#A8C1D9] leading-relaxed">
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
