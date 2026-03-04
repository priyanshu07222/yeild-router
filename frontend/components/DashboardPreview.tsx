"use client";

import { motion } from "framer-motion";
import { useVault } from "@/hooks/useVault";

export default function DashboardPreview() {
  const { totalAssets } = useVault();

  const formatValue = (value: bigint | null) => {
    if (!value) return "0.00";
    return (Number(value) / 1e18).toFixed(2);
  };

  const stats = [
    {
      label: "Total Value Locked",
      value: `$${formatValue(totalAssets)}`,
      change: "+12.5%",
      positive: true,
    },
    {
      label: "Best Strategy",
      value: "Moonbeam",
      change: "15% APY",
      positive: true,
    },
    {
      label: "Current APY",
      value: "15.2%",
      change: "+2.1%",
      positive: true,
    },
    {
      label: "User Deposits",
      value: `$${formatValue(totalAssets)}`,
      change: "Active",
      positive: true,
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-card rounded-2xl p-8 md:p-12 relative z-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            Dashboard Preview
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card rounded-xl p-6 glass-card-hover"
              >
                <p className="text-[#8795B3] text-sm mb-2">{stat.label}</p>
                <p className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {stat.value}
                </p>
                <p
                  className={`text-sm ${
                    stat.positive ? "text-[#8795B3]" : "text-red-400"
                  }`}
                >
                  {stat.change}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
