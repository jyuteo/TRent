// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

library Structs {
    struct ItemDetails {
        address ownerUserContract;
        address ownerAddress;
        string name;
        string collectionOrReturnAddress;
        string description;
        uint256 rentPerDay;
        uint8 maxAllowableLateDays;
        bool isAvailableForRent;
        string[] mediaIPFSHashes;
    }
}
