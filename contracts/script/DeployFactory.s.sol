// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {FactoryAccessfi} from "../src/FactoryAccessfi.sol";
import {IAccessFiPool} from "../src/interfaces/IAccessfi.sol";

contract DeployFactoryScript is Script {
    FactoryAccessfi public factory;

    function setUp() public {}

    function run() public returns (address) {
        vm.startBroadcast();

        console.log("Deploying FactoryAccessfi contract...");
        console.log("Deployer address:", msg.sender);

        factory = new FactoryAccessfi();

        console.log("FactoryAccessfi deployed to:", address(factory));

        vm.stopBroadcast();
        
        return address(factory);
    }

    // Helper function to create a pool through the factory
    function createPoolWithFactory(
        address factoryAddress,
        address verifyProofAddress
    ) public returns (address) {
        require(factoryAddress != address(0), "Factory address cannot be zero");
        require(verifyProofAddress != address(0), "VerifyProof address cannot be zero");

        vm.startBroadcast();

        FactoryAccessfi factoryContract = FactoryAccessfi(factoryAddress);
        
        console.log("Creating pool with factory at:", factoryAddress);
        console.log("Using VerifyProof contract at:", verifyProofAddress);

        IAccessFiPool pool = factoryContract.createPool(verifyProofAddress, verifyProofAddress);
        address poolAddress = address(pool);

        console.log("AccessFiPool created at:", poolAddress);
        
        // Verify the pool was added to the factory's pools array
        address[] memory pools = factoryContract.getAllPools();
        console.log("Total pools in factory:", pools.length);
        console.log("Latest pool address:", pools[pools.length - 1]);

        vm.stopBroadcast();
        
        return poolAddress;
    }
}