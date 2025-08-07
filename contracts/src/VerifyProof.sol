// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IVerifyProofAggregation} from "./interfaces/IVerifyProofAggregation.sol";
import {ICustomNFT} from "./interfaces/ICustomNFT.sol";
import {CustomNFT} from "./CustomNFT.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {Strings} from "openzeppelin-contracts/contracts/utils/Strings.sol";

contract VerifyProof is Ownable {

    bytes32 public constant PROVING_SYSTEM_ID = keccak256(abi.encodePacked("groth16"));
    bytes32 public constant VERSION_HASH = sha256(abi.encodePacked(""));

    address public zkVerify;
    bytes32 public vkey;
    
    // Custom NFT contract
    CustomNFT public nftContract;
    
    // Mapping to track if address has claimed
    mapping(address => bool) public hasClaimed;

    // Events
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 aggregationId,
        uint256 domainId,
        uint256 timestamp,
        string tokenURI
    );

    event ProofVerified(
        address indexed verifier,
        uint256 aggregationId,
        uint256 domainId,
        bool isValid
    );

    constructor(
        address _zkVerify,
        bytes32 _vkey,
        string memory _name,
        string memory _symbol
    ) Ownable(msg.sender) {
        zkVerify = _zkVerify;
        vkey = _vkey;
        
        // Deploy the custom NFT contract
        nftContract = new CustomNFT(_name, _symbol);
    }

    /**
     * @dev Generates a unique token ID using block variables and sender address
     * @param _sender The address of the token minter
     * @return A unique token ID
     */
    function _generateTokenId(address _sender) internal view returns (uint256) {
        return uint256(
            keccak256(
                abi.encodePacked(
                    _sender,
                    block.timestamp,
                    block.prevrandao,
                    block.number,
                    nftContract.getTokenIdCounter()
                )
            )
        );
    }

    /**
     * @dev Creates a token URI for the given token ID
     * @param _tokenId The token ID
     * @param _owner The owner of the token
     * @param _aggregationId The aggregation ID from the proof
     * @param _domainId The domain ID from the proof
     * @return The token URI string
     */
    function _createTokenURI(
        uint256 _tokenId,
        address _owner,
        uint256 _aggregationId,
        uint256 _domainId
    ) internal view returns (string memory) {
        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                _base64Encode(
                    abi.encodePacked(
                        '{"name":"Proof Verification NFT #',
                        Strings.toString(_tokenId),
                        '","description":"NFT minted for successful zero-knowledge proof verification","attributes":[{"trait_type":"Aggregation ID","value":"',
                        Strings.toString(_aggregationId),
                        '"},{"trait_type":"Domain ID","value":"',
                        Strings.toString(_domainId),
                        '"},{"trait_type":"Owner","value":"',
                        Strings.toHexString(uint160(_owner)),
                        '"},{"trait_type":"Mint Timestamp","value":"',
                        Strings.toString(block.timestamp),
                        '"}]}'
                    )
                )
            )
        );
    }

    /**
     * @dev Simple base64 encoding function
     */
    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        bytes memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        uint256 len = data.length;
        if (len == 0) return "";

        uint256 encodedLen = 4 * ((len + 2) / 3);
        bytes memory result = new bytes(encodedLen);

        uint256 i = 0;
        uint256 j = 0;

        while (i < len) {
            uint256 a = i < len ? uint8(data[i++]) : 0;
            uint256 b = i < len ? uint8(data[i++]) : 0;
            uint256 c = i < len ? uint8(data[i++]) : 0;

            uint256 triple = (a << 16) + (b << 8) + c;

            result[j++] = table[triple >> 18 & 0x3F];
            result[j++] = table[triple >> 12 & 0x3F];
            result[j++] = table[triple >> 6 & 0x3F];
            result[j++] = table[triple & 0x3F];
        }

        // Adjust padding
        while (j > 0 && result[j - 1] == "=") {
            j--;
        }

        assembly {
            mstore(result, j)
        }

        return string(result);
    }

    /**
     * @dev Verifies the proof and mints an NFT
     */
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

        // Increment token counter
        nftContract.incrementTokenIdCounter();

        // Generate unique token ID
        uint256 tokenId = _generateTokenId(msg.sender);
        
        // Create token URI
        string memory _tokenURI = _createTokenURI(tokenId, msg.sender, _aggregationId, _domainId);

        // Mint the NFT using the custom NFT contract
        nftContract.mint(msg.sender, tokenId, _tokenURI);

        // Emit events
        emit ProofVerified(msg.sender, _aggregationId, _domainId, valid);
        emit NFTMinted(tokenId, msg.sender, _aggregationId, _domainId, block.timestamp, _tokenURI);
    }

    /**
     * @dev Returns the total number of tokens minted
     */
    function totalSupply() external view returns (uint256) {
        return nftContract.totalSupply();
    }

    /**
     * @dev Returns the current token ID counter
     */
    function getTokenIdCounter() external view returns (uint256) {
        return nftContract.getTokenIdCounter();
    }
    
    // Delegate NFT functions to the custom NFT contract
    
    function balanceOf(address owner) public view returns (uint256) {
        return nftContract.balanceOf(owner);
    }
    
    function ownerOf(uint256 tokenId) public view returns (address) {
        return nftContract.ownerOf(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view returns (string memory) {
        return nftContract.tokenURI(tokenId);
    }
    
    function transfer(address to, uint256 tokenId) public {
        nftContract.transfer(to, tokenId);
    }
    
    function transferFrom(address from, address to, uint256 tokenId) public {
        nftContract.transferFrom(from, to, tokenId);
    }
    
    function approve(address to, uint256 tokenId) public {
        nftContract.approve(to, tokenId);
    }
    
    function getApproved(uint256 tokenId) public view returns (address) {
        return nftContract.getApproved(tokenId);
    }
    
    function setApprovalForAll(address operator, bool approved) public {
        nftContract.setApprovalForAll(operator, approved);
    }
    
    function isApprovedForAll(address owner, address operator) public view returns (bool) {
        return nftContract.isApprovedForAll(owner, operator);
    }
    
    function exists(uint256 tokenId) external view returns (bool) {
        return nftContract.exists(tokenId);
    }
}