// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IVerifyProofAggregation} from "./interfaces/IVerifyProofAggregation.sol";
import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

contract VerifyProof is ERC20, Ownable {

    bytes32 public constant PROVING_SYSTEM_ID = keccak256(abi.encodePacked("groth16"));
    bytes32 public constant VERSION_HASH = sha256(abi.encodePacked(""));

    address public zkVerify;
    bytes32 public vkey;

    mapping(address => bool) public hasClaimed;

    constructor(
        address _zkVerify,
        bytes32 _vkey,
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        zkVerify = _zkVerify;
        vkey = _vkey;
    }


   function verifyAndMint(
        uint256 _aggregationId,
        uint256 _domainId,
        bytes32[] calldata _merklePath,
        bytes32 leaf,
        uint256 _leafCount,
        uint256 _index
    ) external {
        require(!hasClaimed[msg.sender], "Already claimed");

        bool valid = IVerifyProofAggregation(zkVerify).verifyProofAggregation(
            _domainId,
            _aggregationId,
            leaf,
            _merklePath,
            _leafCount,
            _index
        );
        require(valid, "Invalid proof");

        hasClaimed[msg.sender] = true;

        _mint(msg.sender, 1 ether);
    }


}