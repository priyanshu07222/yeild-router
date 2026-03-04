"use client";

import DashboardSidebar from "@/components/DashboardSidebar";
import ProfileHeader from "@/components/ProfileHeader";
import PortfolioStats from "@/components/PortfolioStats";
import PerformanceChart from "@/components/PerformanceChart";
import StrategyAllocation from "@/components/StrategyAllocation";
import TransactionHistory from "@/components/TransactionHistory";
import YieldAnalytics from "@/components/YieldAnalytics";

export default function ProfilePage() {
  return (
    <div className="min-h-screen">
      <DashboardSidebar />
      
      <main className="p-4 sm:p-6 lg:p-8 md:ml-64">
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
      </main>
    </div>
  );
}
