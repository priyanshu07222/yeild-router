"use client";

import { motion } from "framer-motion";
import { TrendingUp, Calendar, Zap } from "lucide-react";

interface YieldProjectionCardProps {
  depositAmount?: number; // In dollars
  currentAPY?: number; // As percentage (e.g., 12 for 12%)
}

export default function YieldProjectionCard({
  depositAmount = 1000,
  currentAPY = 12,
}: YieldProjectionCardProps) {
  
  /**
   * Calculate future value with compound interest
   * Formula: futureValue = principal * (1 + APY * days / 365)
   * Using simple interest for short-term projections
   */
  const calculateFutureValue = (principal: number, apy: number, days: number): number => {
    const apyDecimal = apy / 100;
    const futureValue = principal * (1 + (apyDecimal * days) / 365);
    return futureValue;
  };

  /**
   * Calculate yield earned
   */
  const calculateYield = (principal: number, futureValue: number): number => {
    return futureValue - principal;
  };

  const projections = [
    {
      period: "7 Days",
      days: 7,
      icon: Zap,
      color: "#7C8CFF",
    },
    {
      period: "30 Days",
      days: 30,
      icon: Calendar,
      color: "#34D399",
    },
    {
      period: "90 Days",
      days: 90,
      icon: TrendingUp,
      color: "#F59E0B",
    },
  ];

  const formatCurrency = (value: number): string => {
    return value.toFixed(2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card rounded-xl p-6 sm:p-8 relative overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-[#8795B3]/10 blur-3xl pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Yield Projections</h2>
          <span className="px-2.5 py-1 text-[10px] sm:text-xs font-medium bg-[#8795B3]/20 text-[#8795B3] rounded-full border border-[#8795B3]/30">
            Estimated
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#8795B3]">
          Based on current APY of <span className="font-semibold text-[#8795B3]">{currentAPY}%</span>
        </p>
      </div>

      {/* Principal Display */}
      <div className="relative z-10 mb-6 p-4 sm:p-5 bg-[#8795B3]/5 border border-[#8795B3]/20 rounded-xl">
        <p className="text-xs sm:text-sm text-[#8795B3] mb-1">Initial Deposit</p>
        <p className="text-2xl sm:text-3xl font-bold text-white">
          ${formatCurrency(depositAmount)}
        </p>
      </div>

      {/* Projections Grid */}
      <div className="relative z-10 space-y-3 sm:space-y-4">
        {projections.map((projection, index) => {
          const futureValue = calculateFutureValue(depositAmount, currentAPY, projection.days);
          const yieldEarned = calculateYield(depositAmount, futureValue);
          const Icon = projection.icon;

          return (
            <motion.div
              key={projection.period}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: 4 }}
              className="p-4 sm:p-5 rounded-xl border transition-all cursor-default"
              style={{
                borderColor: `${projection.color}40`,
                background: `linear-gradient(135deg, ${projection.color}15 0%, rgba(15,23,43,0.2) 100%)`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: `${projection.color}20`,
                      border: `1px solid ${projection.color}40`,
                    }}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: projection.color }} />
                  </div>
                  
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-white">
                      {projection.period}
                    </p>
                    <p className="text-xs text-[#A8C1D9]">
                      +${formatCurrency(yieldEarned)} yield
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    ${formatCurrency(futureValue)}
                  </p>
                  <p
                    className="text-xs sm:text-sm font-semibold mt-0.5"
                    style={{ color: projection.color }}
                  >
                    +{((yieldEarned / depositAmount) * 100).toFixed(3)}%
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="relative z-10 mt-6 pt-4 border-t border-[#8795B3]/20">
        <p className="text-[10px] sm:text-xs text-[#8795B3]/70">
          💡 Projections assume constant APY. Actual returns may vary based on strategy performance and rebalancing.
        </p>
      </div>
    </motion.div>
  );
}
