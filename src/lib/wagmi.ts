import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';
import { defineChain } from 'viem';

export const horizenTestnet = defineChain({
  id: 845320009,
  name: 'Horizen Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://horizen-rpc-testnet.appchain.base.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Horizen Testnet Explorer',
      url: 'https://horizen-explorer-testnet.appchain.base.org',
    },
  },
});

export const config = getDefaultConfig({
  appName: 'Access Fi',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [base, horizenTestnet],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
