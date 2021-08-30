// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./Item.sol";

contract Rental {
    enum RentalStatus {
        CREATED,
        RENTED,
        RETURNED,
        END,
        OWNERDISPUTEOPENED,
        RENTERDISPUTEOPENED
    }

    address public itemContract;
    Item public item;
    Item.ItemDetails public itemDetails;
    uint256 public rentPerDay;
    uint8 public maxAllowableLateDays;
    uint8 public multipleForLateFees;

    RentalStatus public rentalStatus;
    address payable public renterAddress;
    address public renterUserContract;
    uint256 public renterDeposit;
    uint256 public start;
    uint256 public end;
    string[] public renterProofOfReturn; // IPFS hashes

    uint256 public rentalFees;
    uint256 public paidRentalFees;
    uint256 public remainingRentalFees;
    uint256 public claimableRentalFees;
    uint256 public claimedRentalFees;
    uint8 public numInstallment;
    uint8 public remainingNumInstallment;

    address payable public ownerAddress;
    address public ownerUserContract;
    uint256 public ownerDeposit;
    string[] public ownerProofOfTransfer; // IPFS hashes

    event rentalContractCreated(
        address renterUserContract,
        address renterAddress,
        address rentalContract,
        uint256 renterDeposit
    );

    event itemRented(
        address itemContract,
        address renterAddress,
        address ownerAddress,
        uint256 ownerDeposit,
        RentalStatus rentalStatus
    );

    event itemReturned(
        address itemContract,
        address renterAddress,
        address ownerAddress,
        RentalStatus rentalStatus
    );

    event rentalEnded(address itemContract, address rentalContract);

    event lateFeesPaid(
        address itemContract,
        address rentalContract,
        address renterUserContract,
        uint256 lateFees
    );

    constructor(
        address _itemContract,
        address _renterUserContract,
        address payable _renterAddress,
        uint256 _rentalFees,
        uint256 _renterDeposit,
        uint256 _start,
        uint256 _end,
        uint8 _numInstallment
    ) payable {
        require(
            msg.value == _renterDeposit,
            "Value transfered is less than required amount"
        );

        itemContract = _itemContract;
        item = Item(_itemContract);
        itemDetails = item.getItemDetails();
        rentPerDay = itemDetails.rentPerDay;
        maxAllowableLateDays = itemDetails.maxAllowableLateDays;
        multipleForLateFees = itemDetails.multipleForLateFees;
        ownerUserContract = itemDetails.ownerUserContract;
        ownerAddress = itemDetails.ownerAddress;

        rentalStatus = RentalStatus.CREATED;
        renterUserContract = _renterUserContract;
        renterAddress = _renterAddress;
        renterDeposit = _renterDeposit;
        start = _start;
        end = _end;

        rentalFees = _rentalFees;
        numInstallment = _numInstallment;
        remainingNumInstallment = _numInstallment;
        remainingRentalFees = _rentalFees;
        paidRentalFees = 0;
        claimedRentalFees = 0;

        emit rentalContractCreated(
            _renterUserContract,
            _renterAddress,
            address(this),
            _renterDeposit
        );
    }

    modifier onlyOwner() {
        require(msg.sender == ownerAddress, "Method is restricted to Owner");
        _;
    }

    modifier onlyRenter() {
        require(msg.sender == renterAddress, "Method is restricted to Renter");
        _;
    }

    modifier correctFinalInstallmentValue(uint256 _amount) {
        if (remainingNumInstallment == 1) {
            require(_amount == remainingRentalFees);
        }
        _;
    }

    function uploadOwnerProofOfTransferAndPayDeposit(
        string[] memory _ownerProofOfTransfer,
        uint256 _ownerDeposit
    ) public payable onlyOwner {
        require(
            msg.value >= _ownerDeposit,
            "Value transfered is less than required amount"
        );
        require(
            rentalStatus == RentalStatus.CREATED,
            "Invalid rental status for method"
        );

        ownerDeposit = _ownerDeposit;
        ownerProofOfTransfer = _ownerProofOfTransfer;
        rentalStatus = RentalStatus.RENTED;

        emit itemRented(
            itemContract,
            renterAddress,
            ownerAddress,
            ownerDeposit,
            rentalStatus
        );
    }

    function uploadRenterProofOfReturn(string[] memory _renterProofOfReturn)
        public
        onlyRenter
    {
        require(
            remainingRentalFees == 0,
            "Settle all payment before returning"
        );

        renterProofOfReturn = _renterProofOfReturn;
        rentalStatus = RentalStatus.RETURNED;

        emit itemReturned(
            itemContract,
            renterAddress,
            ownerAddress,
            rentalStatus
        );
    }

    function payRentalInstallment(uint256 _amount)
        public
        payable
        onlyRenter
        correctFinalInstallmentValue(_amount)
    {
        require(
            msg.value == _amount,
            "Value transfered not equal to required amount"
        );
        paidRentalFees += _amount;
        remainingRentalFees -= _amount;
        remainingNumInstallment--;
        assert(rentalFees == paidRentalFees + remainingRentalFees);

        claimableRentalFees += _amount;
    }

    function claimRentalFees() public onlyOwner {
        require(claimableRentalFees > 0, "There is no claimable rental fees");
        require(
            rentalStatus != RentalStatus.OWNERDISPUTEOPENED,
            "Unable to claim payment with current rental status"
        );
        require(
            rentalStatus != RentalStatus.RENTERDISPUTEOPENED,
            "Unable to claim payment with current rental status"
        );
        require(
            rentalStatus != RentalStatus.END,
            "Unable to claim payment with current rental status"
        );

        ownerAddress.transfer(claimableRentalFees);
        claimedRentalFees += claimableRentalFees;
        claimableRentalFees = 0;
    }

    // claim owner's deposit and return renter's deposit
    function settleDeposit() public onlyOwner {
        require(
            rentalStatus == RentalStatus.RETURNED,
            "Unable to claim payment with current rental status"
        );
        require(
            ownerDeposit > 0 || renterDeposit > 0,
            "No remaining deposit to claim"
        );
        require(
            remainingRentalFees == 0,
            "Rental fees has not been fully settled by renter"
        );
        require(paidRentalFees == rentalFees);
        require(
            claimedRentalFees == rentalFees,
            "Rental fees has not been fully claimed by owner"
        );

        if (ownerDeposit > 0) {
            ownerAddress.transfer(ownerDeposit);
        }

        if (renterDeposit > 0) {
            renterAddress.transfer(renterDeposit);
        }

        assert(address(this).balance == 0);
        rentalStatus = RentalStatus.END;

        emit rentalEnded(itemContract, address(this));
    }

    function payLateFees(uint256 _lateFees) public payable onlyRenter {
        require(
            block.timestamp > end && getDaysBetween(end, block.timestamp) <= 5
        );
        require(msg.value == _lateFees);

        emit lateFeesPaid(
            itemContract,
            address(this),
            renterUserContract,
            _lateFees
        );
    }

    //----------------------------------helpers-------------------------------------//
    function getDaysBetween(uint256 _time1, uint256 _time2)
        internal
        pure
        returns (uint256)
    {
        uint256 secondsBetween = _time2 - _time1;
        uint256 daysBetween = secondsBetween / 60 / 60 / 24;
        return daysBetween;
    }
}
