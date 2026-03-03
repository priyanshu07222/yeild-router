"use client";

import StrategyTable from "@/components/StrategyTable";

export default function StrategiesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Yield Strategies</h1>
      <StrategyTable />
    </div>
  );
}
