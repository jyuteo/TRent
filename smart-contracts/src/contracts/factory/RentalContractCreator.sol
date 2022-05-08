// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "../Rental.sol";
import "../Item.sol";
import "../User.sol";
import "../helpers/Structs.sol";
import "../helpers/Utils.sol";

contract RentalContractCreator {
    using Utils for *;

    address[] public rentalContracts;
    uint128 public rentalContractCount;

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

        Item item = Item(_itemContract);

        require(
            validateRentalStartEnd(item, _start, _end),
            "Selected rental period is not available"
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

        item.handleNewRental(
            address(newRentalContract),
            _start,
            _end,
            _renterAddress
        );

        address ownerUserContract = item.getOwnerUserContract();
        User owner = User(ownerUserContract);
        owner.addNewLending(
            _itemContract,
            address(newRentalContract),
            ownerUserContract,
            _renterUserContract,
            _start,
            _end
        );

        User renter = User(_renterUserContract);
        renter.addNewBorrowing(
            _itemContract,
            address(newRentalContract),
            ownerUserContract,
            _renterUserContract,
            _start,
            _end
        );

        emit rentalContractCreated(
            address(newRentalContract),
            _itemContract,
            _renterAddress
        );
    }

    function validateRentalStartEnd(
        Item _item,
        uint256 _start,
        uint256 _end
    ) private view returns (bool) {
        uint128 rentalCount = _item.rentalContractCount();
        for (uint128 i = 0; i < rentalCount; i++) {
            (uint256 rentalStart, uint256 rentalEnd) = _item.rentalPeriods(i);
            uint256 maxStart;
            uint256 minEnd;
            if (rentalStart > _start) {
                maxStart = rentalStart;
            } else {
                maxStart = _start;
            }
            if (rentalEnd > _end) {
                minEnd = _end;
            } else {
                minEnd = rentalEnd;
            }
            if (maxStart <= minEnd) {
                return false;
            }
        }
        return true;
    }
}
