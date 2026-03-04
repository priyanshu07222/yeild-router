"use client";

import DashboardSidebar from "@/components/DashboardSidebar";
import DepositCard from "@/components/DepositCard";

export default function DepositPage() {
  return (
    <div className="min-h-screen flex">
      <DashboardSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 md:ml-64">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-white">Deposit Assets</h1>
          <DepositCard />
        </div>
      </main>
    </div>
  );
}
