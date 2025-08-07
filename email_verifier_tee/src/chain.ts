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
