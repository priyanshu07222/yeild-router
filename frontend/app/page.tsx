"use client";

import Link from "next/link";
import { useVault } from "@/hooks/useVault";

export default function Home() {
  const { totalAssets, totalShares } = useVault();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            DeFi Yield Router
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Automatically route your funds to the highest yield strategies
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Total Assets
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {totalAssets ? `${(Number(totalAssets) / 1e18).toFixed(2)}` : "0.00"}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Total Shares
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {totalShares ? `${(Number(totalShares) / 1e18).toFixed(2)}` : "0.00"}
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Link
            href="/deposit"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow text-center group"
          >
            <div className="text-4xl mb-4">💰</div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
              Deposit
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Deposit assets into the vault and start earning yield
            </p>
          </Link>

          <Link
            href="/withdraw"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow text-center group"
          >
            <div className="text-4xl mb-4">💸</div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400">
              Withdraw
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Withdraw your assets and shares from the vault
            </p>
          </Link>

          <Link
            href="/strategies"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow text-center group"
          >
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">
              Strategies
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              View available yield strategies and their APY
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
