"use client";

import { useState } from "react";
import { useVault } from "@/hooks/useVault";

export default function WithdrawCard() {
  const [shares, setShares] = useState("");
  const { withdraw, userShares, isLoading, error } = useVault();

  const handleWithdraw = async () => {
    if (!shares || parseFloat(shares) <= 0) {
      return;
    }
    await withdraw(shares);
  };

  const handleMax = () => {
    if (userShares) {
      setShares(userShares.toString());
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md">
      <h2 className="text-2xl font-semibold mb-4">Withdraw from Vault</h2>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="shares" className="block text-sm font-medium">
              Shares
            </label>
            {userShares && (
              <span className="text-sm text-gray-500">
                Available: {userShares.toString()}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              id="shares"
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="0.00"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              step="0.01"
              min="0"
            />
            <button
              onClick={handleMax}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-sm font-medium"
            >
              Max
            </button>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          onClick={handleWithdraw}
          disabled={isLoading || !shares || parseFloat(shares) <= 0}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          {isLoading ? "Processing..." : "Withdraw"}
        </button>
      </div>
    </div>
  );
}
