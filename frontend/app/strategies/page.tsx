"use client";

import { motion } from "framer-motion";
import StrategyTable from "@/components/StrategyTable";
import RebalanceHistory from "@/components/RebalanceHistory";

export default function StrategiesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-white"
      >
        Yield Strategies
      </motion.h1>
      
      <div className="space-y-6 sm:space-y-8">
        <StrategyTable />
        <RebalanceHistory maxItems={5} />
      </div>
    </div>
  );
}
