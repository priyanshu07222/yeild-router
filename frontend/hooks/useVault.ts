"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import vaultABI from "@/contracts/abi.json";

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS || "0x0000000000000000000000000000000000000000";

export function useVault() {
  const { address, isConnected } = useAccount();
  const [error, setError] = useState<string | null>(null);

  // Read user shares
  const { data: userShares } = useReadContract({
    address: VAULT_ADDRESS as `0x${string}`,
    abi: vaultABI,
    functionName: "userShares",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Read total shares
  const { data: totalShares } = useReadContract({
    address: VAULT_ADDRESS as `0x${string}`,
    abi: vaultABI,
    functionName: "totalShares",
  });

  // Read total assets
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

  const deposit = async (amount: string) => {
    try {
      setError(null);
      const amountWei = parseEther(amount);
      
      await depositContract({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: vaultABI,
        functionName: "deposit",
        args: [amountWei],
      });
    } catch (err: any) {
      setError(err.message || "Deposit failed");
    }
  };

  const withdraw = async (shares: string) => {
    try {
      setError(null);
      const sharesWei = parseEther(shares);
      
      await withdrawContract({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: vaultABI,
        functionName: "withdraw",
        args: [sharesWei],
      });
    } catch (err: any) {
      setError(err.message || "Withdraw failed");
    }
  };

  const isLoading = isDepositPending || isDepositConfirming || isWithdrawPending || isWithdrawConfirming;

  return {
    deposit,
    withdraw,
    userShares: userShares ? BigInt(userShares.toString()) : null,
    totalShares: totalShares ? BigInt(totalShares.toString()) : null,
    totalAssets: totalAssets ? BigInt(totalAssets.toString()) : null,
    isLoading,
    error,
  };
}
