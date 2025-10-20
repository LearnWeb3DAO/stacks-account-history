# Stacks Account History & Staking Platform

A comprehensive web application for viewing Stacks blockchain transaction history and managing STX staking operations. Built with Next.js 15, React 19, and integrated with the Stacks blockchain ecosystem.

![Stacks Account History](https://img.shields.io/badge/Stacks-Blockchain-purple)
![Next.js](https://img.shields.io/badge/Next.js-15.1.5-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🚀 Features

### 📊 Transaction History
- **Address Search**: Search and view transaction history for any Stacks mainnet address
- **Wallet Integration**: Connect Stacks wallets using @stacks/connect
- **Auto-redirect**: Connected users are automatically redirected to their transaction history
- **Paginated Display**: Clean, organized transaction lists with detailed information
- **Explorer Integration**: Direct links to Hiro Explorer for additional transaction details

### 💰 STX Staking (NEW!)
- **Stake STX Tokens**: Secure staking mechanism with smart contract integration
- **Flexible Unstaking**: Partial or complete unstaking options
- **Real-time Balance**: Live staked balance and total staking pool information
- **Transaction Simulation**: Development-friendly mock data for testing
- **Wallet Integration**: Seamless connection with Stacks wallets

### 🔧 Technical Features
- **Smart Contract**: Custom Clarity staking contract with comprehensive error handling
- **Type Safety**: Full TypeScript implementation with strict typing
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Error Handling**: Graceful fallbacks and user-friendly error messages
- **Development Tools**: Clarinet integration for local testing and deployment

## 🛠 Tech Stack

### Frontend
- **Next.js 15.1.5** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 3.4.1** - Utility-first styling
- **Lucide React** - Modern icon library

### Blockchain Integration
- **@stacks/connect 7.10.0** - Wallet connection and authentication
- **@stacks/transactions 7.0.2** - Transaction utilities and contract calls
- **@stacks/network 7.0.2** - Network configuration and API calls

### Smart Contract Development
- **Clarinet** - Clarity smart contract development toolkit
- **Clarity** - Smart contract language for Stacks blockchain

## 🏗 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── [address]/         # Dynamic address pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable React components
│   └── staking/          # Staking-specific components
├── contracts/            # Clarity smart contracts
│   └── staking.clar      # STX staking contract
├── hooks/                # Custom React hooks
│   ├── use-stacks.ts     # Stacks wallet integration
│   └── use-staking.ts    # Staking functionality
├── lib/                  # Utility functions and API calls
│   ├── staking-contract.ts # Contract interaction layer
│   └── staking-utils.ts   # Staking helper functions
├── settings/             # Clarinet network configurations
├── tests/                # Smart contract tests
└── deployments/          # Deployment configurations
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- Clarinet (for smart contract development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stacks-account-history
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🔗 Smart Contract Development

### Local Testing
```bash
# Check contract syntax
clarinet check

# Interactive testing
clarinet console

# Start local devnet
clarinet integrate
```

### Deployment
```bash
# Generate deployment plan
clarinet deployments generate --testnet --medium-cost

# Deploy to testnet
clarinet deployments apply -p default.testnet-plan.yaml
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🎯 Usage

### Transaction History
1. Visit the homepage
2. Connect your Stacks wallet or search for any address
3. Browse paginated transaction history
4. Click external links to view details on Hiro Explorer

### STX Staking
1. Navigate to the "Staking" tab on any address page
2. Connect your Stacks wallet
3. Enter amount to stake and confirm transaction
4. Monitor your staked balance and rewards
5. Unstake partially or completely as needed

## 🧪 Development Features

### Mock Data Mode
When smart contracts aren't deployed, the app automatically shows realistic mock data:
- Random staked balances (0-100 STX)
- Mock total staking pool (1000-6000 STX)
- Transaction simulation logs

### Error Handling
- Graceful contract connection failures
- User-friendly error messages
- Automatic fallback to mock data
- Comprehensive logging for debugging

## 🔐 Security Features

- **Input Validation**: All user inputs are validated and sanitized
- **Address Verification**: Only valid Stacks addresses are accepted
- **Smart Contract Security**: Comprehensive error handling and access controls
- **Post-conditions**: Transaction safety with STX transfer validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Stacks Foundation** for the blockchain infrastructure
- **Hiro Systems** for development tools and APIs
- **Next.js Team** for the amazing React framework
- **Tailwind CSS** for the utility-first CSS framework

## 📞 Support

- **Documentation**: Check the [DEPLOYMENT.md](./DEPLOYMENT.md) for setup help
- **Issues**: Report bugs via GitHub Issues
- **Community**: Join the Stacks Discord for community support

---

**Built with ❤️ for the Stacks ecosystem**