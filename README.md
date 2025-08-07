# AccessFi 🚀

Idea is to create internet verifiable markets. 
Anyone in need with any contacts can create their pool for it.  Users can come verify that they are eligible and mint their emails against money for giving their emails. 
People will use it for getting all sorts of access from pools like "High level mangers in company" to niches like "High users of zomato". 
Rather than searching for  shady data dealers or in the dark web for the emails of these types of users. People can simply fund the pool upfront to attract their use case of users in a ethical manner.

## Quick Setup

```bash
git clone <repo>
cd access_fi
```

## 📱 Frontend

Next.js app for creating and joining pools.

### Setup
```bash
bun install
```

### Environment (.env.local)
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/accessfi"
NEXT_PUBLIC_WC_PROJECT_ID="your_walletconnect_id"
```

### Run
```bash
bun dev  # http://localhost:3001
```

## 🔗 Smart Contracts

Foundry contracts for pool management.

### Setup
```bash
cd contracts
forge install
```

### Environment (.env)
```env
ZK_VERIFY_ADDRESS=0xPK82591733B8042f24C851e47a9E333c3Pna618F
VERIFICATION_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
NFT_NAME="AccessFi NFT"
NFT_SYMBOL="AFNFT"
PRIVATE_KEY=0xpo0974bec90a17e36ba4a6b4d238kk944bacb478clmn5efcae784d7bp9g2ff80
```

### Deploy
```bash
forge build
forge script script/Deploy.s.sol --rpc-url https://base-sepolia.drpc.org --private-key $PRIVATE_KEY --broadcast
```

## 🛡️ TEE Service

Email verification service.

### Setup
```bash
cd email_verifier_tee
npm install
```

### Environment (.env)
```env
TEE_ENDPOINT=https://your-tee-endpoint.com
PRIVATE_KEY=0xpo0974bec90a17e36ba4a6b4d238kk944bacb478clmn5efcae784d7bp9g2ff80
RESEND_API_KEY=re_123456789
REDIS_URL=redis://localhost:6379
PORT=4000
```

### Run
```bash
npm run dev  # http://localhost:4000
```

## Development Workflow

```bash
# Terminal 1 - TEE Service
cd email_verifier_tee && npm run dev

# Terminal 2 - Frontend  
bun dev

# Terminal 3 - Local blockchain (optional)
cd contracts && anvil
```

## Production

### Frontend
```bash
bun build && bun start
```

### Contracts
```bash
cd contracts
forge script script/Deploy.s.sol --rpc-url $MAINNET_RPC --private-key $PRIVATE_KEY --broadcast
```

### TEE Service
```bash
cd email_verifier_tee
npm run build && npm start
```

## Common Issues

- **Wallet not connecting?** Check MetaMask is unlocked
- **Contract deploy fails?** Check you have ETH for gas
- **TEE service won't start?** Check Redis is running
- **Pool creation fails?** Update contract addresses in `src/constant.ts`

That's it! 🎉
