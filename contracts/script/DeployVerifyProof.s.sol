// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {VerifyProof} from "../src/VerifyProof.sol";

contract DeployVerifyProofScript is Script {
    VerifyProof public verifyProof;
    
    // Default deployment parameters - MUST be replaced with actual values
    address public constant DEFAULT_ZK_VERIFY = address(0); // REPLACE with actual zkVerify address
    bytes32 public constant DEFAULT_VKEY = bytes32(0); // REPLACE with actual verification key
    string public constant DEFAULT_NFT_NAME = "AccessFi Proof NFT";
    string public constant DEFAULT_NFT_SYMBOL = "AFPNFT";

    function setUp() public {}

    function run() public returns (address) {
        vm.startBroadcast();

        // Get deployment parameters from environment - REQUIRED
        address zkVerify = vm.envAddress("ZK_VERIFY_ADDRESS");
        bytes32 vkey = vm.envBytes32("VERIFICATION_KEY");
        string memory nftName = vm.envOr("NFT_NAME", DEFAULT_NFT_NAME);
        string memory nftSymbol = vm.envOr("NFT_SYMBOL", DEFAULT_NFT_SYMBOL);

        require(zkVerify != address(0), "ZK_VERIFY_ADDRESS is required");
        require(vkey != bytes32(0), "VERIFICATION_KEY is required");

        console.log("Deploying VerifyProof contract with parameters:");
        console.log("zkVerify address:", zkVerify);
        console.log("Verification key:", vm.toString(vkey));
        console.log("NFT Name:", nftName);
        console.log("NFT Symbol:", nftSymbol);

        verifyProof = new VerifyProof(
            zkVerify,
            vkey,
            nftName,
            nftSymbol
        );

        console.log("VerifyProof deployed to:", address(verifyProof));
        console.log("Custom NFT contract deployed to:", address(verifyProof.nftContract()));

        vm.stopBroadcast();
        
        return address(verifyProof);
    }

    // Helper function to deploy with custom parameters
    function deployWithParams(
        address _zkVerify,
        bytes32 _vkey,
        string memory _nftName,
        string memory _nftSymbol
    ) public returns (address) {
        vm.startBroadcast();

        verifyProof = new VerifyProof(
            _zkVerify,
            _vkey,
            _nftName,
            _nftSymbol
        );

        console.log("VerifyProof deployed to:", address(verifyProof));

        vm.stopBroadcast();
        
        return address(verifyProof);
    }
}