// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "../User.sol";

contract UserContractCreator {
    address[] private userContracts;
    uint128 private userCount;

    // map user address to User contract
    mapping(address => address) public userContractForUser;

    event userContractCreated(address userAddress, address userContract);

    function getUserContracts() public view returns (address[] memory) {
        return userContracts;
    }

    function getUserCount() public view returns (uint256) {
        return userCount;
    }

    function createUserContract(
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

        User newUserContract = new User(
            _userAddress,
            _username,
            _deliveryAddress
        );

        userContracts.push(address(newUserContract));
        userContractForUser[_userAddress] = address(newUserContract);
        userCount++;

        emit userContractCreated(_userAddress, address(newUserContract));
    }
}
