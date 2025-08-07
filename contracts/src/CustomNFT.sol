// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {ICustomNFT} from "./interfaces/ICustomNFT.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

contract CustomNFT is ICustomNFT, Ownable {
    
    // Basic NFT functionality
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    mapping(uint256 => string) private _tokenURIs;
    
    string private _name;
    string private _symbol;
    uint256 private _tokenIdCounter;
    
    // Modifier to restrict minting to authorized contracts
    modifier onlyMinter() {
        require(msg.sender == owner() || msg.sender == address(this), "Not authorized to mint");
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_
    ) Ownable(msg.sender) {
        _name = name_;
        _symbol = symbol_;
        _tokenIdCounter = 0;
    }
    
    // Basic NFT functionality without approval requirements
    
    function balanceOf(address owner) public view override returns (uint256) {
        require(owner != address(0), "Query for zero address");
        return _balances[owner];
    }
    
    function ownerOf(uint256 tokenId) public view override returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "Token does not exist");
        return owner;
    }
    
    function name() public view override returns (string memory) {
        return _name;
    }
    
    function symbol() public view override returns (string memory) {
        return _symbol;
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenURIs[tokenId];
    }
    
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _owners[tokenId] != address(0);
    }
    
    function exists(uint256 tokenId) external view override returns (bool) {
        return _exists(tokenId);
    }
    
    function _mint(address to, uint256 tokenId, string memory tokenURI_) internal {
        require(to != address(0), "Mint to zero address");
        require(!_exists(tokenId), "Token already exists");
        
        _balances[to]++;
        _owners[tokenId] = to;
        _tokenURIs[tokenId] = tokenURI_;
        
        emit Transfer(address(0), to, tokenId);
    }
    
    // Public mint function for authorized contracts
    function mint(address to, uint256 tokenId, string memory tokenURI_) external override onlyMinter {
        _mint(to, tokenId, tokenURI_);
    }
    
    // Transfer function that doesn't require approval
    function transfer(address to, uint256 tokenId) public override {
        require(_exists(tokenId), "Token does not exist");
        require(_owners[tokenId] == msg.sender, "Not the owner");
        require(to != address(0), "Transfer to zero address");
        
        _balances[msg.sender]--;
        _balances[to]++;
        _owners[tokenId] = to;
        
        emit Transfer(msg.sender, to, tokenId);
    }
    
    // Transfer from function that doesn't require approval (for contract use)
    function transferFrom(address from, address to, uint256 tokenId) public override {
        require(_exists(tokenId), "Token does not exist");
        require(_owners[tokenId] == from, "Not the owner");
        require(to != address(0), "Transfer to zero address");
        
        // No approval check - anyone can transfer
        _balances[from]--;
        _balances[to]++;
        _owners[tokenId] = to;
        
        emit Transfer(from, to, tokenId);
    }
    
    // Optional: Add approval functions for compatibility (but not required for transfers)
    function approve(address to, uint256 tokenId) public override {
        address owner = ownerOf(tokenId);
        require(to != owner, "Approval to current owner");
        require(msg.sender == owner, "Not the owner");
        
        _tokenApprovals[tokenId] = to;
        emit Approval(owner, to, tokenId);
    }
    
    function getApproved(uint256 tokenId) public view override returns (address) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenApprovals[tokenId];
    }
    
    function setApprovalForAll(address operator, bool approved) public override {
        require(operator != msg.sender, "Approve to caller");
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }
    
    function isApprovedForAll(address owner, address operator) public view override returns (bool) {
        return _operatorApprovals[owner][operator];
    }
    
    // Utility functions
    function totalSupply() external view override returns (uint256) {
        return _tokenIdCounter;
    }
    
    function getTokenIdCounter() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    function incrementTokenIdCounter() external onlyMinter {
        _tokenIdCounter++;
    }
} 