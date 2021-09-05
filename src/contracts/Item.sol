// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./helpers/Utils.sol";
import "./User.sol";

// import "./helpers/Structs.sol";

contract Item {
    Utils utils = new Utils();

    enum ItemStatus {
        AVAILABLE,
        HIDDEN,
        DELETED
    }

    struct ItemDetails {
        address ownerUserContract;
        address payable ownerAddress;
        string name;
        string collectionOrReturnAddress;
        string description;
        uint256 rentPerDay; // in Wei
        uint8 maxAllowableLateDays;
        uint8 multipleForLateFees;
        bool isAvailableForRent;
        string[] mediaIPFSHashes;
    }

    struct RentalStartEnd {
        uint256 start; // Unix epoch time
        uint256 end; // Unix epoch time
    }

    address public ownerUserContract;
    address public ownerAddress;
    ItemDetails public itemDetails;
    ItemStatus public itemStatus;

    address[] public rentalContracts;
    uint8 public rentalContractCount;
    RentalStartEnd[] public rentalPeriods;

    address[] public renters;
    uint8 public renterCount;
    mapping(address => bool) public isRenter;

    User.Review[] public itemReviews;
    uint8 public itemReviewCount;

    event itemOwnerChanged(
        address item,
        address newOwnerUserContract,
        address newOwnerAddress
    );
    event itemStatusChanged(address item, ItemStatus newStatus);
    event itemDetailsChanged(address item, string property, string newDetails);

    constructor(ItemDetails memory _itemDetails) {
        itemDetails = _itemDetails;
        ownerUserContract = itemDetails.ownerUserContract;
        ownerAddress = itemDetails.ownerAddress;

        if (itemDetails.isAvailableForRent) {
            itemStatus = ItemStatus.AVAILABLE;
        } else {
            itemStatus = ItemStatus.HIDDEN;
        }

        rentalContractCount = 0;
        renterCount = 0;
        itemReviewCount = 0;
    }

    modifier onlyOwner() {
        require(msg.sender == ownerAddress);
        _;
    }

    modifier onlyRenters() {
        require(isRenter[msg.sender]);
        _;
    }

    function changeOwner(
        address _newOwnerUserContract,
        address payable _newOwnerAddress
    ) public onlyOwner {
        itemDetails.ownerUserContract = _newOwnerUserContract;
        itemDetails.ownerAddress = _newOwnerAddress;
        ownerUserContract = _newOwnerUserContract;
        ownerAddress = _newOwnerAddress;

        emit itemOwnerChanged(
            address(this),
            _newOwnerUserContract,
            _newOwnerAddress
        );
    }

    function changeItemStatus(uint8 _newStatus) public onlyOwner {
        if (_newStatus == 0) {
            itemDetails.isAvailableForRent = true;
            itemStatus = ItemStatus.AVAILABLE;
        } else if (_newStatus == 1) {
            itemDetails.isAvailableForRent = false;
            itemStatus = ItemStatus.HIDDEN;
        } else if (_newStatus == 2) {
            itemDetails.isAvailableForRent = false;
            itemStatus = ItemStatus.DELETED;
        }

        emit itemStatusChanged(address(this), itemStatus);
    }

    function changeItemName(string calldata _newName) public onlyOwner {
        itemDetails.name = _newName;
        emit itemDetailsChanged(address(this), "name", _newName);
    }

    function changeItemCollectionOrReturnAddress(string calldata _newAddress)
        public
        onlyOwner
    {
        itemDetails.collectionOrReturnAddress = _newAddress;
        emit itemDetailsChanged(
            address(this),
            "collection/returnAddress",
            _newAddress
        );
    }

    function changeItemDescription(string calldata _newDescription)
        public
        onlyOwner
    {
        itemDetails.description = _newDescription;
        emit itemDetailsChanged(address(this), "description", _newDescription);
    }

    function changeItemRentPerDay(uint256 _newRentPerDay) public onlyOwner {
        itemDetails.rentPerDay = _newRentPerDay;
        string memory newRentPerDay = utils.uint2str(_newRentPerDay);
        emit itemDetailsChanged(
            address(this),
            "rentPerDay",
            string(newRentPerDay)
        );
    }

    function changeItemMaxAllowableLateDays(uint8 _newMaxAllowableLateDays)
        public
        onlyOwner
    {
        itemDetails.maxAllowableLateDays = _newMaxAllowableLateDays;
        string memory newMaxAllowableLateDays = utils.uint2str(
            _newMaxAllowableLateDays
        );
        emit itemDetailsChanged(
            address(this),
            "maxAllowableLateDays",
            newMaxAllowableLateDays
        );
    }

    function changeItemMediaIPFSHashes(string[] memory _newMediaIPFSHashes)
        public
        onlyOwner
    {
        itemDetails.mediaIPFSHashes = _newMediaIPFSHashes;
        string memory newMediaIPFSHashes = "newMediaHashes";

        emit itemDetailsChanged(
            address(this),
            "mediaIPFSHashes",
            newMediaIPFSHashes
        );
    }

    function addNewRenter(address _renter) public {
        renters.push(_renter);
        renterCount++;
        isRenter[_renter] = true;
    }

    function handleNewRental(
        address _newRentalContract,
        uint256 _start,
        uint256 _end
    ) public onlyRenters {
        rentalContracts.push(_newRentalContract);
        rentalContractCount++;
        rentalPeriods.push(RentalStartEnd({start: _start, end: _end}));
    }

    function getItemDetails() public view returns (ItemDetails memory) {
        return itemDetails;
    }

    function addItemReview(User.Review memory _review) public onlyRenters {
        itemReviews.push(_review);
        itemReviewCount++;
    }
}
