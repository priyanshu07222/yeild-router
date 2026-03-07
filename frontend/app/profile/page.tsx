"use client";

import ProfileHeader from "@/components/ProfileHeader";
import PortfolioStats from "@/components/PortfolioStats";
import PerformanceChart from "@/components/PerformanceChart";
import StrategyAllocation from "@/components/StrategyAllocation";
import TransactionHistory from "@/components/TransactionHistory";
import YieldAnalytics from "@/components/YieldAnalytics";
import YieldProjectionCard from "@/components/YieldProjectionCard";

export default function ProfilePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
      {/* Profile Header */}
      <ProfileHeader />

      {/* Portfolio Stats */}
      <PortfolioStats />

      {/* Charts and Projections Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PerformanceChart />
        <YieldProjectionCard depositAmount={1000} currentAPY={15.2} />
      </div>

      {/* Strategy Allocation */}
      <StrategyAllocation />

      {/* Transaction History */}
      <TransactionHistory />

      {/* Yield Analytics */}
      <YieldAnalytics />
    </div>
  );
}
