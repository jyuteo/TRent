// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

library Structs {
    struct ItemDetails {
        address ownerUserContract;
        address payable ownerAddress;
        string name;
        string description;
        string collectionOrReturnAddress;
        uint256 rentPerDay; // in gwei
        uint8 maxAllowableLateDays;
        uint8 multipleForLateFees;
        bool isAvailableForRent;
        string[] imageIPFSUrl;
    }
}
