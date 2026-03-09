"use client";

import { useState, useEffect, useCallback } from "react";
import { usePublicClient, useWatchContractEvent } from "wagmi";
import xcmRouterABI from "@/contracts/xcmRouterABI.json";

const XCM_ROUTER_ADDRESS = (process.env.NEXT_PUBLIC_XCM_ROUTER_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

export interface XCMTransferEntry {
  fromChain: bigint;
  toChain: bigint;
  strategy: `0x${string}`;
  amount: bigint;
  blockNumber: bigint;
  timestamp: number;
}

interface XCMTransferLog {
  args: { fromChain?: bigint; toChain?: bigint; strategy?: `0x${string}`; amount?: bigint };
  blockNumber: bigint;
}

export function useXCMTransfers() {
  const publicClient = usePublicClient();
  const [transfers, setTransfers] = useState<XCMTransferEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistorical = useCallback(async () => {
    if (!publicClient || XCM_ROUTER_ADDRESS === "0x0000000000000000000000000000000000000000") {
      setIsLoading(false);
      return;
    }
    try {
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = currentBlock > BigInt(100000) ? currentBlock - BigInt(100000) : BigInt(0);
      const logs = await publicClient.getContractEvents({
        address: XCM_ROUTER_ADDRESS,
        abi: xcmRouterABI as readonly unknown[],
        eventName: "XCMTransfer",
        fromBlock,
        toBlock: "latest",
      });
      const withTimestamp: XCMTransferEntry[] = await Promise.all(
        logs.map(async (log) => {
          const decoded = log as unknown as XCMTransferLog;
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber }).catch(() => null);
          return {
            fromChain: decoded.args?.fromChain ?? BigInt(0),
            toChain: decoded.args?.toChain ?? BigInt(0),
            strategy: (decoded.args?.strategy as `0x${string}`) ?? "0x",
            amount: decoded.args?.amount ?? BigInt(0),
            blockNumber: log.blockNumber,
            timestamp: block?.timestamp ? Number(block.timestamp) * 1000 : Date.now(),
          };
        })
      );
      withTimestamp.sort((a, b) => (a.blockNumber > b.blockNumber ? -1 : a.blockNumber < b.blockNumber ? 1 : 0));
      setTransfers(withTimestamp);
    } catch {
      setTransfers([]);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient]);

  useEffect(() => {
    fetchHistorical();
  }, [fetchHistorical]);

  useWatchContractEvent({
    address: XCM_ROUTER_ADDRESS,
    abi: xcmRouterABI as readonly unknown[],
    eventName: "XCMTransfer",
    onLogs(logs) {
      if (!publicClient) return;
      logs.forEach(async (log) => {
        const decoded = log as unknown as XCMTransferLog;
        const args = decoded.args ?? {};
        const bn = log.blockNumber != null ? log.blockNumber : BigInt(0);
        const block = await publicClient.getBlock({ blockNumber: bn }).catch(() => null);
        setTransfers((prev) => [
          {
            fromChain: args.fromChain ?? BigInt(0),
            toChain: args.toChain ?? BigInt(0),
            strategy: (args.strategy as `0x${string}`) ?? "0x",
            amount: args.amount ?? BigInt(0),
            blockNumber: bn,
            timestamp: block?.timestamp ? Number(block.timestamp) * 1000 : Date.now(),
          },
          ...prev,
        ]);
      });
    },
  });

  return { transfers, isLoading };
}
