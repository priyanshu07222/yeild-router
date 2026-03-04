"use client";

import DashboardSidebar from "@/components/DashboardSidebar";
import DepositCard from "@/components/DepositCard";

export default function DepositPage() {
  return (
    <div className="min-h-screen">
      <DashboardSidebar />
      <main className="p-4 pt-20 sm:p-6 sm:pt-24 lg:p-8 md:ml-64 md:pt-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-white">Deposit Assets</h1>
          <div className="max-w-2xl mx-auto">
            <DepositCard />
          </div>
        </div>
      </main>
    </div>
  );
}
