// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./User.sol";

contract ContractFactory {
    address public admin;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }

    // address[] internal deployedItemContracts;

    // map Item contract to a list of Rental contracts of the item
    // mapping(address => address[]) internal deployedRentalContractsForItem;

    // map user address to deployed User contract
    mapping(address => address) internal deployedUserContractForUser;

    event adminChanged(address newAdmin);
    event userContractCreated(address userAddress, address userContractAddress);

    function setAdmin(address _newAdmin) public onlyAdmin {
        admin = _newAdmin;

        emit adminChanged(admin);
    }

    // function getDeployedItemContracts() public view returns (address[] memory) {
    //     return deployedItemContracts;
    // }

    // function getDeployedRentalContractsForItem(address _item)
    //     public
    //     view
    //     returns (address[] memory)
    // {
    //     return deployedRentalContractsForItem[_item];
    // }

    function getDeployedUserContractForUser(address _userAddress)
        public
        view
        returns (address)
    {
        return deployedUserContractForUser[_userAddress];
    }

    function hasUserContract(address _user) public view returns (bool) {
        if (deployedUserContractForUser[_user] == address(0x0)) {
            return false;
        } else {
            return true;
        }
    }

    function createUserContractForNewUser(
        address _user,
        string memory _username,
        string memory _deliveryAddress
    ) public {
        require(hasUserContract(_user) == false);

        User newUserContract = new User(_user, _username, _deliveryAddress);
        deployedUserContractForUser[_user] = address(newUserContract);

        emit userContractCreated(_user, address(newUserContract));
    }

    // function hasItemContract

    // function createItemContract

    // function createRentalContract
}
