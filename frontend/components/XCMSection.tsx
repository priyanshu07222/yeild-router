"use client";

import { motion } from "framer-motion";

const flowSteps = [
  "Deposit → Vault",
  "Vault detects best strategy",
  "Vault sends XCM message",
  "Assets move to target parachain",
];

export default function XCMSection() {
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
            Powered by Polkadot XCM
          </h2>
          <p className="landing-subtext text-base sm:text-lg md:text-xl max-w-xs sm:max-w-md md:max-w-2xl mx-auto">
            The vault routes liquidity across Polkadot parachains using cross-chain messaging.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto px-4">
          {/* Example flow */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card glass-outline rounded-xl sm:rounded-2xl p-6 sm:p-8"
          >
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Example flow</h3>
            <ul className="space-y-3">
              {flowSteps.map((step, index) => (
                <li key={index} className="flex items-center gap-3 text-[#8795B3] text-sm sm:text-base">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-[#8795B3]/20 border border-[#8795B3]/40 flex items-center justify-center text-[#A8C1D9] text-xs font-semibold">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Diagram: Vault → XCM → Strategy */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="glass-card glass-outline rounded-xl sm:rounded-2xl p-6 sm:p-8"
          >
            <h3 className="text-lg sm:text-xl font-bold text-white mb-6 text-center sm:text-left">
              Cross-chain path
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <div className="glass-card rounded-lg px-4 sm:px-6 py-3 sm:py-4 border border-[#8795B3]/30 min-w-[100px] sm:min-w-[120px] text-center">
                <p className="text-[#A8C1D9] text-xs uppercase tracking-wider mb-0.5">Vault</p>
                <p className="text-white font-semibold text-sm sm:text-base">Vault</p>
              </div>
              <div className="flex items-center text-[#8795B3] rotate-90 sm:rotate-0">
                <svg className="w-5 h-5 sm:w-8 sm:h-8 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
              <div className="glass-card rounded-lg px-4 sm:px-6 py-3 sm:py-4 border border-emerald-500/30 bg-emerald-500/5 min-w-[100px] sm:min-w-[120px] text-center">
                <p className="text-emerald-400/90 text-xs uppercase tracking-wider mb-0.5">Messaging</p>
                <p className="text-white font-semibold text-sm sm:text-base">XCM</p>
              </div>
              <div className="flex items-center text-[#8795B3] rotate-90 sm:rotate-0">
                <svg className="w-5 h-5 sm:w-8 sm:h-8 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
              <div className="glass-card rounded-lg px-4 sm:px-6 py-3 sm:py-4 border border-[#8795B3]/30 min-w-[100px] sm:min-w-[120px] text-center">
                <p className="text-[#A8C1D9] text-xs uppercase tracking-wider mb-0.5">Target</p>
                <p className="text-white font-semibold text-sm sm:text-base">Strategy</p>
              </div>
            </div>
            <p className="text-[#8795B3] text-xs sm:text-sm mt-6 text-center sm:text-left">
              Vault → XCM → Strategy: funds are routed to the best yield strategy on the target parachain via cross-chain message passing.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
