// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./User.sol";
import "./Item.sol";
import "./Rental.sol";

contract ContractFactory {
    address public admin;

    address[] public userContracts;
    uint256 public userCount;

    address[] public itemContracts;
    uint256 public itemCount;

    // map Item contract to a list of Rental contracts of the item
    mapping(address => address[]) public rentalContractsForItem;
    mapping(address => uint8) public rentalContractCountForItem;

    // map user address to User contract
    mapping(address => address) public userContractForUser;

    mapping(address => bool) public hasItemContract;

    event adminChanged(address newAdminAddress);
    event userContractCreated(address userAddress, address userContract);
    event itemContractCreated(address itemOwnerAddress, address itemContract);
    event rentalContractCreated(
        address rentalContract,
        address itemContract,
        address renterAddress,
        address ownerAddress
    );

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Method is restricted to Admin");
        _;
    }

    modifier notItemOwner(address itemOwnerAddress) {
        require(
            msg.sender != itemOwnerAddress,
            "Method is not available for item Owner"
        );
        _;
    }

    function setAdmin(address _newAdmin) public onlyAdmin {
        admin = _newAdmin;

        emit adminChanged(admin);
    }

    function getRentalContractsForItem(address _item)
        public
        view
        returns (address[] memory)
    {
        return rentalContractsForItem[_item];
    }

    function getUserContractForUser(address _userAddress)
        public
        view
        returns (address)
    {
        return userContractForUser[_userAddress];
    }

    function hasUserContract(address _userAddress) public view returns (bool) {
        if (userContractForUser[_userAddress] == address(0x0)) {
            return false;
        } else {
            return true;
        }
    }

    function createUserContractForNewUser(
        address _userAddress,
        string calldata _username,
        string calldata _deliveryAddress
    ) public {
        require(
            hasUserContract(_userAddress) == false,
            "User address already exists"
        );
        require(
            _userAddress == msg.sender,
            "Users can only create new account with their own address"
        );

        User newUserContract = new User(
            _userAddress,
            _username,
            _deliveryAddress
        );
        userContracts.push(address(newUserContract));
        userContractForUser[_userAddress] = address(newUserContract);
        userCount++;

        emit userContractCreated(_userAddress, address(newUserContract));
    }

    function createItemContract(Item.ItemDetails calldata _itemDetails) public {
        require(
            _itemDetails.ownerAddress == msg.sender,
            "Method is restricted to item Owner"
        );
        Item newItemContract = new Item(_itemDetails);
        itemContracts.push(address(newItemContract));
        hasItemContract[address(newItemContract)] = true;
        itemCount++;

        rentalContractCountForItem[address(newItemContract)] = 0;

        emit itemContractCreated(msg.sender, address(newItemContract));
    }

    function createRentalContract(
        address _itemContract,
        address _renterUserContract,
        address payable _renterAddress,
        uint256 _rentalFees,
        uint256 _renterDeposit,
        uint256 _start,
        uint256 _end,
        uint8 _numInstallment
    ) public payable {
        Item item = Item(_itemContract);
        require(
            msg.sender != item.ownerAddress(),
            "Method is not applicable for item Owner"
        );
        Rental newRentalContract = new Rental(
            address(item),
            _renterUserContract,
            _renterAddress,
            _rentalFees,
            _renterDeposit,
            _start,
            _end,
            _numInstallment
        );

        uint8 rentalContractIndex = rentalContractCountForItem[(address(item))];
        rentalContractsForItem[address(item)][rentalContractIndex] = address(
            newRentalContract
        );
        rentalContractCountForItem[address(item)]++;

        emit rentalContractCreated(
            address(newRentalContract),
            address(item),
            _renterAddress,
            item.ownerAddress()
        );
    }
}
