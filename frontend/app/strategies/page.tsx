"use client";

import StrategyTable from "@/components/StrategyTable";

export default function StrategiesPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-white">Yield Strategies</h1>
      <StrategyTable />
    </div>
  );
}
