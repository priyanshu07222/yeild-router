"use client";

import Navigation from "@/components/Navigation";
import DepositCard from "@/components/DepositCard";

export default function DepositPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-6 text-white">Deposit Assets</h1>
        <DepositCard />
      </div>
    </div>
  );
}
