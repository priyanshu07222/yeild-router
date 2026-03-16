# Deployment Guide — Polkadot Hub & Parachains

This guide covers deploying ParaX for **hackathon qualification** (Polkadot Hub) and optionally deploying strategy contracts on **parachains** (Moonbeam, Astar, HydraDX).

---

## What you need before deploying

### 1. Wallet and keys

- **Private key** of the deployer (EVM-style, hex with optional `0x`).
- Wallet must hold **native token** on each chain you deploy to (for gas):
  - **Polkadot Hub**: DOT or chain native token (see Hub docs).
  - **Moonbeam**: GLMR.
  - **Astar**: ASTR.
  - **HydraDX**: HDX or chain native (see HydraDX docs).

### 2. RPC endpoints

- **Polkadot Hub**  
  Use an **EVM-compatible** JSON-RPC endpoint (Foundry uses `eth_*` methods). Official testnet:

  | Network           | Chain flag              | RPC URL (EVM)                                      | Chain ID   |
  |-------------------|-------------------------|----------------------------------------------------|------------|
  | **Polkadot TestNet** | `--chain polkadot-testnet` | `https://services.polkadothub-rpc.com/testnet`     | `420420417` |
  | Polkadot (mainnet) | `--chain polkadot`      | `https://services.polkadothub-rpc.com/mainnet`    | `420420419` |

  **Yes, you can use** `https://services.polkadothub-rpc.com/testnet` to deploy; it is the official Polkadot Hub TestNet EVM RPC. Chain ID is **420420417**.

- **Parachains** (for strategy deployment):
  - **Moonbeam**: e.g. `https://rpc.api.moonbeam.network`
  - **Astar**: e.g. `https://evm.astar.network` or mainnet RPC from [Astar docs](https://docs.astar.network/)
  - **HydraDX**: use HydraDX EVM RPC if applicable; otherwise deploy only on Hub with mock strategies.

### 3. Asset (ERC20) address

- **On Polkadot Hub**: address of the ERC20 token the Vault will use as `asset`. For testing, use a mock ERC20 or the chain’s native-wrapped token if available.
- **On each parachain**: for `DeployParachainStrategy`, the ERC20 `ASSET_ADDRESS` must be valid on that chain (e.g. wrapped DOT, USDC, or a test token).

### 4. Environment variables (summary)

| Variable | Required | Used by | Description |
|----------|----------|---------|-------------|
| `PRIVATE_KEY` | Yes | Both scripts | Deployer private key (hex, e.g. `0x...`) |
| `ASSET_ADDRESS` | No | Both scripts | ERC20 on target chain; if unset, script deploys a mock ERC20 |
| `HUB_ONLY` | No | Hub script | Set to `true` to deploy only router on Hub (no strategies on Hub); then deploy strategies on parachains |
| `SKIP_XCM_ROUTER` | No | Hub script | Set to `true` to skip deploying XCMRouter (Vault gets address(0)); use when XCMRouter fails e.g. on Polkadot Hub (PUSH0) |
| `XCM_PRECOMPILE_ADDRESS` | No | Hub script | XCM precompile on Hub; omit or `0` for simulation |
| `PVM_OPTIMIZER_ADDRESS` | No | Hub script | Deployed PVM optimizer contract; omit or `0` for fallback |
| `STRATEGY_LABEL` | No | Parachain script | Label for logs (e.g. `Moonbeam`, `Astar`, `Hydration`) |

### 5. Tools

- **Foundry** (`forge`) installed.  
  For **Polkadot Hub** deployment, use the **nightly** build (adds native `--chain polkadot-testnet` and correct RPC):
  ```bash
  curl -L https://foundry.paradigm.xyz | bash
  foundryup --version nightly
  ```
  Then you can use `--chain polkadot-testnet` without passing the RPC URL, or pass it explicitly: `--rpc-url https://services.polkadothub-rpc.com/testnet`.

---

## Script 1: Deploy on Polkadot Hub

Deploys the **router stack** on Polkadot Hub. Optionally deploy strategies on the Hub (single-chain demo) or deploy strategies on parachains and register them later.

### Mode: router only (intended architecture)

Set **`HUB_ONLY=true`** to deploy only on the Hub: asset (or mock), **StrategyOptimizerAdapter**, **StrategyManager**, **XCMRouter**, **Vault**. No strategy contracts on the Hub. Then deploy strategies on Moonbeam, Astar, HydraDX with Script 2 and register them on the Hub via `StrategyManager.addStrategy(...)`.

### Mode: router + strategies on Hub (single-chain demo)

Omit `HUB_ONLY` or set `HUB_ONLY=false` to deploy the same router stack **plus** three MockStrategies on the Hub. All contracts on one chain (e.g. for local or testnet demo).

### Requirements

- Polkadot Hub RPC URL (EVM-compatible endpoint).
- `PRIVATE_KEY`. Optional: `ASSET_ADDRESS` (if unset, script deploys a mock ERC20).
- Optional: `HUB_ONLY=true` (router only, no strategies on Hub).
- Optional: **`SKIP_XCM_ROUTER=true`** — do not deploy XCMRouter; Vault gets `address(0)` and skips XCM in `rebalance()`. Use on Polkadot Hub if XCMRouter deploy fails (e.g. PUSH0).
- Optional: `XCM_PRECOMPILE_ADDRESS`, `PVM_OPTIMIZER_ADDRESS` (omit for simulation/fallback).

### Commands

```bash
cd contracts

export PRIVATE_KEY=0x...
# Optional: export ASSET_ADDRESS=0x...   # If unset, mock ERC20 is deployed
export HUB_ONLY=true
# On Polkadot Hub (if XCMRouter deploy fails): skip it so the rest of the stack deploys
export SKIP_XCM_ROUTER=true

export HUB_RPC_URL=https://services.polkadothub-rpc.com/testnet   # Chain ID: 420420417
forge script script/DeployPolkadotHub.s.sol:DeployPolkadotHub \
  --rpc-url $HUB_RPC_URL \
  --broadcast
```

### What gets deployed

| Contract | When |
|----------|------|
| Asset (or mock), StrategyOptimizerAdapter, StrategyManager, Vault | Always |
| XCMRouter | Only when `SKIP_XCM_ROUTER` is not set |
| MockStrategy × 3 on Hub | Only when `HUB_ONLY` is not set |

When `HUB_ONLY=true`, the script logs the calls to run on the Hub after you deploy strategies on parachains: `StrategyManager.addStrategy(moonbeamAddr, 800, 1284, 2)`, etc.

---

## Script 2: Deploy strategy on a parachain

Use this script **once per chain** to deploy a **single MockStrategy** on Moonbeam, Astar, or HydraDX. Run with that chain’s RPC and asset.

### Requirements per run

- RPC URL of the target parachain.
- `PRIVATE_KEY` (must have gas on that chain).
- `ASSET_ADDRESS`: ERC20 asset address **on that chain**.

### Commands (one per chain)

**Moonbeam**

```bash
cd contracts
export PRIVATE_KEY=0x...
export ASSET_ADDRESS=0x...        # ERC20 on Moonbeam
export STRATEGY_LABEL=Moonbeam    # optional

forge script script/DeployParachainStrategy.s.sol:DeployParachainStrategy \
  --rpc-url https://rpc.api.moonbeam.network \
  --broadcast
```

**Astar**

```bash
export ASSET_ADDRESS=0x...        # ERC20 on Astar
export STRATEGY_LABEL=Astar

forge script script/DeployParachainStrategy.s.sol:DeployParachainStrategy \
  --rpc-url https://evm.astar.network \
  --broadcast
```

**HydraDX** (use HydraDX EVM RPC if available)

```bash
export ASSET_ADDRESS=0x...        # ERC20 on HydraDX
export STRATEGY_LABEL=Hydration

forge script script/DeployParachainStrategy.s.sol:DeployParachainStrategy \
  --rpc-url <HYDRADX_EVM_RPC> \
  --broadcast
```

### After parachain deployment

The script logs the **strategy contract address**. To use it from the Hub:

1. On **Polkadot Hub**, call `StrategyManager.addStrategy(strategyAddress, apyBps, chainId, riskScore)` where:
   - `strategyAddress` = address logged from the parachain deploy.
   - `apyBps` = APY in basis points (e.g. 800 = 8%).
   - `chainId` = EVM chain ID: **1284** (Moonbeam), **592** (Astar), **2034** (HydraDX).
   - `riskScore` = risk value used in the optimizer (e.g. 2, 4, 7).

2. Ensure the Vault’s rebalance and XCM path are configured for cross-chain execution (XCM precompile on Hub, correct parachain IDs in production).

---

## Checklist

- [ ] Foundry installed (`forge --version`).
- [ ] Wallet funded with native token on Polkadot Hub (and on each parachain if you deploy strategies there).
- [ ] `PRIVATE_KEY` and `ASSET_ADDRESS` set for the target chain.
- [ ] **Hub**: Run `DeployPolkadotHub.s.sol` with Hub RPC; save Vault and StrategyManager addresses.
- [ ] **Parachains** (optional): Run `DeployParachainStrategy.s.sol` per chain; register each strategy in StrategyManager on the Hub with the correct `chainId`.

For **qualification**, deploying only on **Polkadot Hub** with Script 1 is enough; the three MockStrategies on the Hub are sufficient for the demo.
