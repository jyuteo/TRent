// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "../helpers/Structs.sol";
import "../Item.sol";

contract ItemContractCreator {
    function createItemContract(Structs.ItemDetails calldata _itemDetails)
        public
        returns (Item)
    {
        return new Item(_itemDetails);
    }
}
