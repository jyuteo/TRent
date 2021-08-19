// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./User.sol";

contract ContractFactory {
    address[] private deployedItemContracts;

    // map Item contract to a list of Rental contracts of the item
    mapping(address => address[]) private deployedRentalContractsForItem;

    // map user address to deployed User contract
    mapping(address => address) public deployedUserContractForUser;

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
    ) public returns (User) {
        require(hasUserContract(_user) == false);

        User newUser = new User(_user, _username, _deliveryAddress);
        deployedUserContractForUser[_user] = address(newUser);
        return newUser;

        //newUser = await User.new(_user, _username, _deliveryAddress);
    }

    // function hasItemContract

    // function createItemContract

    // function createRentalContract
}
