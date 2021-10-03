// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "../User.sol";
import "../Item.sol";
import "./UserContractCreator.sol";
import "./ItemContractCreator.sol";
import "../helpers/Structs.sol";

contract ContractFactory {
    address public admin;

    address[] public userContracts;
    uint256 public userCount;

    address[] public itemContracts;
    uint256 public itemCount;

    // map user address to User contract
    mapping(address => address) public userContractForUser;

    event adminChanged(address newAdminAddress);
    event userContractCreated(address userAddress, address userContract);
    event itemContractCreated(address itemOwnerAddress, address itemContract);

    constructor() {
        admin = msg.sender;
    }

    modifier notItemOwner(address itemOwnerAddress) {
        require(
            msg.sender != itemOwnerAddress,
            "Method is not available for item Owner"
        );
        _;
    }

    function createUserContractForNewUser(
        address _userAddress,
        string calldata _username,
        string calldata _deliveryAddress
    ) public {
        require(
            userContractForUser[_userAddress] == address(0x0),
            "User address already exists"
        );
        require(
            _userAddress == msg.sender,
            "Users can only create new account with their own address"
        );

        UserContractCreator userContractCreator;
        User newUserContract = userContractCreator.createUserContract(
            _userAddress,
            _username,
            _deliveryAddress
        );
        userContracts.push(address(newUserContract));
        userContractForUser[_userAddress] = address(newUserContract);
        userCount++;

        emit userContractCreated(_userAddress, address(newUserContract));
    }

    function createItemContract(Structs.ItemDetails calldata _itemDetails)
        public
    {
        require(
            _itemDetails.ownerAddress == msg.sender,
            "Method is restricted to item Owner"
        );
        ItemContractCreator itemContractCreator;
        Item newItemContract = itemContractCreator.createItemContract(
            _itemDetails
        );
        address newItemContractAddress = address(newItemContract);
        itemContracts.push(newItemContractAddress);
        itemCount++;

        emit itemContractCreated(msg.sender, newItemContractAddress);
    }
}
