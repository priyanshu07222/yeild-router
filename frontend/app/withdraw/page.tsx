"use client";

import WithdrawCard from "@/components/WithdrawCard";

export default function WithdrawPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Withdraw Assets</h1>
        <WithdrawCard />
      </div>
    </div>
  );
}
