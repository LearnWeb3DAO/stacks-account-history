export const WALLETCONNECT_PROJECT_ID = 
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '1eebe528ca0ce94a99ceaa2e915058d7';

export const WALLET_METADATA = {
  name: 'Stacks Account History',
  description: 'View and annotate Stacks blockchain transactions',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://stacks-account-history.vercel.app',
  icons: ['https://cryptologos.cc/logos/stacks-stx-logo.png'],
};

export const STACKS_CHAIN_CONFIG = {
  mainnet: {
    chainId: 1,
    name: 'Stacks Mainnet',
    rpcUrl: process.env.NEXT_PUBLIC_HIRO_API_BASE_URL || 'https://api.mainnet.hiro.so',
  },
  testnet: {
    chainId: 2147483648,
    name: 'Stacks Testnet',
    rpcUrl: 'https://api.testnet.hiro.so',
  },
};

export const WALLET_CONFIG = {
  projectId: WALLETCONNECT_PROJECT_ID,
  metadata: WALLET_METADATA,
  chains: [STACKS_CHAIN_CONFIG.mainnet],
};
