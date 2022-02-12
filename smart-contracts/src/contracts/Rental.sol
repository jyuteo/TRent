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
        END
    }

    //--All fees unit are in gwei--//

    address public itemContract;
    uint256 public rentPerDay;

    RentalStatus public rentalStatus;
    address public renterUserContractAddress;
    address payable public renterAddress;
    uint256 public renterDeposit;
    uint256 public start;
    uint256 public end;
    string public renterProofOfReturn; // IPFS

    uint256 public rentalFees;
    uint256 public rentalFeesPaid;

    address payable public ownerAddress;
    uint256 public ownerDeposit;
    string public ownerProofOfTransfer; // IPFS

    uint256 public renterCreateRentalContractTimestamp;
    uint256 public ownerUploadProofOfTransferTimestamp;
    uint256 public renterPayRentalTimestamp;
    uint256 public renterUploadProofOfReturnTimestamp;
    uint256 public ownerClaimRentalFeesTimestamp;

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
        address _renterUserContractAddress,
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
        renterUserContractAddress = _renterUserContractAddress;
        renterAddress = _renterAddress;
        renterDeposit = _renterDeposit;
        start = _start;
        end = _end;

        rentalFees = _rentalFees;

        renterCreateRentalContractTimestamp = block.timestamp;
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
        string memory _ownerProofOfTransfer,
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

        ownerUploadProofOfTransferTimestamp = block.timestamp;

        emit itemRented(itemContract, renterAddress, ownerAddress);
    }

    function uploadRenterProofOfReturn(string memory _renterProofOfReturn)
        public
        onlyRenter
    {
        require(
            rentalFeesPaid >= rentalFees,
            "Rental fees have to be paid before returning"
        );

        renterProofOfReturn = _renterProofOfReturn;
        rentalStatus = RentalStatus.RETURNED;

        renterUploadProofOfReturnTimestamp = block.timestamp;

        emit itemReturned(itemContract, renterAddress, ownerAddress);
    }

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
        require(
            rentalStatus == RentalStatus.RENTED,
            "Invalid rental status for method"
        );

        renterPayRentalTimestamp = block.timestamp;

        rentalFeesPaid += _amount;
    }

    // owner gets back deposit and receives rental fees paid, renter gets back deposit
    function settleDeposit() public onlyOwner {
        require(
            rentalStatus == RentalStatus.RETURNED &&
                rentalFeesPaid >= rentalFees,
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

        ownerClaimRentalFeesTimestamp = block.timestamp;

        emit rentalEnded(itemContract, address(this));
    }

    function settleRentalAfterFiveLateDays() public payable onlyOwner {
        require(
            rentalStatus == RentalStatus.RENTED,
            "Unable to settle rental with current rental status"
        );
        // change item status
        Item item = Item(itemContract);
        item.changeItemStatus(2); // DELETED
        // transfer all balance in the contract to owner
        ownerAddress.transfer(address(this).balance);
        // set renter as dishonest user
        User user = User(renterUserContractAddress);
        user.setAsDishonest();
        rentalStatus = RentalStatus.END;

        ownerClaimRentalFeesTimestamp = block.timestamp;
    }
}
