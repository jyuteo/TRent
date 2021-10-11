// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

// import "./Item.sol";
import "./Rental.sol";

contract User {
    enum Role {
        OWNER,
        RENTER
    }

    struct RentalHistory {
        address itemContract; // address of the deployed smart contract for the item
        address rentalContract; // address of the deployed rental contract
        Role role;
        bool hasRated; // rate the opposite role in the contact
        uint256 start; // Unix epoch time
        uint256 end; // Unix epoch time
    }

    struct Review {
        address itemContract;
        address rentalContract;
        address raterUserContract;
        uint8 rate;
        string review;
        Role role; // role of the rater
        uint256 time;
    }

    mapping(address => uint8) public rentalIndexInRentalHistory;

    address public userAddress;
    string public username;
    string public deliveryAddress;

    RentalHistory[] public rentalHistories;
    uint8 public rentalHistoryCount;
    Review[] public reviews;
    uint8 public reviewCount;
    uint8 public lendingCount;
    uint8 public borrowingCount;
    bool public isDishonestUser;

    event usernameChanged(address indexed userAddress, string newUsername);
    event deliveryAddressChanged(
        address indexed userAddress,
        string newDeliveryAddress
    );
    event newReviewInput(address indexed from, uint8 rate, uint8 reviewCount);

    constructor(
        address _userAddress,
        string memory _username,
        string memory _deliveryAddress
    ) {
        userAddress = _userAddress;
        username = _username;
        deliveryAddress = _deliveryAddress;

        rentalHistoryCount = 0;
        reviewCount = 0;
        lendingCount = 0;
        borrowingCount = 0;
        isDishonestUser = false;
    }

    modifier onlyUser() {
        require(msg.sender == userAddress, "invalid user for this method");
        _;
    }

    modifier restricted() {
        require(msg.sender != userAddress, "invalid user for this method");
        _;
    }

    function getUserAddress() public view returns (address) {
        return userAddress;
    }

    function getDeliveryAddress() public view returns (string memory) {
        return deliveryAddress;
    }

    function getUsername() public view returns (string memory) {
        return username;
    }

    function changeUsername(string calldata _newUsername) public onlyUser {
        username = _newUsername;
        emit usernameChanged(msg.sender, _newUsername);
    }

    function changeDeliveryAddress(string calldata _newDeliveryAddress)
        public
        onlyUser
    {
        deliveryAddress = _newDeliveryAddress;
        emit deliveryAddressChanged(msg.sender, _newDeliveryAddress);
    }

    function setRentalHisotryHasRated(uint8 _index) public {
        RentalHistory storage history = rentalHistories[_index];
        history.hasRated = true;
    }

    // lending: user is owner
    function addNewLending(
        address _item,
        address _rental,
        uint256 _start,
        uint256 _end
    ) public {
        RentalHistory memory history = RentalHistory({
            itemContract: _item,
            rentalContract: _rental,
            role: Role.OWNER,
            hasRated: false,
            start: _start,
            end: _end
        });

        lendingCount++;
        rentalHistories.push(history);
        rentalIndexInRentalHistory[_item] = rentalHistoryCount;
        rentalHistoryCount++;
    }

    // borrowing: user is renter
    function addNewBorrowing(
        address _item,
        address _rental,
        uint256 _start,
        uint256 _end
    ) public {
        RentalHistory memory history = RentalHistory({
            itemContract: _item,
            rentalContract: _rental,
            role: Role.RENTER,
            hasRated: false,
            start: _start,
            end: _end
        });

        borrowingCount++;
        rentalHistories.push(history);
        rentalIndexInRentalHistory[_item] = rentalHistoryCount;
        rentalHistoryCount++;
    }

    function inputReview(
        address _item,
        address _rentalContract,
        address _raterUserContract,
        uint8 _rate,
        string calldata _review,
        Role _role // role of rater
    ) public restricted {
        // Item item = Item(_item);
        User rater = User(_raterUserContract);
        // Rental rental = Rental(_rentalContract);
        uint8 rentalIndexOfRater = rater.rentalIndexInRentalHistory(_item);
        rater.setRentalHisotryHasRated(rentalIndexOfRater);

        Review memory newReview = Review({
            itemContract: _item,
            rentalContract: _rentalContract,
            rate: _rate,
            raterUserContract: _raterUserContract,
            review: _review,
            role: _role,
            time: block.timestamp
        });

        reviews.push(newReview);
        reviewCount++;

        // if (_role == Role.RENTER) {
        //     item.addItemReview(newReview);
        // }

        emit newReviewInput(rater.userAddress(), _rate, reviewCount);
    }

    function getRatingsSum() public view returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < reviewCount; i++) {
            sum += reviews[i].rate;
        }
        return sum;
    }

    function setAsDishonest() public {
        isDishonestUser = true;
    }
}
