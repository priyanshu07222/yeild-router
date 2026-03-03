"use client";

import { useState, useEffect } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import vaultABI from "@/contracts/abi.json";
import strategyManagerABI from "@/contracts/strategyManagerABI.json";

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS || "0x0000000000000000000000000000000000000000";
const STRATEGY_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_STRATEGY_MANAGER_ADDRESS || "0x0000000000000000000000000000000000000000";

interface Strategy {
  name?: string;
  apy: number;
  active: boolean;
  totalAssets?: bigint;
  address: string;
}

export function useStrategies() {
  const { address } = useAccount();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Read strategy count
  const { data: strategyCount } = useReadContract({
    address: STRATEGY_MANAGER_ADDRESS as `0x${string}`,
    abi: strategyManagerABI,
    functionName: "getStrategyCount",
  });

  // Read best strategy
  const { data: bestStrategy } = useReadContract({
    address: STRATEGY_MANAGER_ADDRESS as `0x${string}`,
    abi: strategyManagerABI,
    functionName: "getBestStrategy",
  });

  // Rebalance function
  const { writeContract: rebalanceContract, data: rebalanceHash, isPending: isRebalancePending } = useWriteContract();
  const { isLoading: isRebalanceConfirming } = useWaitForTransactionReceipt({
    hash: rebalanceHash,
  });

  useEffect(() => {
    const fetchStrategies = async () => {
      if (!strategyCount) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const count = Number(strategyCount);
        const strategyPromises = [];

        for (let i = 0; i < count; i++) {
          // Read strategy from StrategyManager contract
          // Note: This would need to be implemented with useReadContract for each strategy
          // For now, we'll create a structure that can be enhanced
          strategyPromises.push(
            Promise.resolve({
              name: `Strategy ${i + 1}`,
              apy: 500 + i * 500, // This should be read from contract
              active: true, // This should be read from contract
              totalAssets: BigInt(0),
              address: `0x${i.toString().padStart(40, "0")}`, // This should be read from contract
            })
          );
        }

        const fetchedStrategies = await Promise.all(strategyPromises);
        setStrategies(fetchedStrategies);
      } catch (err: any) {
        setError(err.message || "Failed to fetch strategies");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStrategies();
  }, [strategyCount]);

  const rebalance = async () => {
    try {
      setError(null);
      // Note: Rebalance is owner-only, so this will only work if the connected wallet is the owner
      // Rebalance is called on the Vault contract, not StrategyManager
      await rebalanceContract({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: vaultABI,
        functionName: "rebalance",
      });
    } catch (err: any) {
      setError(err.message || "Rebalance failed");
    }
  };

  return {
    strategies,
    bestStrategy: bestStrategy as string | undefined,
    rebalance,
    isLoading: isLoading || isRebalancePending || isRebalanceConfirming,
    error,
  };
}
