# AccessFi Contract Deployment Guide

This guide explains how to deploy the AccessFi smart contract system using Foundry scripts.

## Overview

The AccessFi system consists of:
1. **VerifyProof**: Zero-knowledge proof verification and NFT minting
2. **FactoryAccessfi**: Factory for creating AccessFi pools
3. **AccessFiPool**: Individual trading pools for buyers and sellers

## Deployment Order

1. Deploy `VerifyProof` contract first
2. Deploy `FactoryAccessfi` contract
3. Create pools using the factory

## Quick Start

### 1. Environment Setup

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```bash
# Required: Replace with actual zkVerify contract address
ZK_VERIFY_ADDRESS=your_actual_zkverify_address_here

# Required: Replace with actual verification key
VERIFICATION_KEY=your_actual_verification_key_here

# Optional: Customize NFT details
NFT_NAME="AccessFi Proof NFT"
NFT_SYMBOL="AFPNFT"

# Optional: Create initial pool automatically
CREATE_INITIAL_POOL=true

# Required: Add your private key for deployment
PRIVATE_KEY=your_private_key_here
```

### 2. Complete Deployment (Recommended)

Deploy everything at once:
```bash
forge script script/Deploy.s.sol:DeployScript --rpc-url <RPC_URL> --private-key $PRIVATE_KEY --broadcast
```

### 3. Step-by-Step Deployment

If you prefer manual control:

**Step 1: Deploy VerifyProof**
```bash
forge script script/DeployVerifyProof.s.sol:DeployVerifyProofScript --rpc-url <RPC_URL> --private-key $PRIVATE_KEY --broadcast
```

**Step 2: Deploy Factory**
```bash
forge script script/DeployFactory.s.sol:DeployFactoryScript --rpc-url <RPC_URL> --private-key $PRIVATE_KEY --broadcast
```

**Step 3: Create Pool**
```bash
FACTORY_ADDRESS=<deployed_factory_address> VERIFY_PROOF_ADDRESS=<deployed_verifyproof_address> forge script script/CreatePool.s.sol:CreatePoolScript --rpc-url <RPC_URL> --private-key $PRIVATE_KEY --broadcast
```

## Network Examples

### Sepolia Testnet
```bash
forge script script/Deploy.s.sol:DeployScript --rpc-url https://sepolia.infura.io/v3/YOUR_KEY --private-key $PRIVATE_KEY --broadcast --verify
```

### Local Development
```bash
# Start local node
anvil

# Deploy (in another terminal)
forge script script/Deploy.s.sol:DeployScript --rpc-url http://localhost:8545 --private-key $PRIVATE_KEY --broadcast
```

## Advanced Usage

### Deploy with Custom Parameters

```bash
forge script script/Deploy.s.sol:DeployScript --rpc-url <RPC_URL> --private-key $PRIVATE_KEY --broadcast --sig "deployWithConfig(address,bytes32,string,string,bool)" 0xYourZkVerifyAddress 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef "Custom NFT Name" "CNFT" true
```

### Create Multiple Pools

```bash
FACTORY_ADDRESS=<factory_address> VERIFY_PROOF_ADDRESS=<verifyproof_address> forge script script/CreatePool.s.sol:CreatePoolScript --rpc-url <RPC_URL> --private-key $PRIVATE_KEY --broadcast --sig "createMultiplePools(address,address,uint256)" <factory_address> <verifyproof_address> 3
```


## Verification

After deployment, verify the contracts are working:

```bash
# Check deployment integrity
forge script script/Deploy.s.sol:DeployScript --rpc-url <RPC_URL> --sig "verifyDeployment(address,address,address)" <verifyproof_address> <factory_address> <pool_address>
```

## Post-Deployment

After successful deployment, you'll receive:
1. **VerifyProof Contract Address**: Use for proof verification and NFT minting
2. **CustomNFT Contract Address**: Automatically deployed NFT contract
3. **FactoryAccessfi Contract Address**: Use to create new pools
4. **Initial Pool Address**: First trading pool (if created)

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `ZK_VERIFY_ADDRESS` | zkVerify contract address | ✅ | Mock address |
| `VERIFICATION_KEY` | ZK proof verification key | ✅ | Mock key |
| `NFT_NAME` | Name of the proof NFT | ❌ | "AccessFi Proof NFT" |
| `NFT_SYMBOL` | Symbol of the proof NFT | ❌ | "AFPNFT" |
| `CREATE_INITIAL_POOL` | Create first pool automatically | ❌ | true |
| `PRIVATE_KEY` | Deployer private key | ✅ | - |

## Troubleshooting

### Common Issues

1. **"ZK_VERIFY_ADDRESS is required"**
   - Set the actual zkVerify contract address in `.env`

2. **"Insufficient funds for gas"**
   - Ensure your account has enough ETH for gas fees

3. **"Contract creation failed"**
   - Check that all dependencies are properly set
   - Verify the verification key is valid

4. **"Pool creation failed"**
   - Ensure VerifyProof contract is deployed first
   - Check that factory address is correct

### Gas Estimates

Approximate gas costs:
- VerifyProof deployment: ~2,500,000 gas
- FactoryAccessfi deployment: ~500,000 gas
- Pool creation: ~3,000,000 gas

## Security Notes

⚠️ **Important Security Considerations**

1. **Private Keys**: Never commit private keys to version control
2. **Verification Key**: Use actual production verification keys
3. **zkVerify Address**: Ensure you're using the correct zkVerify contract address
4. **Network**: Double-check you're deploying to the intended network

## Support

If you encounter issues:
1. Check the deployment logs for error messages
2. Verify all environment variables are set correctly
3. Ensure sufficient gas and ETH balance
4. Test on a testnet first before mainnet deployment