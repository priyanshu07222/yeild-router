"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useVault } from "@/hooks/useVault";

export default function DashboardPreview() {
  const { totalAssets } = useVault();
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 80%", "end 35%"],
  });

  const tvlX = useTransform(scrollYProgress, [0.0, 0.32], [-180, 0]);
  const tvlOpacity = useTransform(scrollYProgress, [0.0, 0.32], [0.45, 1]);
  const tvlBlur = useTransform(scrollYProgress, [0.0, 0.32], [12, 0]);
  const tvlFilter = useTransform(tvlBlur, (v) => `blur(${v}px)`);

  const card1X = useTransform(scrollYProgress, [0.0, 0.35], [240, 0]);
  const card2X = useTransform(scrollYProgress, [0.12, 0.52], [210, 0]);
  const card3X = useTransform(scrollYProgress, [0.26, 0.68], [180, 0]);

  const card1Opacity = useTransform(scrollYProgress, [0.0, 0.35], [0.45, 1]);
  const card2Opacity = useTransform(scrollYProgress, [0.12, 0.52], [0.45, 1]);
  const card3Opacity = useTransform(scrollYProgress, [0.26, 0.68], [0.45, 1]);

  const card1Blur = useTransform(scrollYProgress, [0.0, 0.35], [12, 0]);
  const card2Blur = useTransform(scrollYProgress, [0.12, 0.52], [12, 0]);
  const card3Blur = useTransform(scrollYProgress, [0.26, 0.68], [12, 0]);

  const card1Filter = useTransform(card1Blur, (v) => `blur(${v}px)`);
  const card2Filter = useTransform(card2Blur, (v) => `blur(${v}px)`);
  const card3Filter = useTransform(card3Blur, (v) => `blur(${v}px)`);

  const cardX = [card1X, card2X, card3X];
  const cardOpacity = [card1Opacity, card2Opacity, card3Opacity];
  const cardFilter = [card1Filter, card2Filter, card3Filter];

  const formatValue = (value: bigint | null) => {
    if (!value) return "0.00";
    return (Number(value) / 1e18).toFixed(2);
  };

  const stats = [
    { label: "Best Strategy", value: "Moonbeam", change: "15% APY", accent: "#7C8CFF" },
    { label: "Current APY", value: "15.2%", change: "+2.1%", accent: "#34D399" },
    { label: "User Deposits", value: `$${formatValue(totalAssets)}`, change: "Active", accent: "#F59E0B" },
  ];

  return (
    <section ref={sectionRef} className="landing-section">
      <div className="container mx-auto">
        <h2 className="landing-heading text-3xl md:text-4xl mb-8 text-center">
          Dashboard Preview
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-card glass-outline rounded-2xl p-8 md:p-12 relative overflow-hidden"
        >
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[#7C8CFF]/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-[#34D399]/12 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:hidden gap-6 items-center">
            <motion.div
              initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card rounded-2xl p-6 border border-[#8795B3]/30 text-center"
            >
              <p className="text-[#8795B3] text-sm mb-3">Total Value Locked</p>
              <p className="text-4xl md:text-5xl font-bold text-white mb-2">
                ${formatValue(totalAssets)}
              </p>
              <p className="text-[#34D399] text-sm mb-4">+12.5% this week</p>
              <div className="h-2 rounded-full bg-[#3A404D]/40 overflow-hidden max-w-xs mx-auto">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "78%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.1 }}
                  className="h-full bg-gradient-to-r from-[#7C8CFF] via-[#34D399] to-[#F59E0B]"
                />
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 25, x: 15, filter: "blur(10px)" }}
                  whileInView={{ opacity: 1, y: 0, x: 0, filter: "blur(0px)" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: 0.15 + index * 0.12 }}
                  className="glass-card rounded-xl p-5 border text-center"
                  style={{
                    borderColor: `${stat.accent}66`,
                    background: `linear-gradient(135deg, ${stat.accent}22 0%, rgba(15,23,43,0.25) 100%)`,
                  }}
                >
                  <p className="text-[#A8C1D9] text-xs mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm mt-1" style={{ color: stat.accent }}>{stat.change}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative z-10 hidden lg:grid lg:grid-cols-3 gap-6 items-start">
            <motion.div
              initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card rounded-2xl p-6 border border-[#8795B3]/30 lg:col-span-1 min-h-[280px] flex flex-col justify-between"
              style={{
                x: tvlX,
                opacity: tvlOpacity,
                filter: tvlFilter,
              }}
            >
              <p className="text-[#8795B3] text-sm mb-3">Total Value Locked</p>
              <p className="text-4xl md:text-5xl font-bold text-white mb-2">
                ${formatValue(totalAssets)}
              </p>
              <p className="text-[#34D399] text-sm mb-4">+12.5% this week</p>
              <div className="h-2 rounded-full bg-[#3A404D]/40 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "78%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.1 }}
                  className="h-full bg-gradient-to-r from-[#7C8CFF] via-[#34D399] to-[#F59E0B]"
                />
              </div>
            </motion.div>

            <div className="relative h-[420px] lg:col-span-2">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="absolute glass-card rounded-xl p-4 border w-[34%] min-h-[160px] flex flex-col justify-between"
                  style={{
                    top: `${index * 120}px`,
                    right: `${index * 31}%`,
                    rotate: index === 0 ? -6 : index === 1 ? 1 : 7,
                    zIndex: 10 + index,
                    x: cardX[index],
                    opacity: cardOpacity[index],
                    filter: cardFilter[index],
                    borderColor: `${stat.accent}66`,
                    background: `linear-gradient(135deg, ${stat.accent}22 0%, rgba(15,23,43,0.25) 100%)`,
                  }}
                >
                  <div className="relative z-20">
                    <p className="text-[#A8C1D9] text-xs mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm mt-1" style={{ color: stat.accent }}>{stat.change}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
