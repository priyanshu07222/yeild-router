'use client';

import { useEffect, useState } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { parseEther } from 'viem';
import vaultABI from '@/contracts/abi.json';
import erc20ABI from '@/contracts/erc20.json';

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS || '0x0000000000000000000000000000000000000000';

const toBigIntSafe = (value: unknown): bigint => {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') return BigInt(value);
  if (typeof value === 'string') return BigInt(value);
  throw new Error('Unexpected contract response type');
};

export function useVault() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [error, setError] = useState<string | null>(null);
  const [assetAddress, setAssetAddress] = useState<`0x${string}` | null>(null);

  // Discover underlying asset from the Vault
  useEffect(() => {
    const loadAsset = async () => {
      if (!publicClient || !VAULT_ADDRESS || VAULT_ADDRESS === '0x0000000000000000000000000000000000000000') return;
      try {
        const result = await publicClient.readContract({
          address: VAULT_ADDRESS as `0x${string}`,
          abi: vaultABI,
          functionName: 'asset',
        });
        setAssetAddress(result as `0x${string}`);
      } catch {
        // ignore, error will surface on deposit if misconfigured
      }
    };
    loadAsset();
  }, [publicClient]);

  // Read current user shares (reactive)
  const { data: userShares } = useReadContract({
    address: VAULT_ADDRESS as `0x${string}`,
    abi: vaultABI,
    functionName: 'userShares',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Read total assets (reactive)
  const { data: totalAssets } = useReadContract({
    address: VAULT_ADDRESS as `0x${string}`,
    abi: vaultABI,
    functionName: 'totalAssets',
  });

  // Deposit + approve functions
  const { writeContract: depositContract, data: depositHash, isPending: isDepositPending } = useWriteContract();
  const { writeContract: approveContract, data: approveHash } = useWriteContract();

  const { isLoading: isDepositConfirming } = useWaitForTransactionReceipt({
    hash: depositHash,
  });
  const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Withdraw function
  const { writeContract: withdrawContract, data: withdrawHash, isPending: isWithdrawPending } = useWriteContract();
  const { isLoading: isWithdrawConfirming } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  });

  /**
   * Deposit assets into the vault.
   * Automatically sends ERC20 approve if allowance is too low.
   */
  const deposit = async (amount: string) => {
    try {
      setError(null);
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      if (!publicClient) {
        throw new Error('Public client not available');
      }
      if (!address) {
        throw new Error('Wallet not connected');
      }

      const amountWei = parseEther(amount);

      // If we successfully detected the ERC20 asset, auto-manage allowance; otherwise just call deposit
      if (assetAddress) {
        const currentAllowance = (await publicClient.readContract({
          address: assetAddress,
          abi: erc20ABI,
          functionName: 'allowance',
          args: [address, VAULT_ADDRESS as `0x${string}`],
        })) as bigint;

        if (currentAllowance < amountWei) {
          await approveContract({
            address: assetAddress,
            abi: erc20ABI,
            functionName: 'approve',
            args: [VAULT_ADDRESS as `0x${string}`, amountWei],
          });
        }
      }

      // Call vault.deposit (will revert if user hasn't approved the Vault for the asset)
      await depositContract({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: vaultABI,
        functionName: 'deposit',
        args: [amountWei],
      });
    } catch (err: any) {
      setError(err?.shortMessage || err?.message || 'Deposit failed');
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
        throw new Error('Shares must be greater than 0');
      }
      const sharesWei = parseEther(shares);

      await withdrawContract({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: vaultABI,
        functionName: 'withdraw',
        args: [sharesWei],
      });
    } catch (err: any) {
      setError(err?.shortMessage || err?.message || 'Withdraw failed');
      throw err;
    }
  };

  /**
   * Get total assets in the vault
   * @returns Promise<bigint> - Total assets as bigint
   */
  const getTotalAssets = async (): Promise<bigint> => {
    if (!publicClient) {
      throw new Error('Public client not available');
    }

    try {
      const result = await publicClient.readContract({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: vaultABI,
        functionName: 'totalAssets',
      });

      return toBigIntSafe(result);
    } catch (err: any) {
      setError(err?.shortMessage || err?.message || 'Failed to get total assets');
      throw err;
    }
  };

  /**
   * Get user shares for a specific address
   */
  const getUserShares = async (userAddress: `0x${string}` | string): Promise<bigint> => {
    if (!publicClient) {
      throw new Error('Public client not available');
    }

    try {
      const addr = typeof userAddress === 'string' ? (userAddress as `0x${string}`) : userAddress;
      const result = await publicClient.readContract({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: vaultABI,
        functionName: 'userShares',
        args: [addr],
      });

      return toBigIntSafe(result);
    } catch (err: any) {
      setError(err?.shortMessage || err?.message || 'Failed to get user shares');
      throw err;
    }
  };

  const isLoading =
    isDepositPending || isDepositConfirming || isApproveConfirming || isWithdrawPending || isWithdrawConfirming;

  return {
    deposit,
    withdraw,
    getTotalAssets,
    getUserShares,
    totalAssets: totalAssets !== undefined ? toBigIntSafe(totalAssets) : null,
    userShares: userShares !== undefined ? toBigIntSafe(userShares) : null,
    isLoading,
    error,
  };
}

