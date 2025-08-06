// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;


import {AccessFiPool} from "./Accessfi.sol";
import {IAccessFiPool} from "./interfaces/IAccessfi.sol";


contract FactoryAccessfi {
    address public accessfi;
    address[] public pools;


    function createPool(address verifications) public  returns (IAccessFiPool) {
        AccessFiPool accessfiPool = new AccessFiPool(verifications);
        pools.push(address(accessfiPool));
        return IAccessFiPool(address(accessfiPool));
    }


}