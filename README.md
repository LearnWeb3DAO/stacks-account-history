# Stacks Account History - Clarity 4 Enhanced ⚡

Stacks Account History lets you view paginated on-chain activity for any Stacks address and store personal annotations for each transaction.

**Upgraded to Clarity 4 (Epoch 3.3)** with enhanced security features and new built-in functions!

## ✨ New Clarity 4 Features Used

This project leverages the following **NEW Clarity 4 functions**:

1. **`contract-hash?`** - Get contract hash for integrity verification
   - Function: `get-contract-hash()` - Returns the contract's hash
   - Function: `verify-contract-integrity()` - Verifies contract integrity

2. **`to-ascii?`** - Convert uint to ASCII string representation
   - Function: `note-length-to-string(length)` - Converts note length to ASCII

3. **`stacks-block-height`** - Access current block height for time-based logic
   - Function: `get-current-block-height()` - Get current block height
   - Enables future time-based annotation features

### Key Improvements in Clarity 4

- **Better Transparency**: Contract hash verification for integrity checks
- **More Flexibility**: Built-in utilities for data conversion
- **Future-Ready**: Foundation for advanced annotation features

## 🧪 Testing

Contract validation:

```bash
# Verify contract passes Clarity 4 validation
cd clarinet
clarinet check
```

**Result**: ✅ Contract checked and validated for Clarity 4 (Epoch 3.3)

## 🚀 Deployment

**Status: DEPLOYED TO TESTNET** ✅

### Deployed Contract

The contract has been successfully deployed to Stacks testnet:

- **Deployer Address**: `ST1NA1KECSN6QSZQM652X5AEDKBR6RMEJ0JGCX99Q`
- **Transaction Annotations (v4)**: `ST1NA1KECSN6QSZQM652X5AEDKBR6RMEJ0JGCX99Q.transaction-annotations-v4`
- **Transaction ID**: `2de952bc793f38e40007507b9c4b6d4fca53d3af8fd0d8e5341f8e261c590833`

**Deployment Details:**
- Contract Name: `transaction-annotations-v4`
- Clarity Version: 4
- Epoch: 3.3
- Network: Stacks Testnet
- Total Cost: 0.015120 STX
- Duration: 1 block

The contract passed all Clarity 4 validation checks and is now live on testnet.

## 🚀 Live Deployment

**Vercel App:** [https://stacks-account-history-cy8qb7ptq-big14ways-projects.vercel.app](https://stacks-account-history-cy8qb7ptq-big14ways-projects.vercel.app)

> 🔗 **WalletConnect v2 Enabled** - Connect with browser extensions (Leather/Xverse) or mobile wallets via QR code

## 🔗 WalletConnect Integration

This application now supports **WalletConnect v2** for seamless wallet connections, enabling both browser extensions and mobile wallets!

**Supported Connection Methods:**
- 🖥️ **Browser Extensions:** Direct connection via Leather or Xverse
- 📱 **Mobile Wallets:** WalletConnect QR code scanning for any Stacks-compatible mobile wallet
- 🔐 **Secure Protocol:** End-to-end encrypted connections via WalletConnect

## Prerequisites

- Node.js 18+
- npm 9+
- **Stacks Wallet:** Browser extension (Leather/Xverse) or mobile wallet with WalletConnect support
- [Clarinet](https://docs.hiro.so/clarinet/introduction) (optional, required for contract work)

## Environment configuration

Create a `.env.local` file (or export the variables in your shell):

```bash
# Stacks Network Configuration
NEXT_PUBLIC_STACKS_NETWORK=mainnet
NEXT_PUBLIC_HIRO_API_BASE_URL=https://api.mainnet.hiro.so

# Contract Configuration
NEXT_PUBLIC_ANNOTATIONS_CONTRACT_ADDRESS=ST1NA1KECSN6QSZQM652X5AEDKBR6RMEJ0JGCX99Q

# WalletConnect Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=1eebe528ca0ce94a99ceaa2e915058d7
```

**Note:** The WalletConnect Project ID is pre-configured. For production deployments, obtain your own Project ID at [WalletConnect Cloud](https://cloud.walletconnect.com/).

The values above are pre-configured defaults in the codebase, but setting them explicitly makes it easy to point the frontend at a different deployment later.

## Install dependencies

```bash
npm install
```

## Run the app locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and connect a Stacks wallet to try the annotation flow:

**Connecting Your Wallet:**
- **Desktop:** Click "Connect Wallet" → Choose your browser extension (Leather/Xverse)
- **Mobile:** Click "Connect Wallet" → Scan the WalletConnect QR code with your mobile wallet

Notes you save are scoped to your wallet and stored by the `transaction-annotations` contract on testnet.

## Lint, build, and test

```bash
# Type checking & linting
npm run lint

# Production build
npm run build

# Clarinet contract tests
cd clarinet
npm test
```

## Deploying the contract (optional)

Clarinet deployment plans live in `clarinet/deployments`. To redeploy to testnet, ensure `clarinet/settings/Testnet.toml` contains a funded mnemonic, then run:

```bash
cd clarinet
clarinet deployments generate --testnet --low-cost
clarinet deployments apply --testnet --no-dashboard
```

Update the frontend `NEXT_PUBLIC_ANNOTATIONS_CONTRACT_ADDRESS` value to target any new deployment.
