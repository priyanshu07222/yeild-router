import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { defineChain } from "viem/chains/utils";

/** Polkadot Hub TestNet — default chain for ParaX (Vault, StrategyManager, etc.). */
export const polkadotHubTestnet = defineChain({
  id: 420420417,
  name: "Polkadot Hub TestNet",
  nativeCurrency: {
    name: "DOT",
    symbol: "DOT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://services.polkadothub-rpc.com/testnet"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://blockscout-testnet.polkadot.io",
    },
  },
});

const polkadotHubRpc = process.env.NEXT_PUBLIC_POLKADOT_HUB_RPC_URL || "https://services.polkadothub-rpc.com/testnet";

export const config = getDefaultConfig({
  appName: "ParaX",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "your-project-id",
  chains: [polkadotHubTestnet],
  transports: {
    [polkadotHubTestnet.id]: http(polkadotHubRpc),
  },
});
