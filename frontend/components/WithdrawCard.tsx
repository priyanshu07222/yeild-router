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
    <div className="glass-card rounded-xl p-6 max-w-md">
      <h2 className="text-2xl font-semibold mb-4 text-white">Withdraw from Vault</h2>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="shares" className="block text-sm font-medium text-[#8795B3]">
              Shares
            </label>
            {userShares && (
              <span className="text-sm text-[#8795B3]">
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
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#8795B3] focus:border-[#8795B3] text-white placeholder-[#8795B3]/50 backdrop-blur-sm"
              step="0.01"
              min="0"
            />
            <button
              onClick={handleMax}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-medium text-white transition-colors"
            >
              Max
            </button>
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm">{error}</div>
        )}

        <button
          onClick={handleWithdraw}
          disabled={isLoading || !shares || parseFloat(shares) <= 0}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          {isLoading ? "Processing..." : "Withdraw"}
        </button>
      </div>
    </div>
  );
}
