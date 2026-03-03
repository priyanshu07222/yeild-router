"use client";

import StrategyTable from "@/components/StrategyTable";

export default function StrategiesPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Yield Strategies</h1>
        <StrategyTable />
      </div>
    </div>
  );
}
