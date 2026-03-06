"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data - in production, fetch from API
const generateData = (days: number) => {
  const data = [];
  const baseValue = 1000;
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const value = baseValue + Math.random() * 200 + (days - i) * 5;
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: Math.round(value * 100) / 100,
    });
  }
  return data;
};

const timeFilters = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

export default function PerformanceChart() {
  const [selectedFilter, setSelectedFilter] = useState(7);
  const data = generateData(selectedFilter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Portfolio Performance</h2>
        <div className="flex gap-2">
          {timeFilters.map((filter) => (
            <button
              key={filter.days}
              onClick={() => setSelectedFilter(filter.days)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                selectedFilter === filter.days
                  ? "bg-[#7C8CFF] text-white"
                  : "glass-card text-[#8795B3] hover:text-white"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="date"
            stroke="#8795B3"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            stroke="#8795B3"
            style={{ fontSize: "12px" }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(7, 27, 46, 0.95)",
              border: "1px solid rgba(124, 140, 255, 0.5)",
              borderRadius: "8px",
              color: "#FFFFFF",
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, "Value"]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#7C8CFF"
            strokeWidth={2.5}
            dot={{ fill: "#34D399", r: 4 }}
            activeDot={{ r: 6, fill: "#F59E0B" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
