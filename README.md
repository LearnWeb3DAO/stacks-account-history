# Stacks Account History

Stacks Account History lets you view paginated on-chain activity for any Stacks address and store personal annotations for each transaction. The smart contract backing annotations is live on Stacks testnet:

```
ST1NA1KECSN6QSZQM652X5AEDKBR6RMEJ0JGCX99Q.transaction-annotations
```

## Prerequisites

- Node.js 18+
- npm 9+
- [Clarinet](https://docs.hiro.so/clarinet/introduction) (optional, required for contract work)

## Environment configuration

Create a `.env.local` file (or export the variables in your shell):

```bash
NEXT_PUBLIC_STACKS_NETWORK=testnet
NEXT_PUBLIC_HIRO_API_BASE_URL=https://api.testnet.hiro.so
NEXT_PUBLIC_ANNOTATIONS_CONTRACT_ADDRESS=ST1NA1KECSN6QSZQM652X5AEDKBR6RMEJ0JGCX99Q
```

The values above are pre-configured defaults in the codebase, but setting them explicitly makes it easy to point the frontend at a different deployment later.

## Install dependencies

```bash
npm install
```

## Run the app locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and connect a Stacks wallet to try the annotation flow. Notes you save are scoped to your wallet and stored by the `transaction-annotations` contract on testnet.

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
