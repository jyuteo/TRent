// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "../Rental.sol";
import "../helpers/Structs.sol";

contract RentalContractCreator {
    function createRentalContract(
        address _itemContract,
        Structs.ItemDetails memory _itemDetails,
        address _renterUserContract,
        address payable _renterAddress,
        uint256 _rentalFees,
        uint256 _renterDeposit,
        uint256 _start,
        uint256 _end,
        uint8 _numInstallment
    ) public returns (Rental) {
        return
            new Rental(
                _itemContract,
                _itemDetails,
                _renterUserContract,
                _renterAddress,
                _rentalFees,
                _renterDeposit,
                _start,
                _end,
                _numInstallment
            );
    }
}
