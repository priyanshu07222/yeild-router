"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-[#0F172B33] z-0 pointer-events-none" />
      
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
            className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-20 pointer-events-auto"
          >
            <Link
              href="/deposit"
              className="px-8 py-4 min-w-[260px] text-center rounded-2xl border border-[#8795B3]/45 bg-gradient-to-br from-[#8795B3]/85 to-[#5D6F94]/85 text-white font-semibold text-lg shadow-[0_8px_30px_rgba(135,149,179,0.25)] hover:from-[#93A0BE]/90 hover:to-[#6679A1]/90 hover:shadow-[0_10px_34px_rgba(135,149,179,0.35)] transition-all duration-300 cursor-pointer active:scale-[0.98]"
            >
              Start Earning
            </Link>
            <Link
              href="/strategies"
              className="px-8 py-4 min-w-[260px] text-center rounded-2xl border border-[#8795B3]/45 bg-gradient-to-br from-[#6F81A6]/75 to-[#4F5E7F]/75 text-white font-semibold text-lg shadow-[0_8px_30px_rgba(95,114,153,0.22)] hover:from-[#7C8DB0]/80 hover:to-[#58688A]/80 hover:shadow-[0_10px_34px_rgba(95,114,153,0.32)] transition-all duration-300 cursor-pointer active:scale-[0.98]"
            >
              View Strategies
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
