"use client";

import Navigation from "@/components/Navigation";
import StrategyTable from "@/components/StrategyTable";

export default function StrategiesPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-6 text-white">Yield Strategies</h1>
        <StrategyTable />
      </div>
    </div>
  );
}
