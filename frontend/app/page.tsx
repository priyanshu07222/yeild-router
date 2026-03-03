"use client";

import Link from "next/link";
import { useVault } from "@/hooks/useVault";

export default function Home() {
  const { totalAssets, totalShares } = useVault();

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            DeFi Yield Router
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Automatically route your funds to the highest yield strategies
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-2xl mx-auto">
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Total Assets
            </h3>
            <p className="text-3xl font-bold text-white">
              {totalAssets ? `${(Number(totalAssets) / 1e18).toFixed(2)}` : "0.00"}
            </p>
          </div>
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Total Shares
            </h3>
            <p className="text-3xl font-bold text-white">
              {totalShares ? `${(Number(totalShares) / 1e18).toFixed(2)}` : "0.00"}
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Link
            href="/deposit"
            className="glass-card glass-card-hover rounded-xl p-8 text-center group"
          >
            <div className="text-4xl mb-4">💰</div>
            <h2 className="text-2xl font-semibold mb-2 text-white group-hover:text-blue-400 transition-colors">
              Deposit
            </h2>
            <p className="text-gray-300">
              Deposit assets into the vault and start earning yield
            </p>
          </Link>

          <Link
            href="/withdraw"
            className="glass-card glass-card-hover rounded-xl p-8 text-center group"
          >
            <div className="text-4xl mb-4">💸</div>
            <h2 className="text-2xl font-semibold mb-2 text-white group-hover:text-red-400 transition-colors">
              Withdraw
            </h2>
            <p className="text-gray-300">
              Withdraw your assets and shares from the vault
            </p>
          </Link>

          <Link
            href="/strategies"
            className="glass-card glass-card-hover rounded-xl p-8 text-center group"
          >
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-2xl font-semibold mb-2 text-white group-hover:text-green-400 transition-colors">
              Strategies
            </h2>
            <p className="text-gray-300">
              View available yield strategies and their APY
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
