// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IAccessFiPool} from "./interfaces/IAccessfi.sol";


contract AccessFiPool is IAccessFiPool {

    address[] public sellers;
    address[] public buyers;
    address public verifications;

    mapping(address => bool) public isBuyer;
    mapping(address => bool) public isSeller;

    uint256 public currentPrice;
    uint256 public totalSellers;


    constructor(address _verifications) {
        verifications = _verifications;
    }


    function buy(address seller) public view {
        require(isBuyer[seller], "Seller not in pool");
        require(isBuyer[msg.sender], "Buyer not in pool");
    }
    

    function sell(address buyer) public view {
        require(isSeller[buyer], "Buyer not in pool");
        require(isSeller[msg.sender], "Seller not in pool");
    }

    function enterPoolAsBuyer(uint256 _pricePerToken, uint256 _totalTokens) public {
        require(!isBuyer[msg.sender], "Buyer already in pool");
        buyers.push(msg.sender);
        isBuyer[msg.sender] = true;
    }


    function exitPoolAsBuyer() public {
        require(isBuyer[msg.sender], "Buyer not in pool");
        isBuyer[msg.sender] = false;
        for (uint i = 0; i < buyers.length; i++) {
            if (buyers[i] == msg.sender) {
                buyers[i] = buyers[buyers.length - 1];
                buyers.pop();
            }
        }
    }

    function enterPoolAsSeller() public {
        require(!isSeller[msg.sender], "Seller already in pool");
        sellers.push(msg.sender);
        isSeller[msg.sender] = true;
    }

    function exitPoolAsSeller() public {
        require(isSeller[msg.sender], "Seller not in pool");
        isSeller[msg.sender] = false;
        for (uint i = 0; i < sellers.length; i++) {
            if (sellers[i] == msg.sender) {
                sellers[i] = sellers[sellers.length - 1];
                sellers.pop();
            }
        }
    }

    function getSellers() public view returns (address[] memory) {
        return sellers;
    }

    function getBuyers() public view returns (address[] memory) {
        return buyers;
    }
}