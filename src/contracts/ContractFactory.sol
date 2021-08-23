// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./User.sol";
import "./Item.sol";

contract ContractFactory {
    address public admin;

    address[] public userContracts;
    uint256 public userCount;

    address[] public itemContracts;
    uint256 public itemCount;

    // map Item contract to a list of Rental contracts of the item
    mapping(address => address[]) internal rentalContractsForItem;

    // map user address to User contract
    mapping(address => address) internal userContractForUser;

    mapping(address => bool) public hasItemContract;

    event adminChanged(address newAdmin);
    event userContractCreated(address userAddress, address userContractAddress);
    event itemContractCreated(
        address itemOwnerAddress,
        address itemContractAddress
    );

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }

    function setAdmin(address _newAdmin) public onlyAdmin {
        admin = _newAdmin;

        emit adminChanged(admin);
    }

    function getRentalContractsForItem(address _item)
        public
        view
        returns (address[] memory)
    {
        return rentalContractsForItem[_item];
    }

    function getUserContractForUser(address _userAddress)
        public
        view
        returns (address)
    {
        return userContractForUser[_userAddress];
    }

    function hasUserContract(address _user) public view returns (bool) {
        if (userContractForUser[_user] == address(0x0)) {
            return false;
        } else {
            return true;
        }
    }

    function createUserContractForNewUser(
        address _user,
        string calldata _username,
        string calldata _deliveryAddress
    ) public {
        require(hasUserContract(_user) == false);

        User newUserContract = new User(_user, _username, _deliveryAddress);
        userContracts.push(address(newUserContract));
        userContractForUser[_user] = address(newUserContract);
        userCount++;

        emit userContractCreated(_user, address(newUserContract));
    }

    function createItemContract(Item.ItemDetails calldata _itemDetails) public {
        Item newItemContract = new Item(_itemDetails);
        itemContracts.push(address(newItemContract));
        hasItemContract[address(newItemContract)] = true;
        itemCount++;

        emit itemContractCreated(msg.sender, address(newItemContract));
    }

    // function createRentalContract
}
