// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

interface ICustomNFT {
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    // Basic NFT functionality
    function balanceOf(address owner) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function tokenURI(uint256 tokenId) external view returns (string memory);
    
    // Transfer functions
    function transfer(address to, uint256 tokenId) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    
    // Approval functions (optional but for compatibility)
    function approve(address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId) external view returns (address);
    function setApprovalForAll(address operator, bool approved) external;
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    
    // Minting function (internal but exposed for contract use)
    function mint(address to, uint256 tokenId) external;
    
    // Utility functions
    function totalSupply() external view returns (uint256);
    function exists(uint256 tokenId) external view returns (bool);
} 