// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./User.sol";
import "./Item.sol";
import "./helpers/Utils.sol";
import "./helpers/Structs.sol";

contract Rental {
    using Utils for *;
    using Structs for *;

    enum RentalStatus {
        CREATED,
        RENTED,
        RETURNED,
        END,
        OWNERDISPUTE,
        RENTERDISPUTE
    }

    //--All fees unit are in gwei--//

    address private itemContract;
    uint256 private rentPerDay;

    RentalStatus private rentalStatus;
    address payable private renterAddress;
    uint256 private renterDeposit;
    uint256 private start;
    uint256 private end;
    string[] private renterProofOfReturn; // IPFS hashes

    uint256 private rentalFees;
    uint256 private rentalFeesPaid;

    address payable private ownerAddress;
    uint256 private ownerDeposit;
    string[] private ownerProofOfTransfer; // IPFS hashes

    event itemRented(
        address itemContract,
        address renterAddress,
        address ownerAddress
    );

    event itemReturned(
        address itemContract,
        address renterAddress,
        address ownerAddress
    );

    event rentalEnded(address itemContract, address rentalContract);

    constructor(
        address _itemContract,
        Structs.ItemDetails memory _itemDetails,
        address payable _renterAddress,
        uint256 _rentalFees,
        uint256 _renterDeposit,
        uint256 _start,
        uint256 _end
    ) payable {
        require(
            msg.value == Utils.gweiToWei(_renterDeposit),
            "Value transfered not equal to required amount"
        );

        itemContract = _itemContract;
        rentPerDay = _itemDetails.rentPerDay;
        ownerAddress = _itemDetails.ownerAddress;

        rentalStatus = RentalStatus.CREATED;
        renterAddress = _renterAddress;
        renterDeposit = _renterDeposit;
        start = _start;
        end = _end;

        rentalFees = _rentalFees;
    }

    modifier onlyOwner() {
        require(msg.sender == ownerAddress, "Method is restricted to Owner");
        _;
    }

    modifier onlyRenter() {
        require(msg.sender == renterAddress, "Method is restricted to Renter");
        _;
    }

    function getRenterAddress() public view returns (address) {
        return renterAddress;
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getRentalStatus() public view returns (RentalStatus) {
        return rentalStatus;
    }

    function uploadOwnerProofOfTransferAndPayDeposit(
        string[] memory _ownerProofOfTransfer,
        uint256 _ownerDeposit
    ) public payable onlyOwner {
        require(
            msg.value == Utils.gweiToWei(_ownerDeposit),
            "Value transfered not equal to required amount"
        );
        require(
            rentalStatus == RentalStatus.CREATED,
            "Invalid rental status for method"
        );

        ownerDeposit = _ownerDeposit;
        ownerProofOfTransfer = _ownerProofOfTransfer;
        rentalStatus = RentalStatus.RENTED;

        emit itemRented(itemContract, renterAddress, ownerAddress);
    }

    // function uploadRenterProofOfReturn(string[] memory _renterProofOfReturn)
    //     public
    //     onlyRenter
    // {
    //     require(
    //         rentalFeesPaid == rentalFees,
    //         "Rental fees have to be paid before returning"
    //     );

    //     renterProofOfReturn = _renterProofOfReturn;
    //     rentalStatus = RentalStatus.RETURNED;

    //     emit itemReturned(itemContract, renterAddress, ownerAddress);
    // }

    function payRentalIncludingLateFees(uint256 _amount)
        public
        payable
        onlyRenter
    {
        require(
            msg.value == Utils.gweiToWei(_amount),
            "Value transfered not equal to required amount"
        );
        require(
            msg.value >= Utils.gweiToWei(rentalFees),
            "Rental paid less than required amount"
        );

        rentalFeesPaid = _amount;
    }

    // owner gets back deposit and receives rental fees paid, renter gets back deposit
    function settleDeposit() public onlyOwner {
        require(
            rentalStatus == RentalStatus.RETURNED &&
                rentalFeesPaid == rentalFees,
            "Unable to claim payment with current rental status"
        );
        require(
            ownerDeposit > 0 || renterDeposit > 0,
            "No remaining deposit to claim"
        );

        renterAddress.transfer(Utils.gweiToWei(renterDeposit));
        ownerAddress.transfer(address(this).balance);

        assert(address(this).balance == 0);
        rentalStatus = RentalStatus.END;

        emit rentalEnded(itemContract, address(this));
    }

    function settleRentalAfterFiveLateDays() public payable onlyOwner {
        // require(
        //     block.timestamp > end + (5 * 24 * 60 * 60),
        //     "Unable to settle rental before 5 late days"
        // );
        // require(
        //     rentalStatus == RentalStatus.RENTED,
        //     "Unable to settle rental with current rental status"
        // );

        // change item status
        Item item = Item(itemContract);
        item.changeItemStatus(2); // DELETED

        // // transfer all balance in the contract to owner
        // ownerAddress.transfer(address(this).balance);

        // // set renter as dishonest user
        // User user = User(renterAddress);
        // user.setAsDishonest();

        rentalStatus = RentalStatus.END;
    }
}
