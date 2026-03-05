"use client";

import ProfileHeader from "@/components/ProfileHeader";
import PortfolioStats from "@/components/PortfolioStats";
import PerformanceChart from "@/components/PerformanceChart";
import StrategyAllocation from "@/components/StrategyAllocation";
import TransactionHistory from "@/components/TransactionHistory";
import YieldAnalytics from "@/components/YieldAnalytics";

export default function ProfilePage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Profile Header */}
      <ProfileHeader />

      {/* Portfolio Stats */}
      <PortfolioStats />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart />
        <StrategyAllocation />
      </div>

      {/* Transaction History */}
      <TransactionHistory />

      {/* Yield Analytics */}
      <YieldAnalytics />
    </div>
  );
}
