"use client";

import DashboardSidebar from "@/components/DashboardSidebar";
import WithdrawCard from "@/components/WithdrawCard";

export default function WithdrawPage() {
  return (
    <div className="min-h-screen">
      <DashboardSidebar />
      <main className="p-4 sm:p-6 lg:p-8 md:ml-64">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-white">Withdraw Assets</h1>
          <WithdrawCard />
        </div>
      </main>
    </div>
  );
}
