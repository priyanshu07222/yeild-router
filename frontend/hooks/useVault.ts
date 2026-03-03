"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { parseEther } from "viem";
import vaultABI from "@/contracts/abi.json";

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS || "0x0000000000000000000000000000000000000000";

export function useVault() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [error, setError] = useState<string | null>(null);

  // Read current user shares (reactive)
  const { data: userShares } = useReadContract({
    address: VAULT_ADDRESS as `0x${string}`,
    abi: vaultABI,
    functionName: "userShares",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Read total assets (reactive)
  const { data: totalAssets } = useReadContract({
    address: VAULT_ADDRESS as `0x${string}`,
    abi: vaultABI,
    functionName: "totalAssets",
  });

  // Deposit function
  const { writeContract: depositContract, data: depositHash, isPending: isDepositPending } = useWriteContract();
  const { isLoading: isDepositConfirming } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  // Withdraw function
  const { writeContract: withdrawContract, data: withdrawHash, isPending: isWithdrawPending } = useWriteContract();
  const { isLoading: isWithdrawConfirming } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  });

  /**
   * Deposit assets into the vault
   * @param amount - Amount to deposit (as string, will be converted to wei)
   */
  const deposit = async (amount: string) => {
    try {
      setError(null);
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error("Amount must be greater than 0");
      }
      const amountWei = parseEther(amount);
      
      await depositContract({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: vaultABI,
        functionName: "deposit",
        args: [amountWei],
      });
    } catch (err: any) {
      setError(err.message || "Deposit failed");
      throw err;
    }
  };

  /**
   * Withdraw shares from the vault
   * @param shares - Shares to withdraw (as string, will be converted to wei)
   */
  const withdraw = async (shares: string) => {
    try {
      setError(null);
      if (!shares || parseFloat(shares) <= 0) {
        throw new Error("Shares must be greater than 0");
      }
      const sharesWei = parseEther(shares);
      
      await withdrawContract({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: vaultABI,
        functionName: "withdraw",
        args: [sharesWei],
      });
    } catch (err: any) {
      setError(err.message || "Withdraw failed");
      throw err;
    }
  };

  /**
   * Get total assets in the vault
   * @returns Promise<bigint> - Total assets as bigint
   */
  const getTotalAssets = async (): Promise<bigint> => {
    if (!publicClient) {
      throw new Error("Public client not available");
    }

    try {
      const result = await publicClient.readContract({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: vaultABI,
        functionName: "totalAssets",
      });

      return BigInt(result.toString());
    } catch (err: any) {
      setError(err.message || "Failed to get total assets");
      throw err;
    }
  };

  /**
   * Get user shares for a specific address
   * @param userAddress - Address to query shares for
   * @returns Promise<bigint> - User shares as bigint
   */
  const getUserShares = async (userAddress: `0x${string}` | string): Promise<bigint> => {
    if (!publicClient) {
      throw new Error("Public client not available");
    }

    try {
      const address = typeof userAddress === "string" ? (userAddress as `0x${string}`) : userAddress;
      const result = await publicClient.readContract({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: vaultABI,
        functionName: "userShares",
        args: [address],
      });

      return BigInt(result.toString());
    } catch (err: any) {
      setError(err.message || "Failed to get user shares");
      throw err;
    }
  };

  const isLoading = isDepositPending || isDepositConfirming || isWithdrawPending || isWithdrawConfirming;

  return {
    deposit,
    withdraw,
    getTotalAssets,
    getUserShares,
    totalAssets: totalAssets ? BigInt(totalAssets.toString()) : null,
    userShares: userShares ? BigInt(userShares.toString()) : null,
    isLoading,
    error,
  };
}
