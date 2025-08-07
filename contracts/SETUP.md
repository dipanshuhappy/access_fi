# Quick Setup Guide

## 📋 Environment Setup

I've created a `.env` file for you with placeholder values. **You need to replace these with your actual values:**

### 1. Edit the `.env` file:

```bash
# Open the .env file in your editor
nano .env
# or
code .env
```

### 2. Replace the placeholder values:

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `ZK_VERIFY_ADDRESS` | Real zkVerify contract address | From your zkVerify deployment |
| `VERIFICATION_KEY` | Actual verification key | From your ZK proof system |
| `PRIVATE_KEY` | Your wallet private key | From your wallet (keep secure!) |
| `ETHERSCAN_API_KEY` | API key for contract verification | From [BaseScan](https://basescan.org/apis) or [Etherscan](https://etherscan.io/apis) |

### 3. Example `.env` with real values:

```bash
# REQUIRED: Real zkVerify contract address
ZK_VERIFY_ADDRESS=0x742d35cc6634c0532925a3b8d26c4c2d4b1e7a3f

# REQUIRED: Real verification key (64 characters)
VERIFICATION_KEY=0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456

# REQUIRED: Your private key (keep this VERY secure!)
PRIVATE_KEY=0x1234567890abcdef...

# REQUIRED: Your Etherscan API key
ETHERSCAN_API_KEY=ABC123XYZ789...
```

## ⚠️ Security Warning

**NEVER commit your `.env` file to git!** 

The `.gitignore` is already configured to exclude it, but double-check:

```bash
# Verify .env is ignored
git status
# Should NOT show .env file
```

## 🚀 Deploy After Setup

Once you've filled in your `.env` file:

```bash
# Load environment and deploy
source .env && forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://base-sepolia.drpc.org \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify
```

## ✅ Verification

Test your environment setup:

```bash
source .env && echo "✅ All variables loaded successfully"
```

If this shows your actual values (not the placeholders), you're ready to deploy! 🎯