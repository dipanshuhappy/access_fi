// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {FactoryAccessfi} from "../src/FactoryAccessfi.sol";
import {IAccessFiPool} from "../src/interfaces/IAccessfi.sol";
import {AccessFiPool} from "../src/Accessfi.sol";

contract CreatePoolScript is Script {
    
    function setUp() public {}

    function run() public returns (address) {
        // Get addresses from environment variables
        address factoryAddress = vm.envAddress("FACTORY_ADDRESS");
        address verifyProofAddress = vm.envAddress("VERIFY_PROOF_ADDRESS");

        return createPool(factoryAddress, verifyProofAddress);
    }

    function createPool(
        address _factoryAddress,
        address _verifyProofAddress
    ) public returns (address) {
        require(_factoryAddress != address(0), "Factory address cannot be zero");
        require(_verifyProofAddress != address(0), "VerifyProof address cannot be zero");

        vm.startBroadcast();

        FactoryAccessfi factory = FactoryAccessfi(_factoryAddress);

        console.log("Creating new AccessFi pool...");
        console.log("Factory address:", _factoryAddress);
        console.log("VerifyProof address:", _verifyProofAddress);
        console.log("Pool creator:", msg.sender);

        // Create pool using factory
        IAccessFiPool newPool = factory.createPool(_verifyProofAddress, _verifyProofAddress);
        address poolAddress = address(newPool);

        console.log("AccessFi pool created successfully!");
        console.log("Pool address:", poolAddress);

        // Verify pool creation
        address[] memory allPools = factory.getAllPools();
        console.log("Total pools in factory:", allPools.length);
        console.log("Latest pool:", allPools[allPools.length - 1]);

        // Verify pool functionality
        AccessFiPool pool = AccessFiPool(poolAddress);
        console.log("Pool verification address:", pool.verifications());
        console.log("Pool VerifyProof contract:", address(pool.verifyProofContract()));

        vm.stopBroadcast();

        return poolAddress;
    }

    // Create multiple pools for testing
    function createMultiplePools(
        address _factoryAddress,
        address _verifyProofAddress,
        uint256 _numberOfPools
    ) public returns (address[] memory) {
        require(_numberOfPools > 0 && _numberOfPools <= 10, "Invalid number of pools");

        address[] memory createdPools = new address[](_numberOfPools);

        vm.startBroadcast();

        FactoryAccessfi factory = FactoryAccessfi(_factoryAddress);

        console.log("Creating", _numberOfPools, "pools...");

        for (uint256 i = 0; i < _numberOfPools; i++) {
            IAccessFiPool newPool = factory.createPool(_verifyProofAddress, _verifyProofAddress);
            createdPools[i] = address(newPool);
            
            console.log("Pool", i + 1, "created at:", createdPools[i]);
        }

        console.log("All pools created successfully!");
        console.log("Total pools in factory:", factory.getPoolsCount());

        vm.stopBroadcast();

        return createdPools;
    }

    // Helper function to get pool information
    function getPoolInfo(address _poolAddress) public view returns (
        address verifications,
        address verifyProofContract,
        uint256 totalSellers,
        address[] memory allSellers,
        address[] memory allBuyers
    ) {
        AccessFiPool pool = AccessFiPool(_poolAddress);
        
        verifications = pool.verifications();
        verifyProofContract = address(pool.verifyProofContract());
        totalSellers = pool.totalSellers();
        allSellers = pool.getAllSellers();
        allBuyers = pool.getAllBuyers();
    }
}