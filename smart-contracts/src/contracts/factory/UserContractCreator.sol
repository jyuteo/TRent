// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "../User.sol";

contract UserContractCreator {
    function createUserContract(
        address _userAddress,
        string calldata _username,
        string calldata _deliveryAddress
    ) public returns (User) {
        return new User(_userAddress, _username, _deliveryAddress);
    }
}
