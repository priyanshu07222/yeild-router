"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const features = [
  {
    icon: "⚡",
    title: "Auto Rebalancing",
    description:
      "Automatically rebalances your assets to the highest-yielding strategy every 10 minutes, ensuring maximum returns.",
  },
  {
    icon: "🌐",
    title: "Cross-Chain Strategies",
    description:
      "Access yield opportunities across multiple Polkadot parachains including Moonbeam, Astar, and Hydration.",
  },
  {
    icon: "📈",
    title: "Maximum Yield Optimization",
    description:
      "Our algorithm continuously monitors APY across all strategies and routes funds to maximize your returns.",
  },
];

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Keep all cards visible; reveal one at a time while other two stay blurred
  const card1Opacity = useTransform(scrollYProgress, [0, 0.22, 0.35], [1, 1, 0.55]);
  const card1Blur = useTransform(scrollYProgress, [0, 0.22, 0.35], [0, 0, 10]);
  const card1Filter = useTransform(card1Blur, (v) => `blur(${v}px)`);

  const card2Opacity = useTransform(scrollYProgress, [0.22, 0.42, 0.64, 0.8], [0.55, 1, 1, 0.55]);
  const card2Blur = useTransform(scrollYProgress, [0.22, 0.42, 0.64, 0.8], [10, 0, 0, 10]);
  const card2Filter = useTransform(card2Blur, (v) => `blur(${v}px)`);

  const card3Opacity = useTransform(scrollYProgress, [0.62, 0.82, 1], [0.55, 1, 1]);
  const card3Blur = useTransform(scrollYProgress, [0.62, 0.82, 1], [10, 0, 0]);
  const card3Filter = useTransform(card3Blur, (v) => `blur(${v}px)`);

  return (
    <section id="features" ref={sectionRef} className="relative">
      {/* Desktop animated story layout */}
      <div className="hidden lg:block h-[260vh]">
        <div className="sticky top-0 h-screen px-6 xl:px-10 flex items-center">
          <div className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-8 sm:mb-10 md:mb-12 px-4">
              <h2 className="landing-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4">Key Features</h2>
              <p className="landing-subtext text-base sm:text-lg md:text-xl lg:text-2xl max-w-xs sm:max-w-md md:max-w-2xl mx-auto">
                Everything you need to optimize your yield across the Polkadot ecosystem
              </p>
            </div>

            <div className="relative h-[430px]">
              <motion.div
                style={{
                  x: -360,
                  y: 35,
                  rotate: -8,
                  opacity: card1Opacity,
                  filter: card1Filter,
                }}
                className="absolute left-1/2 top-1/2 w-[420px] -translate-x-1/2 -translate-y-1/2 glass-card glass-outline rounded-2xl p-8"
              >
                <div className="text-5xl mb-4">{features[0].icon}</div>
                <h3 className="text-3xl font-bold text-white mb-4">{features[0].title}</h3>
                <p className="text-[#8795B3] text-lg leading-relaxed">{features[0].description}</p>
              </motion.div>

              <motion.div
                style={{
                  x: 0,
                  y: 0,
                  rotate: 0,
                  opacity: card2Opacity,
                  filter: card2Filter,
                }}
                className="absolute left-1/2 top-1/2 w-[420px] -translate-x-1/2 -translate-y-1/2 glass-card glass-outline rounded-2xl p-8"
              >
                <div className="text-5xl mb-4">{features[1].icon}</div>
                <h3 className="text-3xl font-bold text-white mb-4">{features[1].title}</h3>
                <p className="text-[#8795B3] text-lg leading-relaxed">{features[1].description}</p>
              </motion.div>

              <motion.div
                style={{
                  x: 360,
                  y: 35,
                  rotate: 8,
                  opacity: card3Opacity,
                  filter: card3Filter,
                }}
                className="absolute left-1/2 top-1/2 w-[420px] -translate-x-1/2 -translate-y-1/2 glass-card glass-outline rounded-2xl p-8"
              >
                <div className="text-5xl mb-4">{features[2].icon}</div>
                <h3 className="text-3xl font-bold text-white mb-4">{features[2].title}</h3>
                <p className="text-[#8795B3] text-lg leading-relaxed">{features[2].description}</p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/tablet fallback */}
      <div className="landing-section lg:hidden">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-10 md:mb-12 px-4"
          >
            <h2 className="landing-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4">Key Features</h2>
            <p className="landing-subtext text-base sm:text-lg md:text-xl max-w-xs sm:max-w-md md:max-w-2xl mx-auto">
              Everything you need to optimize your yield across the Polkadot ecosystem
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => {
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="glass-card glass-outline rounded-xl p-8 glass-card-hover text-center sm:text-left"
              >
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{feature.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-[#8795B3] text-sm sm:text-base leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
          </div>
        </div>
      </div>
    </section>
  );
}
