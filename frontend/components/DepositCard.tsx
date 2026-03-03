"use client";

import { useState } from "react";
import { useVault } from "@/hooks/useVault";

export default function DepositCard() {
  const [amount, setAmount] = useState("");
  const { deposit, isLoading, error } = useVault();

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }
    await deposit(amount);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md">
      <h2 className="text-2xl font-semibold mb-4">Deposit to Vault</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-2">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            step="0.01"
            min="0"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          onClick={handleDeposit}
          disabled={isLoading || !amount || parseFloat(amount) <= 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          {isLoading ? "Processing..." : "Deposit"}
        </button>
      </div>
    </div>
  );
}
