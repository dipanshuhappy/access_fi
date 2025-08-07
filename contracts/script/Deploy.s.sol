// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {VerifyProof} from "../src/VerifyProof.sol";
import {FactoryAccessfi} from "../src/FactoryAccessfi.sol";
import {AccessFiPool} from "../src/Accessfi.sol";
import {CustomNFT} from "../src/CustomNFT.sol";
import {IAccessFiPool} from "../src/interfaces/IAccessfi.sol";

contract DeployScript is Script {
    VerifyProof public verifyProof;
    FactoryAccessfi public factory;
    AccessFiPool public firstPool;

    // Deployment configuration
    struct DeploymentConfig {
        address zkVerify;
        bytes32 vkey;
        string nftName;
        string nftSymbol;
        bool createInitialPool;
    }

    function setUp() public {}

    function run() public {
        DeploymentConfig memory config = getDeploymentConfig();
        deployAll(config);
    }

    function deployAll(DeploymentConfig memory config) public returns (
        address verifyProofAddress,
        address factoryAddress,
        address firstPoolAddress
    ) {
        vm.startBroadcast();

        console.log("Starting AccessFi deployment sequence...");
        console.log("Deployer:", msg.sender);
        console.log("Chain ID:", block.chainid);
        console.log("Block number:", block.number);

        // Step 1: Deploy VerifyProof contract
        console.log("Step 1: Deploying VerifyProof contract...");
        verifyProof = new VerifyProof(
            config.zkVerify,
            config.vkey,
            config.nftName,
            config.nftSymbol
        );
        verifyProofAddress = address(verifyProof);
        console.log("VerifyProof deployed to:", verifyProofAddress);
        console.log("Custom NFT contract deployed to:", address(verifyProof.nftContract()));

        // Step 2: Deploy Factory contract
        console.log("Step 2: Deploying FactoryAccessfi contract...");
        factory = new FactoryAccessfi();
        factoryAddress = address(factory);
        console.log("FactoryAccessfi deployed to:", factoryAddress);

        // Step 3: Create initial pool (optional)
        if (config.createInitialPool) {
            console.log("Step 3: Creating initial AccessFi pool...");
            IAccessFiPool pool = factory.createPool(verifyProofAddress, verifyProofAddress);
            firstPoolAddress = address(pool);
            firstPool = AccessFiPool(firstPoolAddress);
            console.log("Initial pool created at:", firstPoolAddress);

            // Verify pool setup
            console.log("Pool verifications address:", firstPool.verifications());
            console.log("Pool VerifyProof contract:", address(firstPool.verifyProofContract()));
            console.log("Total pools in factory:", factory.getPoolsCount());
        }

        console.log("Deployment completed successfully!");
        console.log("==================================================");
        console.log("DEPLOYMENT SUMMARY:");
        console.log("VerifyProof:", verifyProofAddress);
        console.log("FactoryAccessfi:", factoryAddress);
        if (config.createInitialPool) {
            console.log("Initial Pool:", firstPoolAddress);
        }
        console.log("==================================================");

        vm.stopBroadcast();

        return (verifyProofAddress, factoryAddress, firstPoolAddress);
    }

    function getDeploymentConfig() public view returns (DeploymentConfig memory) {
        address zkVerify = vm.envAddress("ZK_VERIFY_ADDRESS");
        bytes32 vkey = vm.envBytes32("VERIFICATION_KEY");
        
        require(zkVerify != address(0), "ZK_VERIFY_ADDRESS is required");
        require(vkey != bytes32(0), "VERIFICATION_KEY is required");
        
        return DeploymentConfig({
            zkVerify: zkVerify,
            vkey: vkey,
            nftName: vm.envOr("NFT_NAME", string("AccessFi Proof NFT")),
            nftSymbol: vm.envOr("NFT_SYMBOL", string("AFPNFT")),
            createInitialPool: vm.envOr("CREATE_INITIAL_POOL", true)
        });
    }

    // Deploy with custom configuration
    function deployWithConfig(
        address _zkVerify,
        bytes32 _vkey,
        string memory _nftName,
        string memory _nftSymbol,
        bool _createInitialPool
    ) public returns (
        address verifyProofAddress,
        address factoryAddress,
        address firstPoolAddress
    ) {
        DeploymentConfig memory config = DeploymentConfig({
            zkVerify: _zkVerify,
            vkey: _vkey,
            nftName: _nftName,
            nftSymbol: _nftSymbol,
            createInitialPool: _createInitialPool
        });

        return deployAll(config);
    }


    // Verify deployment integrity
    function verifyDeployment(
        address _verifyProofAddress,
        address _factoryAddress,
        address _poolAddress
    ) public view returns (bool isValid, string memory errorMessage) {
        if (_verifyProofAddress == address(0)) {
            return (false, "VerifyProof address is zero");
        }

        if (_factoryAddress == address(0)) {
            return (false, "Factory address is zero");
        }

        try VerifyProof(_verifyProofAddress).nftContract() returns (CustomNFT nftContract) {
            if (address(nftContract) == address(0)) {
                return (false, "NFT contract not deployed properly");
            }
        } catch {
            return (false, "VerifyProof contract not accessible");
        }

        try FactoryAccessfi(_factoryAddress).getAllPools() returns (address[] memory pools) {
            if (_poolAddress != address(0) && pools.length == 0) {
                return (false, "Pool created but not found in factory");
            }
        } catch {
            return (false, "Factory contract not accessible");
        }

        if (_poolAddress != address(0)) {
            try AccessFiPool(_poolAddress).verifications() returns (address verifications) {
                if (verifications != _verifyProofAddress) {
                    return (false, "Pool not properly connected to VerifyProof contract");
                }
            } catch {
                return (false, "Pool contract not accessible");
            }
        }

        return (true, "Deployment verified successfully");
    }
}