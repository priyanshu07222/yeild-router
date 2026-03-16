"use client";

import { useState, useEffect } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import vaultABI from "@/contracts/abi.json";
import strategyManagerABI from "@/contracts/strategyManagerABI.json";

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS || "0x0000000000000000000000000000000000000000";
const STRATEGY_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_STRATEGY_MANAGER_ADDRESS || "0x0000000000000000000000000000000000000000";

export interface Strategy {
  address: string;
  apy: number; // APY in basis points (e.g., 500 = 5%)
  chainId: number; // EVM chain ID (e.g., Moonbeam=1284, Astar=592, HydraDX=2034)
  riskScore: number; // Risk score from 1 (lowest) to 10 (highest)
  active: boolean;
}

export function useStrategies() {
  const publicClient = usePublicClient();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Read strategy count
  const { data: strategyCount, refetch: refetchCount } = useReadContract({
    address: STRATEGY_MANAGER_ADDRESS as `0x${string}`,
    abi: strategyManagerABI,
    functionName: "getStrategyCount",
  });

  // Rebalance function
  const { writeContract: rebalanceContract, data: rebalanceHash, isPending: isRebalancePending } = useWriteContract();
  const { isLoading: isRebalanceConfirming } = useWaitForTransactionReceipt({
    hash: rebalanceHash,
  });

  useEffect(() => {
    const fetchStrategies = async () => {
      if (!strategyCount || !publicClient) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const count = Number(strategyCount);
        const strategyPromises: Promise<Strategy>[] = [];

        for (let i = 0; i < count; i++) {
          strategyPromises.push(
            publicClient.readContract({
              address: STRATEGY_MANAGER_ADDRESS as `0x${string}`,
              abi: strategyManagerABI,
              functionName: "getStrategy",
              args: [BigInt(i)],
            }).then((result: any) => ({
              address: result.strategy as string,
              apy: Number(result.apy),
              chainId: Number(result.chainId),
              riskScore: Number(result.riskScore),
              active: result.active as boolean,
            }))
          );
        }

        const fetchedStrategies = await Promise.all(strategyPromises);
        setStrategies(fetchedStrategies);
      } catch (err: any) {
        setError(err.message || "Failed to fetch strategies");
        console.error("Error fetching strategies:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStrategies();
  }, [strategyCount, publicClient, rebalanceHash]);

  const rebalance = async () => {
    try {
      setError(null);
      await rebalanceContract({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: vaultABI,
        functionName: "rebalance",
      });
    } catch (err: any) {
      setError(err.message || "Rebalance failed");
      throw err;
    }
  };

  return {
    strategies,
    rebalance,
    isLoading: isLoading || isRebalancePending || isRebalanceConfirming,
    error,
    refetch: () => {
      refetchCount();
    },
  };
}
