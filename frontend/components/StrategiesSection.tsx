"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const strategies = [
  {
    name: "Moonbeam",
    apy: "15.2%",
    tvl: "$2.4M",
    riskLevel: "Low",
  },
  {
    name: "Astar",
    apy: "12.8%",
    tvl: "$1.8M",
    riskLevel: "Medium",
  },
  {
    name: "Hydration",
    apy: "18.5%",
    tvl: "$950K",
    riskLevel: "Medium",
  },
];

const cardMotion = [
  { rotate: -2, y: -6 },
  { rotate: 1.5, y: -10 },
  { rotate: -1, y: -7 },
];

export default function StrategiesSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 85%", "end 30%"],
  });

  const cardX = [
    useTransform(scrollYProgress, [0.0, 0.4], [90, 0]),
    useTransform(scrollYProgress, [0.12, 0.55], [105, 0]),
    useTransform(scrollYProgress, [0.24, 0.7], [120, 0]),
  ];
  const cardOpacity = [
    useTransform(scrollYProgress, [0.0, 0.4], [0.4, 1]),
    useTransform(scrollYProgress, [0.12, 0.55], [0.4, 1]),
    useTransform(scrollYProgress, [0.24, 0.7], [0.4, 1]),
  ];
  const cardBlur = [
    useTransform(scrollYProgress, [0.0, 0.4], [10, 0]),
    useTransform(scrollYProgress, [0.12, 0.55], [10, 0]),
    useTransform(scrollYProgress, [0.24, 0.7], [10, 0]),
  ];
  const cardFilter = [
    useTransform(cardBlur[0], (v) => `blur(${v}px)`),
    useTransform(cardBlur[1], (v) => `blur(${v}px)`),
    useTransform(cardBlur[2], (v) => `blur(${v}px)`),
  ];
  const cardSettleRotate = [
    useTransform(scrollYProgress, [0.0, 0.4], [-4, 0]),
    useTransform(scrollYProgress, [0.12, 0.55], [3, 0]),
    useTransform(scrollYProgress, [0.24, 0.7], [-2, 0]),
  ];

  return (
    <section ref={sectionRef} className="landing-section">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-10 md:mb-12 px-4"
        >
          <h2 className="landing-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4">
            Multi-Chain Strategies
          </h2>
          <p className="landing-subtext text-base sm:text-lg md:text-xl max-w-xs sm:max-w-md md:max-w-2xl mx-auto">
            Access DeFi yield opportunities across Polkadot parachains. Risk scores range from 1 (safest) to 10 (highest risk).
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {strategies.map((strategy, index) => (
            <motion.div
              key={index}
              style={{
                x: cardX[index],
                opacity: cardOpacity[index],
                filter: cardFilter[index],
                rotate: cardSettleRotate[index],
              }}
              whileHover={{
                scale: 1.03,
                rotate: cardMotion[index].rotate,
                y: cardMotion[index].y,
                transition: { type: "spring", stiffness: 220, damping: 18 },
              }}
              className="glass-card glass-outline rounded-lg sm:rounded-xl p-6 sm:p-8 glass-card-hover relative overflow-hidden text-center md:text-left"
            >
              <motion.div
                className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#8795B3]/20 blur-2xl"
                animate={{
                  x: [0, -8, 4, 0],
                  y: [0, 6, -4, 0],
                  opacity: [0.35, 0.55, 0.45, 0.35],
                }}
                transition={{
                  duration: 5 + index,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <div className="flex flex-col items-center gap-3 mb-4 md:flex-row md:justify-between md:items-start">
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {strategy.name}
                </h3>
                <span
                  className="px-3 py-1 rounded-full border text-xs sm:text-sm font-semibold text-[#8795B3] bg-[#8795B3]/15 border-[#8795B3]/35"
                >
                  {strategy.riskLevel}
                </span>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <p className="text-[#8795B3] text-xs sm:text-sm mb-1">APY</p>
                  <motion.p
                    className="text-2xl sm:text-3xl font-bold text-[#8795B3]"
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 0.2 }}
                  >
                    {strategy.apy}
                  </motion.p>
                </div>
                
                <div>
                  <p className="text-[#8795B3] text-xs sm:text-sm mb-1">Total Value Locked</p>
                  <p className="text-lg sm:text-xl font-semibold text-white">
                    {strategy.tvl}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
