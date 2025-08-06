// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IAccessFiPool} from "./interfaces/IAccessfi.sol";


contract AccessFiPool is IAccessFiPool {


    Seller[] public sellers;
    Buyer[] public buyers;
    address public verifications;


    mapping(address => uint256) private sellerIndex;
    mapping(address => uint256) private buyerIndex;
    mapping(address => bool) public isBuyer;
    mapping(address => bool) public isSeller;
    mapping(address => mapping(address => bool)) public hasSold;

    uint256 public currentPrice;
    uint256 public totalSellers;


    constructor(address _verifications) {
        verifications = _verifications;
    }


    function buy(address seller) public view {
        require(isBuyer[seller], "Seller not in pool");
        require(isBuyer[msg.sender], "Buyer not in pool");
    }
    

    function sell(address buyer) public {
        require(isSeller[msg.sender], "Seller not in pool");
        require(isBuyer[buyer], "Buyer not in pool");
        require(!hasSold[msg.sender][buyer], "Seller has already sold to this buyer");
        hasSold[msg.sender][buyer] = true;
        // Update structs
        uint256 sIdx = sellerIndex[msg.sender];
        uint256 bIdx = buyerIndex[buyer];
        if (sIdx > 0 && bIdx > 0) {
            sellers[sIdx-1].buyers.push(buyer);
            buyers[bIdx-1].sellers.push(msg.sender);
        }

    }

    function enterPoolAsBuyer(uint256 _pricePerToken, uint256 _totalTokens) public {
        require(!isBuyer[msg.sender], "Buyer already in pool");
        Buyer memory newBuyer = Buyer({
            buyer: msg.sender,
            sellers: new address[](0),
            amountSpent: 0,
            tokensGained: 0,
            pricePerToken: _pricePerToken,
            minRequiredTokens: _totalTokens
        });
        buyers.push(newBuyer);
        buyerIndex[msg.sender] = buyers.length; 
        isBuyer[msg.sender] = true;
    }


    function exitPoolAsBuyer() public {
        require(isBuyer[msg.sender], "Buyer not in pool");
        uint256 idx = buyerIndex[msg.sender];
        require(idx > 0, "Buyer not found");
        uint256 arrIdx = idx - 1;
        if (arrIdx < buyers.length - 1) {
            buyers[arrIdx] = buyers[buyers.length - 1];
            buyerIndex[buyers[arrIdx].buyer] = arrIdx + 1;
        }
        buyers.pop();
        buyerIndex[msg.sender] = 0;
        isBuyer[msg.sender] = false;
    }

    function enterPoolAsSeller() public {
        require(!isSeller[msg.sender], "Seller already in pool");
        Seller memory newSeller = Seller({
            seller: msg.sender,
            buyers: new address[](0),
            amountEarned: 0,
            TokensBurned: 0
        });
        sellers.push(newSeller);
        sellerIndex[msg.sender] = sellers.length; // index+1
        isSeller[msg.sender] = true;
    }

    function exitPoolAsSeller() public {
        require(isSeller[msg.sender], "Seller not in pool");
        uint256 idx = sellerIndex[msg.sender];
        require(idx > 0, "Seller not found");
        uint256 arrIdx = idx - 1;
        // Remove from array
        if (arrIdx < sellers.length - 1) {
            sellers[arrIdx] = sellers[sellers.length - 1];
            sellerIndex[sellers[arrIdx].seller] = arrIdx + 1;
        }
        sellers.pop();
        sellerIndex[msg.sender] = 0;
        isSeller[msg.sender] = false;
    }

    function getSellers() public view returns (address[] memory) {
        address[] memory sellerAddrs = new address[](sellers.length);
        for (uint i = 0; i < sellers.length; i++) {
            sellerAddrs[i] = sellers[i].seller;
        }
        return sellerAddrs;
    }

    function getBuyers() public view returns (address[] memory) {
        address[] memory buyerAddrs = new address[](buyers.length);
        for (uint i = 0; i < buyers.length; i++) {
            buyerAddrs[i] = buyers[i].buyer;
        }
        return buyerAddrs;
    }
}