// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IAccessFiPool} from "./interfaces/IAccessfi.sol";
import {VerifyProof} from "./VerifyProof.sol";

contract AccessFiPool is IAccessFiPool {

    Seller[] public sellers;
    Buyer[] public buyers;
    address public verifications;
    VerifyProof public verifyProofContract;

    mapping(address => uint256) private sellerIndex;
    mapping(address => uint256) private buyerIndex;
    mapping(address => bool) public isBuyer;
    mapping(address => bool) public isSeller;
    mapping(address => mapping(address => bool)) public hasSold;

    uint256 public currentPrice;
    uint256 public totalSellers;

    // Events
    event SellerSoldToBuyer(
        address indexed seller,
        address indexed buyer,
        uint256 timestamp,
        uint256 newTokenId
    );

    event NFTMintedForSeller(
        address indexed seller,
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 timestamp
    );

    constructor(address _verifications, address _verifyProofContract) {
        verifications = _verifications;
        verifyProofContract = VerifyProof(_verifyProofContract);
    }

    function buy(address seller) public view {
        require(isBuyer[seller], "Seller not in pool");
        require(isBuyer[msg.sender], "Buyer not in pool");
    }
    


    /**
     * @dev Function for buyers to initiate a purchase from a seller
     * @param seller The seller's address
     */
    function buyFromSeller(address seller) external payable {
        require(isBuyer[msg.sender], "Caller is not a buyer");
        require(isSeller[seller], "Seller not in pool");
        require(!hasSold[seller][msg.sender], "Already purchased from this seller");
        
        // Get buyer's price per token
        uint256 buyerIdx = buyerIndex[msg.sender];
        require(buyerIdx > 0, "Buyer not found");
        uint256 pricePerToken = buyers[buyerIdx - 1].pricePerToken;
        
        // Check if sent amount matches the price
        require(msg.value == pricePerToken, "Incorrect payment amount");
        
        // Check if seller has an NFT to sell
        uint256 sellerTokenCount = verifyProofContract.balanceOf(seller);
        require(sellerTokenCount > 0, "Seller doesn't have any NFTs to sell");
        
        // Get the first NFT token ID owned by the seller
        uint256 tokenId = _getFirstTokenIdOfSeller(seller);
        require(tokenId != 0, "No valid NFT found for seller");
        
        // No approval needed with our custom NFT contract
        
        // Transfer the NFT from seller to buyer
        verifyProofContract.transferFrom(seller, msg.sender, tokenId);
        
        // Transfer payment to seller
        (bool success, ) = payable(seller).call{value: pricePerToken}("");
        require(success, "Payment transfer failed");
        
        // Record the sale
        hasSold[seller][msg.sender] = true;

        uint256 sIdx = sellerIndex[seller];
        uint256 bIdx = buyerIndex[msg.sender];
        if (sIdx > 0 && bIdx > 0) {
            sellers[sIdx-1].buyers.push(msg.sender);
            buyers[bIdx-1].sellers.push(seller);
            
            // Update amounts
            sellers[sIdx-1].amountEarned += pricePerToken;
            buyers[bIdx-1].amountSpent += pricePerToken;
            buyers[bIdx-1].tokensGained += 1;
        }

        // Mint a new NFT for the seller
        _mintNFTForSeller(seller, msg.sender);

        emit SellerSoldToBuyer(seller, msg.sender, block.timestamp, tokenId);
    }

    /**
     * @dev Check if a seller has NFTs available for sale
     * @param _seller The seller's address
     * @return True if seller has NFTs, false otherwise
     */
    function sellerHasNFTs(address _seller) external view returns (bool) {
        return verifyProofContract.balanceOf(_seller) > 0;
    }

    /**
     * @dev Get the number of NFTs owned by a seller
     * @param _seller The seller's address
     * @return Number of NFTs owned
     */
    function getSellerNFTCount(address _seller) external view returns (uint256) {
        return verifyProofContract.balanceOf(_seller);
    }

    /**
     * @dev Get the price per token for a specific buyer
     * @param _buyer The buyer's address
     * @return Price per token
     */
    function getBuyerPricePerToken(address _buyer) external view returns (uint256) {
        require(isBuyer[_buyer], "Address is not a buyer");
        uint256 buyerIdx = buyerIndex[_buyer];
        require(buyerIdx > 0, "Buyer not found");
        return buyers[buyerIdx - 1].pricePerToken;
    }

    /**
     * @dev Internal function to mint NFT for seller after successful sale
     * @param _seller The seller's address
     * @param _buyer The buyer's address
     */
    function _mintNFTForSeller(address _seller, address _buyer) internal {
        // Generate unique parameters for the NFT
        uint256 aggregationId = uint256(keccak256(abi.encodePacked(_seller, _buyer, block.timestamp)));
        uint256 domainId = uint256(keccak256(abi.encodePacked("accessfi_sale", block.number)));
        
        // Create dummy merkle path for the sale verification
        bytes32[] memory merklePath = new bytes32[](1);
        merklePath[0] = keccak256(abi.encodePacked(_seller, _buyer));
        
        bytes32 leaf = keccak256(abi.encodePacked("sale_verified", _seller, _buyer, block.timestamp));
        
        // Call the VerifyProof contract to mint NFT
        // Note: This assumes the seller has already been verified through the proof system
        // In a real implementation, you might want to verify the seller's eligibility first
        
        try verifyProofContract.verifyAndMint(
            aggregationId,
            domainId,
            merklePath,
            leaf,
            1, // leafCount
            0  // index
        ) {
            // Get the latest token ID (this is a simplified approach)
            uint256 tokenId = verifyProofContract.totalSupply();
            emit NFTMintedForSeller(_seller, tokenId, _buyer, block.timestamp);
        } catch {
            // If NFT minting fails, still record the sale but emit a different event
            emit SellerSoldToBuyer(_seller, _buyer, block.timestamp, 0);
        }
    }

    // /**
    //  * @dev Function to manually mint NFT for a seller (for testing or special cases)
    //  * @param _seller The seller's address
    //  * @param _buyer The buyer's address
    //  */
    // function mintNFTForSeller(address _seller, address _buyer) external {
    //     require(isSeller[_seller], "Address is not a seller");
    //     require(isBuyer[_buyer], "Address is not a buyer");
    //     require(hasSold[_seller][_buyer], "No sale recorded between these addresses");
        
    //     _mintNFTForSeller(_seller, _buyer);
    // }

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
        sellerIndex[msg.sender] = sellers.length;
        isSeller[msg.sender] = true;
        totalSellers++;
    }

    function exitPoolAsSeller() public {
        require(isSeller[msg.sender], "Seller not in pool");
        uint256 idx = sellerIndex[msg.sender];
        require(idx > 0, "Seller not found");
        uint256 arrIdx = idx - 1;

        if (arrIdx < sellers.length - 1) {
            sellers[arrIdx] = sellers[sellers.length - 1];
            sellerIndex[sellers[arrIdx].seller] = arrIdx + 1;
        }
        sellers.pop();
        sellerIndex[msg.sender] = 0;
        isSeller[msg.sender] = false;
        totalSellers--;
    }

    function getAvailableSellers() public view returns(address[] memory, uint256) {
        require(isBuyer[msg.sender] == true, "this function is to know available sellers for individual buyers");
        address[] memory availableSellers = new address[](sellers.length);
        uint256 count = 0;
        
        for (uint i = 0; i < sellers.length; i++) {
            if (!hasSold[sellers[i].seller][msg.sender]) {
                availableSellers[count] = sellers[i].seller;
                count++;
            }
        }
        
        return (availableSellers, count);
    }
    function getAllSellers() public view returns (address[] memory) {
        address[] memory sellerAddrs = new address[](sellers.length);
        for (uint i = 0; i < sellers.length; i++) {
            sellerAddrs[i] = sellers[i].seller;
        }
        return sellerAddrs;
    }

    function getAllBuyers() public view returns (address[] memory) {
        address[] memory buyerAddrs = new address[](buyers.length);
        for (uint i = 0; i < buyers.length; i++) {
            buyerAddrs[i] = buyers[i].buyer;
        }
        return buyerAddrs;
    }

    /**
     * @dev Get the first token ID owned by a seller
     * @param _seller The seller's address
     * @return The first token ID owned by the seller, or 0 if none found
     */
    function _getFirstTokenIdOfSeller(address _seller) internal view returns (uint256) {
        uint256 totalSupply = verifyProofContract.totalSupply();
        
        // Check from token ID 1 to total supply
        for (uint256 i = 1; i <= totalSupply; i++) {
            try verifyProofContract.ownerOf(i) returns (address owner) {
                if (owner == _seller) {
                    return i;
                }
            } catch {
                // Token doesn't exist, continue
                continue;
            }
        }
        return 0;
    }


}