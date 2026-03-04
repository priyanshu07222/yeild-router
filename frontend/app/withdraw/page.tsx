"use client";

import Navigation from "@/components/Navigation";
import WithdrawCard from "@/components/WithdrawCard";

export default function WithdrawPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-6 text-white">Withdraw Assets</h1>
        <WithdrawCard />
      </div>
    </div>
  );
}
