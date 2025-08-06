// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

interface IAccessFiPool {

    struct Seller {
        address seller;
        address[] buyers;
        uint256 amountEarned;
        uint256 TokensBurned;
    }

    struct Buyer {
        address buyer;
        address[] sellers;
        uint256 amountSpent;
        uint256 tokensGained;
        uint256 pricePerToken;
        uint256 minRequiredTokens;
    }

    function buy(address seller) view external;
    function sell(address buyer) external;
    function enterPoolAsBuyer(uint256 _pricePerToken, uint256 _totalTokens) external;
    function exitPoolAsBuyer() external;
    function enterPoolAsSeller() external;
    function exitPoolAsSeller() external;
    function getAllSellers() external view returns (address[] memory);
    function getAllBuyers() external view returns (address[] memory);

}