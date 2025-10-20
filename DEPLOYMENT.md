# Staking Contract Deployment Guide

## Prerequisites

1. **Clarinet installed** - You have this working already
2. **STX tokens** - For testnet deployment, you need testnet STX tokens
3. **Wallet setup** - Configure your deployer mnemonic in `settings/Testnet.toml`

## Current Status

✅ **Contract syntax verified** - `clarinet check` passes
✅ **Deployment plan generated** - `deployments/default.testnet-plan.yaml` created
✅ **Mock data working** - Frontend shows demo data when contract not deployed

## Deployment Steps

### 1. Get Testnet STX Tokens

Visit the [Stacks Testnet Faucet](https://explorer.stacks.co/sandbox/faucet?chain=testnet) and request tokens for your deployer address: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM`

### 2. Deploy to Testnet

```bash
clarinet deployments apply -p default.testnet-plan.yaml
```

### 3. Update Environment Variables

After successful deployment:

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update `.env.local` with your deployed contract address:
   ```env
   NEXT_PUBLIC_NETWORK=testnet
   NEXT_PUBLIC_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
   ```

3. Restart your Next.js development server:
   ```bash
   npm run dev
   ```

## Testing Locally

### Using Clarinet Console

```bash
clarinet console
```

Then test contract functions:
```clarity
;; Stake 1 STX (1,000,000 microSTX)
(contract-call? .staking stake u1000000)

;; Check staked balance
(contract-call? .staking get-stake tx-sender)

;; Get total staked
(contract-call? .staking get-total-staked)

;; Unstake 0.5 STX
(contract-call? .staking unstake u500000)

;; Unstake all remaining
(contract-call? .staking unstake-all)
```

### Using Devnet

For local development with a full blockchain:

```bash
clarinet integrate
```

This starts a local devnet where you can test with a browser wallet.

## Contract Functions

- `stake(amount)` - Stake STX tokens
- `unstake(amount)` - Unstake specific amount
- `unstake-all()` - Unstake all staked tokens
- `get-stake(user)` - Get user's staked balance
- `get-total-staked()` - Get total staked in contract

## Frontend Integration

The frontend automatically:
- Shows **mock data** when contract is not deployed
- Switches to **real data** when contract address is configured
- Handles **wallet connection** for staking operations
- Provides **transaction simulation** in development mode

## Troubleshooting

- **"Contract not found" errors**: Normal when contract isn't deployed yet
- **Line ending issues**: Use LF line endings in `.clar` files
- **Deployment costs**: Current estimate is ~311,848 microSTX (~0.31 STX)