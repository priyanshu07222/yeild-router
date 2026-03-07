"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="landing-section">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-card glass-outline rounded-2xl p-12 md:p-16 text-center"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 px-2"
          >
            Deploy Your Yield Strategy
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#8795B3] mb-6 sm:mb-8 max-w-xs sm:max-w-md md:max-w-2xl mx-auto px-4"
          >
            Smart contract-based yield optimization with automated cross-chain rebalancing. Built on Foundry with comprehensive test coverage.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="px-4"
          >
            <Link
              href="/deposit"
              className="btn-glow inline-block w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-[#8795B3] hover:bg-[#3A404D] text-white font-semibold rounded-lg transition-all duration-300 text-base sm:text-lg md:text-xl min-w-[200px] sm:min-w-[240px] text-center"
            >
              Launch App
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
