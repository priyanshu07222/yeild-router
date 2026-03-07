"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from "recharts";

const data = [
  { name: "Moonbeam", value: 45, color: "#7C8CFF" },
  { name: "Astar", value: 30, color: "#34D399" },
  { name: "Hydration", value: 25, color: "#F59E0B" },
];

const COLORS = data.map((item) => item.color);

const renderActiveShape = (props: any) => {
  return <Sector {...props} outerRadius={(props.outerRadius ?? 100) + 8} />;
};

export default function StrategyAllocation() {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Strategy Allocation</h2>
        <span className="px-2.5 py-1 text-[10px] sm:text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full">
          Estimated
        </span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(undefined)}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(7, 27, 46, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "8px",
              color: "#FFFFFF",
            }}
            itemStyle={{ color: "#FFFFFF" }}
            labelStyle={{ color: "#A8C1D9" }}
            cursor={{ fill: "rgba(135, 149, 179, 0.15)" }}
            formatter={(value: number) => [`${value}%`, "Allocation"]}
          />
          <Legend
            wrapperStyle={{ color: "#8795B3" }}
            formatter={(value) => <span style={{ color: "#FFFFFF" }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Strategy Details */}
      <div className="mt-6 space-y-3">
        {data.map((strategy, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: strategy.color }}
              />
              <span className="text-[#8795B3]">{strategy.name}</span>
            </div>
            <span className="text-white font-semibold">{strategy.value}%</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
