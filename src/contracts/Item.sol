// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./helpers/Utils.sol";

contract Item {
    Utils utils = new Utils();

    enum ItemStatus {
        AVAILABLE,
        HIDDEN,
        DELETED
    }

    struct ItemDetails {
        address owner;
        string name;
        string collectionOrReturnAddress;
        string description;
        uint256 rentPerDay;
        uint8 maxAllowableLateDays;
        bool isAvailableForRent;
        address[] mediaIPFSHashes;
    }

    struct RentalStartEnd {
        uint256 start; // Unix epoch time
        uint256 end; // Unix epoch time
    }

    address public owner;
    ItemDetails public itemDetails;
    ItemStatus public itemStatus;

    address[] public rentalContracts;
    uint8 public rentalContractCount;
    RentalStartEnd[] public rentalPeriods;

    address[] public renters;
    uint8 public renterCount;
    mapping(address => bool) public isRenter;

    event itemOwnerChanged(address item, address newOwner);
    event itemStatusChanged(address item, ItemStatus newStatus);
    event itemDetailsChanged(address item, string property, string newDetails);

    constructor(ItemDetails memory _itemDetails) {
        itemDetails = _itemDetails;
        owner = itemDetails.owner;

        if (itemDetails.isAvailableForRent) {
            itemStatus = ItemStatus.AVAILABLE;
        } else {
            itemStatus = ItemStatus.HIDDEN;
        }

        rentalContractCount = 0;
        renterCount = 0;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier onlyRenters() {
        require(isRenter[msg.sender]);
        _;
    }

    function changeOwner(address _newOwner) public onlyOwner {
        itemDetails.owner = _newOwner;
        owner = _newOwner;

        emit itemOwnerChanged(address(this), _newOwner);
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

    function changeItemName(string memory _newName) public onlyOwner {
        itemDetails.name = _newName;
        emit itemDetailsChanged(address(this), "name", _newName);
    }

    function changeItemCollectionOrReturnAddress(string memory _newAddress)
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

    function changeItemDescription(string memory _newDescription)
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

    function changeItemMediaIPFSHashes(address[] memory _newMediaIPFSHashes)
        public
        onlyOwner
    {
        itemDetails.mediaIPFSHashes = _newMediaIPFSHashes;
        string memory newMediaIPFSHashes = "";
        for (uint256 i = 0; i < _newMediaIPFSHashes.length; i++) {
            newMediaIPFSHashes = string(
                abi.encodePacked(
                    newMediaIPFSHashes,
                    ", ",
                    // abi.encodePacked(_newMediaIPFSHashes[i])
                    utils.address2str(_newMediaIPFSHashes[i])
                )
            );
        }
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
}
