# Cross-Chain Yield Router

A DeFi yield routing system that automatically allocates user deposits to the highest-yielding strategy across different parachains (Moonbeam, Astar, etc.).

## 🏗️ Project Structure

```
yield-router/
│
├── contracts/              # Solidity smart contracts
│   ├── src/
│   │   ├── Vault.sol              # Main vault contract
│   │   ├── StrategyManager.sol   # Manages strategies
│   │   ├── MockStrategy.sol       # Mock strategy for testing
│   │   └── StrategyBase.sol       # Abstract strategy interface
│   │
│   ├── test/
│   │   ├── Vault.t.sol            # Vault tests
│   │   └── YieldSimulation.t.sol  # Yield simulation tests
│   │
│   └── script/
│       ├── DeployVault.s.sol      # Deployment script
│       └── DemoScenario.s.sol     # Demo script for judges
│
├── frontend/              # Next.js frontend
│   ├── app/               # Next.js app router
│   ├── components/        # React components
│   ├── hooks/             # React hooks (useVault, useStrategies)
│   └── contracts/         # Contract ABIs
│
└── backend/               # Auto-rebalance bot
    ├── src/
    │   └── index.ts       # Cron job bot
    └── contracts/         # Contract ABIs
```

## 🚀 Quick Start

### 1. Deploy Contracts

```bash
cd contracts
forge install
forge script script/DeployVault.s.sol --rpc-url $RPC_URL --broadcast --private-key $PRIVATE_KEY
```

### 2. Run Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

### 3. Start Auto-Rebalance Bot

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your contract addresses and RPC URL
npm run build
npm start
```

## 📋 Demo Flow

See [DEMO.md](./DEMO.md) for the complete demo flow showing:

1. **User deposits 100 tokens** → Astar selected (10% APY)
2. **Update Moonbeam APY to 15%** → Rebalance → Funds move to Moonbeam
3. **User withdraws** → Receives 110 tokens (10% yield)

Run the demo:
```bash
cd contracts
forge script script/DemoScenario.s.sol --rpc-url $RPC_URL --broadcast --private-key $PRIVATE_KEY -vvvv
```

## 🔄 Auto-Rebalance Bot

The bot runs every 10 minutes and automatically:
- Checks current strategy vs best strategy
- Calls `rebalance()` if better APY is available
- Ensures funds always earn maximum yield

See [backend/README.md](./backend/README.md) for setup and deployment.

## 🧪 Testing

```bash
cd contracts
forge test -vvv
```

## 📚 Documentation

- [DEMO.md](./DEMO.md) - Demo flow for judges
- [contracts/README.md](./contracts/README.md) - Contract documentation
- [backend/README.md](./backend/README.md) - Bot setup guide

## 🎯 Key Features

- ✅ Automatic strategy selection (highest APY)
- ✅ Dynamic rebalancing
- ✅ Cross-chain yield routing simulation
- ✅ Auto-rebalance bot (production-ready)
- ✅ Comprehensive test coverage
- ✅ Modern frontend with glassmorphism UI

## 🔐 Security

- ReentrancyGuard protection
- SafeERC20 for token transfers
- Owner-only rebalance function
- Comprehensive test coverage

## 📝 License

MIT
