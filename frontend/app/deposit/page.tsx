"use client";

import DepositCard from "@/components/DepositCard";

export default function DepositPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-white">Deposit Assets</h1>
      <div className="max-w-2xl mx-auto">
        <DepositCard />
      </div>
    </div>
  );
}
