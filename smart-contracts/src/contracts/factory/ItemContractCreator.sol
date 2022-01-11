// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "../helpers/Structs.sol";
import "../Item.sol";

contract ItemContractCreator {
    address[] private itemContracts;
    uint256 private itemCount;

    modifier notItemOwner(address itemOwnerAddress) {
        require(
            msg.sender != itemOwnerAddress,
            "Method is not available for item Owner"
        );
        _;
    }

    event itemContractCreated(address itemOwnerAddress, address itemContract);

    function getItemContracts() public view returns (address[] memory) {
        return itemContracts;
    }

    function getItemCount() public view returns (uint256) {
        return itemCount;
    }

    function createItemContract(Structs.ItemDetails calldata _itemDetails)
        public
    {
        require(
            _itemDetails.ownerAddress == msg.sender,
            "Method is restricted to item Owner"
        );
        Item newItemContract = new Item(_itemDetails);
        address newItemContractAddress = address(newItemContract);
        itemContracts.push(newItemContractAddress);
        itemCount++;

        emit itemContractCreated(msg.sender, newItemContractAddress);
    }
}
