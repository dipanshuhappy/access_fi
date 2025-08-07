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
    function buyFromSeller(address seller) external payable;
    // function mintNFTForSeller(address _seller, address _buyer) external;s
    function sellerHasNFTs(address _seller) external view returns (bool);
    function getSellerNFTCount(address _seller) external view returns (uint256);
    function getBuyerPricePerToken(address _buyer) external view returns (uint256);
    function approveNFTForSale(uint256 tokenId) external;
    function approveAllNFTsForSale() external;
    function isNFTApprovedForSale(address _seller, uint256 _tokenId) external view returns (bool);
    function enterPoolAsBuyer(uint256 _pricePerToken, uint256 _totalTokens) external;
    function exitPoolAsBuyer() external;
    function enterPoolAsSeller() external;
    function exitPoolAsSeller() external;
    function getAllSellers() external view returns (address[] memory);
    function getAllBuyers() external view returns (address[] memory);

}