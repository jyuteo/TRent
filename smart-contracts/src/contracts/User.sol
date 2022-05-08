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
        address ownerUserContract;
        address renterUserContract;
        Role role; // 0 for owner, 1 for renter
        bool hasRated; // rate the opposite role in the contact
        uint256 start; // Unix epoch time
        uint256 end; // Unix epoch time
    }

    mapping(address => uint128) public rentalIndexInRentalHistory;

    address public userAddress;
    string public username;
    string public deliveryAddress;

    RentalHistory[] public rentalHistories;
    uint128 public rentalHistoryCount;
    uint128 public lendingCount;
    uint128 public borrowingCount;
    bool public isDishonestUser;

    event usernameChanged(address indexed userAddress, string newUsername);
    event deliveryAddressChanged(
        address indexed userAddress,
        string newDeliveryAddress
    );

    constructor(
        address _userAddress,
        string memory _username,
        string memory _deliveryAddress
    ) {
        userAddress = _userAddress;
        username = _username;
        deliveryAddress = _deliveryAddress;

        rentalHistoryCount = 0;
        lendingCount = 0;
        borrowingCount = 0;
        isDishonestUser = false;
    }

    modifier onlyUser() {
        require(msg.sender == userAddress, "invalid user for this method");
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
        address _ownerUserContract,
        address _renterUserContract,
        uint256 _start,
        uint256 _end
    ) public {
        RentalHistory memory history = RentalHistory({
            itemContract: _item,
            rentalContract: _rental,
            ownerUserContract: _ownerUserContract,
            renterUserContract: _renterUserContract,
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
        address _ownerUserContract,
        address _renterUserContract,
        uint256 _start,
        uint256 _end
    ) public {
        RentalHistory memory history = RentalHistory({
            itemContract: _item,
            rentalContract: _rental,
            ownerUserContract: _ownerUserContract,
            renterUserContract: _renterUserContract,
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

    function setAsDishonest() public {
        isDishonestUser = true;
    }
}
