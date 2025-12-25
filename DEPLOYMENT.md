# Stacks Account History - Live Deployment

## 🚀 Live Application

**Vercel Deployment:** [https://stacks-account-history-cy8qb7ptq-big14ways-projects.vercel.app](https://stacks-account-history-cy8qb7ptq-big14ways-projects.vercel.app)

## 🔗 WalletConnect Integration

This application features WalletConnect v2 for seamless wallet connections:
- **Browser Extensions:** Connect via Leather or Xverse
- **Mobile Wallets:** Scan QR code with any Stacks-compatible mobile wallet
- **Project ID:** 1eebe528ca0ce94a99ceaa2e915058d7

## 📱 How to Use

1. Visit the deployed application
2. Connect your Stacks wallet (browser extension or mobile)
3. Enter any Stacks address (SP...) to view transaction history
4. Add personal annotations to transactions
5. Notes are stored on-chain via the transaction-annotations contract

## 🔐 Smart Contract

**Contract Address:** `ST1NA1KECSN6QSZQM652X5AEDKBR6RMEJ0JGCX99Q.transaction-annotations`

## 🛠️ Technology Stack

- **Frontend:** Next.js 15 + React 19
- **Wallet Integration:** Stacks Connect + WalletConnect v2
- **Blockchain:** Stacks Mainnet
- **Deployment:** Vercel
- **Environment:** Production-ready with automated deployments

## 🌐 Environment Variables

The deployment uses:
```
NEXT_PUBLIC_STACKS_NETWORK=mainnet
NEXT_PUBLIC_HIRO_API_BASE_URL=https://api.mainnet.hiro.so
NEXT_PUBLIC_ANNOTATIONS_CONTRACT_ADDRESS=ST1NA1KECSN6QSZQM652X5AEDKBR6RMEJ0JGCX99Q
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=1eebe528ca0ce94a99ceaa2e915058d7
```

## 📚 Features

- ✅ View transaction history for any Stacks address
- ✅ Paginated transaction list
- ✅ Add and view personal transaction annotations
- ✅ WalletConnect v2 support for mobile wallets
- ✅ On-chain annotation storage
- ✅ Responsive UI design

## 🔄 Updates

The deployment is connected to the GitHub repository and automatically deploys on push to main branch.
