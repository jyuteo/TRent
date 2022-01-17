// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./helpers/Utils.sol";
import "./helpers/Structs.sol";
import "./User.sol";
import "./Rental.sol";

contract Item {
    using Utils for *;

    enum ItemStatus {
        AVAILABLE,
        HIDDEN,
        DELETED
    }

    struct RentalStartEnd {
        uint256 start; // Unix epoch time
        uint256 end; // Unix epoch time
    }

    struct Review {
        address rentalContract;
        address raterUserContract;
        uint8 rate;
        string review;
        uint256 time;
    }

    address public ownerUserContract;
    address public ownerAddress;
    Structs.ItemDetails public itemDetails;
    ItemStatus public itemStatus;

    address[] public rentalContracts;
    uint8 public rentalContractCount;
    RentalStartEnd[] public rentalPeriods;

    address[] public renters;
    uint8 public renterCount;
    mapping(address => bool) public isRenter;

    uint8 public reviewCount;
    Review[] public reviews;

    event itemOwnerChanged(
        address item,
        address newOwnerUserContract,
        address newOwnerAddress
    );
    event itemStatusChanged(address item, ItemStatus newStatus);
    event itemDetailsChanged(address item, string property, string newDetails);
    event newReviewInput(address indexed from, uint8 rate, uint8 reviewCount);

    constructor(Structs.ItemDetails memory _itemDetails) {
        itemDetails = _itemDetails;
        ownerUserContract = itemDetails.ownerUserContract;
        ownerAddress = itemDetails.ownerAddress;

        if (itemDetails.isAvailableForRent) {
            itemStatus = ItemStatus.AVAILABLE;
        } else {
            itemStatus = ItemStatus.HIDDEN;
        }

        rentalContractCount = 0;
        reviewCount = 0;
    }

    modifier onlyOwner() {
        require(msg.sender == ownerAddress, "Method is restricted to Owner");
        _;
    }

    modifier onlyRenter() {
        require(isRenter[msg.sender], "Method is restricted to Renter");
        _;
    }

    function getItemDetails() public view returns (Structs.ItemDetails memory) {
        return itemDetails;
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

    function changeItemStatus(uint8 _newStatus) public {
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
        string memory newRentPerDay = Utils.uint2str(_newRentPerDay);
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
        string memory newMaxAllowableLateDays = Utils.uint2str(
            _newMaxAllowableLateDays
        );
        emit itemDetailsChanged(
            address(this),
            "maxAllowableLateDays",
            newMaxAllowableLateDays
        );
    }

    function changeItemImageIPFSUrl(string[] memory _newimageIPFSUrl)
        public
        onlyOwner
    {
        itemDetails.imageIPFSUrl = _newimageIPFSUrl;
        string memory newImageIPFSUrl = "newImageIPFSUrl";

        emit itemDetailsChanged(address(this), "imageIPFSUrl", newImageIPFSUrl);
    }

    function handleNewRental(
        address _newRentalContract,
        uint256 _start,
        uint256 _end,
        address _renterAddress
    ) public {
        rentalContracts.push(address(_newRentalContract));
        rentalContractCount++;

        rentalPeriods.push(RentalStartEnd({start: _start, end: _end}));

        renters.push(_renterAddress);
        isRenter[_renterAddress] = true;
        renterCount++;
    }

    function inputReview(
        address _rentalContract,
        address _raterUserContract,
        uint8 _rate,
        string calldata _review
    ) public onlyRenter {
        Review memory newReview = Review({
            rentalContract: _rentalContract,
            rate: _rate,
            raterUserContract: _raterUserContract,
            review: _review,
            time: block.timestamp
        });

        reviews.push(newReview);
        reviewCount++;

        emit newReviewInput(_raterUserContract, _rate, reviewCount);
    }

    function getRatingsSum() public view returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < reviewCount; i++) {
            sum += reviews[i].rate;
        }
        return sum;
    }
}
