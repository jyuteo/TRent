// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract User {
    enum Role {
        OWNER,
        RENTER
    }

    struct RentalHistory {
        address item; // address of the deployed smart contract for the item
        address rental; // address of the deployed rental contract
        Role role;
        bool hasRated; // rate the opposite role in the contact
        uint256 start; // Unix epoch time
        uint256 end; // Unix epoch time
    }

    struct Rating {
        address item;
        address rater;
        uint8 rate;
        string review;
        Role role; // role of the rater
    }

    address public userAddress;
    string public username;
    string public deliveryAddress;

    RentalHistory[] public rentalHistories;
    uint8 public rentalHistoryCount;
    Rating[] public ratings;
    uint8 public ratingCount;
    uint8 public lendingCount;
    uint8 public borrowingCount;
    bool public isDishonestUser;

    event usernameChanged(address indexed userAccount, string newUsername);
    event deliveryAddressChanged(
        address indexed userAccount,
        string newDeliveryAddress
    );
    event newRatingInput(address indexed from, uint8 rate, uint8 ratingCount);

    constructor(
        address _userAddress,
        string memory _username,
        string memory _deliveryAddress
    ) {
        userAddress = _userAddress;
        username = _username;
        deliveryAddress = _deliveryAddress;

        rentalHistoryCount = 0;
        ratingCount = 0;
        lendingCount = 0;
        borrowingCount = 0;
        isDishonestUser = false;
    }

    modifier onlyUser() {
        require(msg.sender == userAddress);
        _;
    }

    modifier restricted() {
        require(msg.sender != userAddress);
        _;
    }

    // function getUserAddress() public view returns (address) {
    //     return userAddress;
    // }

    // function getUsername() public view returns (string memory) {
    //     return username;
    // }

    // function getDeliveryAddress() public view returns (string memory) {
    //     return deliveryAddress;
    // }

    function setUsername(string memory _newUsername) public onlyUser {
        username = _newUsername;
        emit usernameChanged(msg.sender, _newUsername);
    }

    function setDeliveryAddress(string memory _newDeliveryAddress)
        public
        onlyUser
    {
        deliveryAddress = _newDeliveryAddress;
        emit deliveryAddressChanged(msg.sender, _newDeliveryAddress);
    }

    function setRentalHisotryHasRated(uint8 index) public {
        RentalHistory storage history = rentalHistories[index];
        history.hasRated = true;
    }

    // lending: user is owner
    function addNewLending(
        address _item,
        address _rental,
        uint256 _start,
        uint256 _end
    ) public {
        rentalHistoryCount++;
        lendingCount++;

        RentalHistory memory history = RentalHistory({
            item: _item,
            rental: _rental,
            role: Role.OWNER,
            hasRated: false,
            start: _start,
            end: _end
        });

        rentalHistories.push(history);
    }

    // borrowing: user is renter
    function addNewBorrowing(
        address _item,
        address _rental,
        uint256 _start,
        uint256 _end
    ) public {
        rentalHistoryCount++;
        borrowingCount++;

        RentalHistory memory history = RentalHistory({
            item: _item,
            rental: _rental,
            role: Role.RENTER,
            hasRated: false,
            start: _start,
            end: _end
        });

        rentalHistories.push(history);
    }

    function inputRating(
        address _item,
        address _rater,
        uint8 _rate,
        string memory _review,
        Role _role,
        uint8 _index
    ) public restricted {
        User rater = User(_rater);
        rater.setRentalHisotryHasRated(_index);

        Rating memory newRating = Rating({
            item: _item,
            rate: _rate,
            rater: _rater,
            review: _review,
            role: _role
        });

        ratings.push(newRating);
        ratingCount++;

        emit newRatingInput(_rater, _rate, ratingCount);
    }

    function getRatingsSum() public view returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < ratingCount; i++) {
            sum += ratings[i].rate;
        }
        return sum;
    }
}
