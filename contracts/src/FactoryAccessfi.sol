// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;


import {AccessFiPool} from "./Accessfi.sol";
import {IAccessFiPool} from "./interfaces/IAccessfi.sol";


contract FactoryAccessfi {
    address public accessfi;
    address[] public pools;

    function createPool(address verifications, address _nftaddress) public  returns (IAccessFiPool) {
        AccessFiPool accessfiPool = new AccessFiPool(verifications, _nftaddress);
        pools.push(address(accessfiPool));
        return IAccessFiPool(address(accessfiPool));
    }

    function getAllPools() public view returns (address[] memory) {
        return pools;
    }

    function getPoolsCount() public view returns (uint256) {
        return pools.length;
    }

    function getPool(uint256 index) public view returns (address) {
        require(index < pools.length, "Pool index out of bounds");
        return pools[index];
    }
}