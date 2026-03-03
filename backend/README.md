# Auto-Rebalance Bot

Automated rebalancing service for the Cross-Chain Yield Router. This bot monitors APY across strategies and automatically rebalances funds to the highest-yielding strategy.

## Features

- ⏰ Runs every 10 minutes via cron job
- 🔍 Checks current strategy vs best strategy
- 🔄 Automatically calls rebalance when better APY is available
- 📊 Logs all rebalance actions
- 🛡️ Error handling and graceful shutdown

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Configure `.env`:
```env
RPC_URL=https://your-rpc-url.com
VAULT_ADDRESS=0x...
STRATEGY_MANAGER_ADDRESS=0x...
PRIVATE_KEY=0x...  # Owner wallet private key
```

4. Build:
```bash
npm run build
```

5. Run:
```bash
npm start
```

## Development

Run in development mode with hot reload:
```bash
npm run dev
```

## How It Works

1. **Check Current Strategy**: Reads `currentStrategy` from Vault contract
2. **Get Best Strategy**: Calls `getBestStrategy()` from StrategyManager
3. **Compare**: If different, triggers rebalance
4. **Rebalance**: Calls `vault.rebalance()` to move funds
5. **Log**: Records all actions for monitoring

## Cron Schedule

Default: Every 10 minutes (`*/10 * * * *`)

To change, modify the cron expression in `src/index.ts`:
```typescript
cron.schedule("*/10 * * * *", async () => {
  await checkAndRebalance();
});
```

## Production Deployment

### Using PM2

```bash
npm install -g pm2
pm2 start dist/index.js --name yield-router-bot
pm2 save
pm2 startup
```

### Using Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Using Systemd

Create `/etc/systemd/system/yield-router-bot.service`:

```ini
[Unit]
Description=Yield Router Auto-Rebalance Bot
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/backend
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable yield-router-bot
sudo systemctl start yield-router-bot
```

## Monitoring

The bot logs:
- ✅ Successful rebalances
- ⚠️  Warnings (no rebalance needed, connection issues)
- ❌ Errors (with details)

Monitor logs:
```bash
# PM2
pm2 logs yield-router-bot

# Systemd
journalctl -u yield-router-bot -f
```

## Security Notes

- ⚠️ **Never commit `.env` file**
- 🔐 Store private keys securely (use secrets manager in production)
- 🛡️ Use a dedicated wallet with minimal permissions
- 📝 Monitor gas costs and wallet balance
