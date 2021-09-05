// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./Item.sol";

contract Rental {
    enum RentalStatus {
        CREATED,
        RENTED,
        RETURNED,
        END,
        OWNERDISPUTE,
        RENTERDISPUTE
    }

    struct Dispute {
        string title;
        string description;
        string[] mediaIPFSHashes;
        uint256 compensationAmount; // a value less than owner deposit and renter deposit
        uint256 totalIncentive; // user has to pay the amount of incentive as deposit when open a dispute
        uint256 startTime;
        uint256 approvalCount;
        mapping(uint256 => address payable) approversList;
        mapping(address => bool) isApprover;
        uint256 rejectionCount;
        mapping(uint256 => address payable) rejectersList;
        mapping(address => bool) isRejecter;
        address payable creator;
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

    mapping(uint8 => Dispute) public disputes;
    uint8 public disputeCount;
    uint8 public disputePeriod = 3; // dispute will last for 3 days

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

    modifier validVoter(Dispute storage _dispute) {
        require(
            msg.sender != ownerAddress,
            "Owner is not eligible to vote for disputes"
        );
        require(
            msg.sender != renterAddress,
            "Renter is not eligible to vote for disputes"
        );
        require(
            !_dispute.isApprover[msg.sender],
            "User has already voted for this dispute"
        );
        require(
            !_dispute.isRejecter[msg.sender],
            "User has already voted for this dispute"
        );
        _;
    }

    modifier onlyDisputeCreator(Dispute storage _dispute) {
        require(
            msg.sender == _dispute.creator,
            "Only dispute creater can resolve dispute"
        );
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
            rentalStatus != RentalStatus.OWNERDISPUTE,
            "Unable to claim payment with current rental status, rental status is ON OWNER DISPUTE"
        );
        require(
            rentalStatus != RentalStatus.RENTERDISPUTE,
            "Unable to claim payment with current rental status, rental status is ON RENTER DISPUTE"
        );
        require(
            rentalStatus != RentalStatus.END,
            "Unable to claim payment with current rental status, rental status is END"
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

    // status == returned: if owner thinks that prove of return is fake
    // or if owner thinks that item is damaged
    function createOwnerDispute(
        string memory _title,
        string memory _description,
        string[] memory _mediaIPFSHashes,
        uint256 _compensationAmount,
        uint256 _totalIncentive
    ) public payable onlyOwner {
        require(
            msg.value == _totalIncentive,
            "Value transfered not equal to required amount"
        );
        require(
            rentalStatus == RentalStatus.RETURNED,
            "Unable to create dispute with current rental status"
        );

        rentalStatus = RentalStatus.OWNERDISPUTE;

        Dispute storage newDispute = disputes[disputeCount];
        newDispute.title = _title;
        newDispute.description = _description;
        newDispute.mediaIPFSHashes = _mediaIPFSHashes;
        newDispute.compensationAmount = _compensationAmount;
        newDispute.totalIncentive = _totalIncentive;
        newDispute.startTime = block.timestamp;
        newDispute.approvalCount = 0;
        newDispute.rejectionCount = 0;
        newDispute.creator = payable(msg.sender);

        disputeCount++;
    }

    // status == rented: if renter thinks that prove of transfer is fake
    function createRenterDispute(
        string memory _title,
        string memory _description,
        string[] memory _mediaIPFSHashes,
        uint256 _compensationAmount,
        uint256 _totalIncentive
    ) public payable onlyRenter {
        require(
            msg.value == _totalIncentive,
            "Value transfered not equal to required amount"
        );
        require(
            rentalStatus == RentalStatus.RENTED,
            "Unable to create dispute with current rental status"
        );

        rentalStatus = RentalStatus.RENTERDISPUTE;

        Dispute storage newDispute = disputes[disputeCount];
        newDispute.title = _title;
        newDispute.description = _description;
        newDispute.mediaIPFSHashes = _mediaIPFSHashes;
        newDispute.compensationAmount = _compensationAmount;
        newDispute.totalIncentive = _totalIncentive;
        newDispute.startTime = block.timestamp;
        newDispute.approvalCount = 0;
        newDispute.rejectionCount = 0;
        newDispute.creator = payable(msg.sender);

        disputeCount++;
    }

    function approveDispute(uint8 _disputeIndex)
        public
        validVoter(disputes[_disputeIndex])
    {
        Dispute storage dispute = disputes[_disputeIndex];

        dispute.approversList[dispute.approvalCount] = payable(msg.sender);
        dispute.isApprover[msg.sender] = true;
        dispute.approvalCount++;
    }

    function rejectDispute(uint8 _disputeIndex)
        public
        validVoter(disputes[_disputeIndex])
    {
        Dispute storage dispute = disputes[_disputeIndex];

        dispute.rejectersList[dispute.rejectionCount] = payable(msg.sender);
        dispute.isRejecter[msg.sender] = true;
        dispute.rejectionCount++;
    }

    function resolveDispute(uint8 _disputeIndex)
        public
        payable
        onlyDisputeCreator(disputes[_disputeIndex])
    {
        require(
            rentalStatus == RentalStatus.OWNERDISPUTE ||
                rentalStatus == RentalStatus.RENTERDISPUTE,
            "Unable to resolve dispute with current rental status"
        );
        Dispute storage dispute = disputes[_disputeIndex];
        require(
            block.timestamp >= dispute.startTime + disputePeriod * 24 * 60 * 60
        );

        uint256 remainingIncentive = dispute.totalIncentive;
        uint256 paidIncentive = 0;

        // if dispute is approved
        if (
            dispute.approvalCount >
            ((dispute.approvalCount + dispute.rejectionCount) / 10) * 6
        ) {
            // pay incentive to voters who accepted the dispute
            for (uint256 i; i < dispute.approvalCount; i++) {
                uint256 payoutIncentive = payIncentive(remainingIncentive);
                dispute.approversList[i].transfer(payoutIncentive);
                paidIncentive = paidIncentive + payoutIncentive;
                remainingIncentive = remainingIncentive - payoutIncentive;
            }
            // pay compensation to dispute creator with renter deposit
            dispute.creator.transfer(dispute.compensationAmount);
            renterDeposit = renterDeposit - dispute.compensationAmount;
        }
        // if dispute is rejected
        else {
            // pay incentive to voters who rejected the dispute
            for (uint256 i; i < dispute.rejectionCount; i++) {
                uint256 payoutIncentive = payIncentive(remainingIncentive);
                dispute.rejectersList[i].transfer(payoutIncentive);
                paidIncentive = paidIncentive + payoutIncentive;
                remainingIncentive = remainingIncentive - payoutIncentive;
            }
        }

        assert(remainingIncentive == dispute.totalIncentive - paidIncentive);
        // return remaining incentive to dispute creater
        dispute.creator.transfer(remainingIncentive);

        if (dispute.creator == renterAddress) {
            rentalStatus = RentalStatus.RENTED;
        } else if (dispute.creator == ownerAddress) {
            rentalStatus = RentalStatus.RETURNED;
        }
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

    function toWei(uint256 _ether) internal pure returns (uint256) {
        return _ether * 10**18;
    }

    function toEther(uint256 _wei) internal pure returns (uint256) {
        return _wei / 10**18;
    }

    function payIncentive(uint256 _incentive) internal pure returns (uint256) {
        return (_incentive / 100) * 5;
    }
}
