// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./User.sol";
import "./Item.sol";
import "./helpers/Utils.sol";
import "./helpers/Structs.sol";

contract Rental2 {
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

    // enum DisputeType {
    //     FakeOwnerProof,
    //     FakeRenterProof,
    //     ItemDamaged
    // }

    // struct Dispute {
    //     string title;
    //     string description;
    //     string[] mediaIPFSHashes;
    //     uint256 compensationAmount; // a value less than owner deposit and renter deposit
    //     uint256 totalIncentive; // user has to pay the amount of incentive as deposit when open a dispute
    //     uint256 startTime;
    //     uint256 approvalCount;
    //     mapping(uint256 => address payable) approversList;
    //     mapping(address => bool) isApprover;
    //     uint256 rejectionCount;
    //     mapping(uint256 => address payable) rejectersList;
    //     mapping(address => bool) isRejecter;
    //     address payable creator;
    //     DisputeType disputeType;
    // }

    //--All fees unit are in gwei--//

    address private itemContract;
    uint256 private rentPerDay;
    uint8 private maxAllowableLateDays;
    uint8 private multipleForLateFees;

    RentalStatus private rentalStatus;
    address payable public renterAddress;
    address public renterUserContract;
    uint256 private renterDeposit;
    uint256 private start;
    uint256 private end;
    string[] private renterProofOfReturn; // IPFS hashes

    uint256 private rentalFees;
    uint256 private paidRentalFees;
    uint256 private remainingRentalFees;
    uint256 private claimableRentalFees;
    uint256 private claimedRentalFees;
    uint8 private numInstallment;
    uint8 private remainingNumInstallment;

    address payable public ownerAddress;
    uint256 private ownerDeposit;
    string[] private ownerProofOfTransfer; // IPFS hashes

    // mapping(uint8 => Dispute) public disputes;
    // uint8 public disputeCount;
    // uint8 public disputePeriod = 3; // dispute will last for 3 days

    event itemRented(
        address itemContract,
        address renterAddress,
        address ownerAddress,
        uint256 ownerDepositInGwei,
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
        uint256 lateFeesInGwei
    );

    constructor(
        address _itemContract,
        Structs.ItemDetails memory _itemDetails,
        address _renterUserContract,
        address payable _renterAddress,
        uint256 _rentalFees,
        uint256 _renterDeposit,
        uint256 _start,
        uint256 _end,
        uint8 _numInstallment
    ) payable {
        require(
            msg.value == Utils.gweiToWei(_renterDeposit),
            "Value transfered is less than required amount from rental contract"
        );

        itemContract = _itemContract;
        rentPerDay = _itemDetails.rentPerDay;
        maxAllowableLateDays = _itemDetails.maxAllowableLateDays;
        multipleForLateFees = _itemDetails.multipleForLateFees;
        ownerAddress = _itemDetails.ownerAddress;

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
            require(Utils.gweiToWei(_amount) == remainingRentalFees);
        }
        _;
    }

    // modifier validVoter(Dispute storage _dispute) {
    //     require(
    //         msg.sender != ownerAddress,
    //         "Owner is not eligible to vote for disputes"
    //     );
    //     require(
    //         msg.sender != renterAddress,
    //         "Renter is not eligible to vote for disputes"
    //     );
    //     require(
    //         !_dispute.isApprover[msg.sender],
    //         "User has already voted for this dispute"
    //     );
    //     require(
    //         !_dispute.isRejecter[msg.sender],
    //         "User has already voted for this dispute"
    //     );
    //     _;
    // }

    // modifier onlyDisputeCreator(Dispute storage _dispute) {
    //     require(
    //         msg.sender == _dispute.creator,
    //         "Only dispute creater can resolve dispute"
    //     );
    //     _;
    // }

    function getRenterAddress() public view returns (address) {
        return renterAddress;
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function uploadOwnerProofOfTransferAndPayDeposit(
        string[] memory _ownerProofOfTransfer,
        uint256 _ownerDeposit
    ) public payable onlyOwner {
        require(
            msg.value == Utils.gweiToWei(_ownerDeposit),
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
            "All fees have to be paid before returning"
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
            msg.value == Utils.gweiToWei(_amount),
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

        ownerAddress.transfer(Utils.gweiToWei(claimableRentalFees));
        claimedRentalFees += claimableRentalFees;
        claimableRentalFees = 0;
    }

    // claim owner's deposit and return renter's deposit
    function settleDeposit() public onlyOwner {
        require(
            rentalStatus == RentalStatus.RETURNED ||
                rentalStatus == RentalStatus.OWNERDISPUTE ||
                rentalStatus == RentalStatus.RENTERDISPUTE,
            "Unable to claim payment with current rental status"
        );
        require(
            ownerDeposit > 0 || renterDeposit > 0,
            "No remaining deposit to claim"
        );
        require(
            (rentalStatus == RentalStatus.RETURNED &&
                remainingRentalFees == 0) ||
                rentalStatus == RentalStatus.OWNERDISPUTE ||
                rentalStatus == RentalStatus.RENTERDISPUTE,
            "Rental fees has not been fully settled by renter"
        );
        require(
            (paidRentalFees == rentalFees &&
                rentalStatus == RentalStatus.RETURNED) ||
                rentalStatus == RentalStatus.OWNERDISPUTE ||
                rentalStatus == RentalStatus.RENTERDISPUTE
        );
        require(
            (claimedRentalFees == rentalFees &&
                rentalStatus == RentalStatus.RETURNED) ||
                rentalStatus == RentalStatus.OWNERDISPUTE ||
                rentalStatus == RentalStatus.RENTERDISPUTE,
            "Rental fees has not been fully claimed by owner"
        );

        if (rentalStatus == RentalStatus.OWNERDISPUTE) {
            // owner gets all deposit if renter is dishonest
            ownerAddress.transfer(Utils.gweiToWei(ownerDeposit));
            ownerAddress.transfer(Utils.gweiToWei(renterDeposit));
        } else if (rentalStatus == RentalStatus.RENTERDISPUTE) {
            // renter gets all deposit if owner is dishonest
            renterAddress.transfer(Utils.gweiToWei(ownerDeposit));
            renterAddress.transfer(Utils.gweiToWei(renterDeposit));
        } else {
            ownerAddress.transfer(Utils.gweiToWei(ownerDeposit));
            renterAddress.transfer(Utils.gweiToWei(renterDeposit));
        }

        assert(address(this).balance == 0);
        rentalStatus = RentalStatus.END;

        emit rentalEnded(itemContract, address(this));
    }

    function payLateFees(uint256 _lateFees) public payable onlyRenter {
        require(
            block.timestamp > end,
            "Unable to pay late fees before rental end date"
        );
        require(
            Utils.getDaysBetween(end, block.timestamp) <= maxAllowableLateDays,
            "Unable to pay late fees later than maximum allowable late days"
        );
        require(
            msg.value == Utils.gweiToWei(_lateFees),
            "Value transfered is not euqal to required amount"
        );

        emit lateFeesPaid(
            itemContract,
            address(this),
            renterUserContract,
            _lateFees
        );
    }

    function setUserAsDishonest(address _userAddress) public {
        require(
            _userAddress == renterAddress || _userAddress == ownerAddress,
            "Invalid user to be set as dishonest"
        );
        User user = User(_userAddress);
        user.setAsDishonest();
    }

    function settleRentalAfterFiveLateDays() public payable onlyOwner {
        require(
            block.timestamp > end + (maxAllowableLateDays * 24 * 60 * 60),
            "Unable to settle rental before maximum allowable late days"
        );
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
        setUserAsDishonest(renterAddress);

        rentalStatus = RentalStatus.END;
    }

    // // status == returned: if owner thinks that prove of return is fake
    // // or if owner thinks that item is damaged
    // function createOwnerDispute(
    //     string memory _title,
    //     string memory _description,
    //     string[] memory _mediaIPFSHashes,
    //     uint256 _compensationAmount,
    //     uint256 _totalIncentive,
    //     DisputeType _disputeType
    // ) public payable onlyOwner {
    //     require(
    //         msg.value == Utils.gweiToWei(_totalIncentive),
    //         "Value transfered not equal to required amount"
    //     );
    //     require(
    //         rentalStatus == RentalStatus.RETURNED,
    //         "Unable to create dispute with current rental status"
    //     );
    //     require(
    //         _compensationAmount < renterDeposit,
    //         "Compensation requested by owner must be lower than renter's deposit"
    //     );
    //     require(
    //         _disputeType == DisputeType.FakeRenterProof ||
    //             _disputeType == DisputeType.ItemDamaged,
    //         "Invalid distpute type"
    //     );

    //     rentalStatus = RentalStatus.OWNERDISPUTE;

    //     Dispute storage newDispute = disputes[disputeCount];
    //     newDispute.title = _title;
    //     newDispute.description = _description;
    //     newDispute.mediaIPFSHashes = _mediaIPFSHashes;
    //     newDispute.compensationAmount = _compensationAmount;
    //     newDispute.totalIncentive = _totalIncentive;
    //     newDispute.startTime = block.timestamp;
    //     newDispute.approvalCount = 0;
    //     newDispute.rejectionCount = 0;
    //     newDispute.creator = payable(msg.sender);
    //     newDispute.disputeType == _disputeType;

    //     disputeCount++;
    // }

    // // status == rented: if renter thinks that prove of transfer is fake
    // function createRenterDispute(
    //     string memory _title,
    //     string memory _description,
    //     string[] memory _mediaIPFSHashes,
    //     uint256 _compensationAmount,
    //     uint256 _totalIncentive,
    //     DisputeType _disputeType
    // ) public payable onlyRenter {
    //     require(
    //         msg.value == Utils.gweiToWei(_totalIncentive),
    //         "Value transfered not equal to required amount"
    //     );
    //     require(
    //         rentalStatus == RentalStatus.RENTED,
    //         "Unable to create dispute with current rental status"
    //     );
    //     require(
    //         _compensationAmount < ownerDeposit,
    //         "Compensation requested by renter must be lower than owner's deposit"
    //     );
    //     require(
    //         _disputeType == DisputeType.FakeOwnerProof,
    //         "Invalid dispute type"
    //     );

    //     rentalStatus = RentalStatus.RENTERDISPUTE;

    //     Dispute storage newDispute = disputes[disputeCount];
    //     newDispute.title = _title;
    //     newDispute.description = _description;
    //     newDispute.mediaIPFSHashes = _mediaIPFSHashes;
    //     newDispute.compensationAmount = _compensationAmount;
    //     newDispute.totalIncentive = _totalIncentive;
    //     newDispute.startTime = block.timestamp;
    //     newDispute.approvalCount = 0;
    //     newDispute.rejectionCount = 0;
    //     newDispute.creator = payable(msg.sender);
    //     newDispute.disputeType = _disputeType;

    //     disputeCount++;
    // }

    // function approveDispute(uint8 _disputeIndex)
    //     public
    //     validVoter(disputes[_disputeIndex])
    // {
    //     Dispute storage dispute = disputes[_disputeIndex];

    //     dispute.approversList[dispute.approvalCount] = payable(msg.sender);
    //     dispute.isApprover[msg.sender] = true;
    //     dispute.approvalCount++;
    // }

    // function rejectDispute(uint8 _disputeIndex)
    //     public
    //     validVoter(disputes[_disputeIndex])
    // {
    //     Dispute storage dispute = disputes[_disputeIndex];

    //     dispute.rejectersList[dispute.rejectionCount] = payable(msg.sender);
    //     dispute.isRejecter[msg.sender] = true;
    //     dispute.rejectionCount++;
    // }

    // function resolveDispute(uint8 _disputeIndex)
    //     public
    //     payable
    //     onlyDisputeCreator(disputes[_disputeIndex])
    // {
    //     require(
    //         rentalStatus == RentalStatus.OWNERDISPUTE ||
    //             rentalStatus == RentalStatus.RENTERDISPUTE,
    //         "Unable to resolve dispute with current rental status"
    //     );
    //     Dispute storage dispute = disputes[_disputeIndex];
    //     require(
    //         block.timestamp >= dispute.startTime + disputePeriod * 24 * 60 * 60
    //     );

    //     uint256 remainingIncentive = dispute.totalIncentive;
    //     uint256 paidIncentive = 0;

    //     // if dispute is approved
    //     if (
    //         dispute.approvalCount >
    //         ((dispute.approvalCount + dispute.rejectionCount) / 10) * 6
    //     ) {
    //         // pay incentive to voters who accepted the dispute
    //         for (uint256 i; i < dispute.approvalCount; i++) {
    //             uint256 payoutIncentive = calculatePayoutIncentive(
    //                 remainingIncentive
    //             );
    //             dispute.approversList[i].transfer(
    //                 Utils.gweiToWei(payoutIncentive)
    //             );
    //             paidIncentive = paidIncentive + payoutIncentive;
    //             remainingIncentive = remainingIncentive - payoutIncentive;
    //         }

    //         // pay compensation to dispute creator with the other party's deposit
    //         dispute.creator.transfer(
    //             Utils.gweiToWei(dispute.compensationAmount)
    //         );
    //         if (dispute.creator == renterAddress) {
    //             ownerDeposit = ownerDeposit - dispute.compensationAmount;
    //         } else {
    //             renterDeposit = renterDeposit - dispute.compensationAmount;
    //         }

    //         // set dishonest user
    //         if (dispute.disputeType == DisputeType.FakeOwnerProof) {
    //             setUserAsDishonest(ownerAddress);
    //         } else if (dispute.disputeType == DisputeType.FakeRenterProof) {
    //             setUserAsDishonest(renterAddress);
    //         }

    //         settleDeposit();
    //     }
    //     // if dispute is rejected
    //     else {
    //         // pay incentive to voters who rejected the dispute
    //         for (uint256 i; i < dispute.rejectionCount; i++) {
    //             uint256 payoutIncentive = calculatePayoutIncentive(
    //                 remainingIncentive
    //             );
    //             dispute.rejectersList[i].transfer(
    //                 Utils.gweiToWei(payoutIncentive)
    //             );
    //             paidIncentive = paidIncentive + payoutIncentive;
    //             remainingIncentive = remainingIncentive - payoutIncentive;
    //         }
    //     }

    //     // return remaining incentive to dispute creator
    //     assert(remainingIncentive == dispute.totalIncentive - paidIncentive);
    //     dispute.creator.transfer(Utils.gweiToWei(remainingIncentive));

    //     if (dispute.disputeType == DisputeType.FakeOwnerProof) {
    //         rentalStatus = RentalStatus.RENTED;
    //     } else if (dispute.disputeType == DisputeType.FakeRenterProof) {
    //         rentalStatus = RentalStatus.RETURNED;
    //     } else if (dispute.disputeType == DisputeType.ItemDamaged) {
    //         settleDeposit();
    //     }
    // }

    // // ----------------------------------helpers-------------------------------------//
    // // first person who votes correctly will get 5% of the remaining incentive
    // function calculatePayoutIncentive(uint256 _incentive)
    //     internal
    //     pure
    //     returns (uint256)
    // {
    //     return (_incentive / 100) * 5;
    // }
}
