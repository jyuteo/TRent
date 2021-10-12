// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "../Rental.sol";
import "../Item.sol";
import "../helpers/Structs.sol";
import "../helpers/Utils.sol";

contract RentalContractCreator {
    using Utils for *;

    address[] public rentalContracts;
    uint8 public rentalContractCount;

    mapping(address => address[]) rentalContractsForItem;

    event rentalContractCreated(
        address rentalContract,
        address itemContract,
        address renterAddress
    );

    function createRentalContract(
        address _itemContract,
        Structs.ItemDetails memory _itemDetails,
        address _renterUserContract,
        address payable _renterAddress,
        uint256 _rentalFees,
        uint256 _renterDeposit,
        uint256 _start,
        uint256 _end
    ) public payable {
        require(
            msg.sender == _renterAddress,
            "Renter address does not match msg.sender"
        );
        require(
            msg.value == Utils.gweiToWei(_renterDeposit),
            "Value transfered is not equal required amount"
        );

        Rental newRentalContract = (new Rental){value: msg.value}(
            _itemContract,
            _itemDetails,
            _renterUserContract,
            _renterAddress,
            _rentalFees,
            _renterDeposit,
            _start,
            _end
        );

        rentalContracts.push(address(newRentalContract));
        rentalContractCount++;

        Item item = Item(_itemContract);
        item.handleNewRental(
            address(newRentalContract),
            _start,
            _end,
            _renterAddress
        );

        emit rentalContractCreated(
            address(newRentalContract),
            _itemContract,
            _renterAddress
        );
    }
}
