"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-[#0F172B33] z-0" />
      
      <div className="container mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="landing-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight">
            Cross-Chain Yield
            <br />
            <span className="bg-gradient-to-r from-[#8795B3] to-[#3A404D] bg-clip-text text-transparent">
              Optimization
            </span>
            <br />
            on Polkadot
          </h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="landing-subtext text-lg sm:text-xl md:text-2xl mb-12 max-w-3xl mx-auto"
          >
            Automatically route your assets to the highest yield strategy across parachains.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="/deposit"
              className="btn-glow px-8 py-4 bg-[#8795B3] hover:bg-[#3A404D] text-white font-semibold rounded-lg transition-all duration-300 text-lg"
            >
              Start Earning
            </Link>
            <Link
              href="/strategies"
              className="glass-card glass-outline px-8 py-4 text-white font-semibold rounded-lg transition-all duration-300 text-lg hover:bg-[#8795B3]/20"
            >
              View Strategies
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
