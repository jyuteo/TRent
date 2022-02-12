import { expect } from "chai";
import { EVM_REVERT } from "./helpers/helpers.js";

require("chai").use(require("chai-as-promised")).should();
const User = artifacts.require("User");
const Item = artifacts.require("Item");
const Rental = artifacts.require("Rental");
const UserContractCreator = artifacts.require("UserContractCreator");
const ItemContractCreator = artifacts.require("ItemContractCreator");
const RentalContractCreator = artifacts.require("RentalContractCreator");
const truffleAssert = require("truffle-assertions");

const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));

contract("RentalContractCreator", ([deployer, ownerAddress, renterAddress]) => {
  let item,
    itemDetails,
    itemContractCreator,
    itemContractAddress,
    rental,
    rentalContractCreator,
    rentalContractAddress,
    userContractCreator,
    owner,
    ownerContractAddress,
    renter,
    renterContractAddress;

  beforeEach(async () => {
    userContractCreator = await UserContractCreator.new({ from: deployer });
    itemContractCreator = await ItemContractCreator.new({ from: deployer });
    rentalContractCreator = await RentalContractCreator.new({ from: deployer });

    // create User contract for owner
    await userContractCreator.createUserContract(
      ownerAddress,
      "owner",
      "ownerDeliveryAddress",
      {
        from: ownerAddress,
      }
    );
    ownerContractAddress = await userContractCreator.userContractForUser(
      ownerAddress
    );
    owner = await User.at(ownerContractAddress);

    // create User contract for renter
    await userContractCreator.createUserContract(
      renterAddress,
      "renter",
      "renterDeliveryAddress",
      {
        from: renterAddress,
      }
    );
    renterContractAddress = await userContractCreator.userContractForUser(
      renterAddress
    );
    renter = await User.at(renterContractAddress);

    // create new Item
    itemDetails = {
      ownerUserContract: ownerContractAddress,
      ownerAddress: ownerAddress,
      name: "testItemName",
      collectionOrReturnAddress: "testCollectionAddress",
      description: "testItemDescription",
      rentPerDay: 10000000, // in gwei
      maxAllowableLateDays: 5,
      multipleForLateFees: 2,
      isAvailableForRent: true,
      imageIPFSUrl: ["a", "b"],
    };

    const res = await itemContractCreator.createItemContract(itemDetails, {
      from: ownerAddress,
    });

    // event emitted after creation of Item contract
    truffleAssert.eventEmitted(res, "itemContractCreated", (ev) => {
      itemContractAddress = ev.itemContract;
      return (
        ev.itemOwnerAddress === ownerAddress &&
        ev.itemContract === itemContractAddress
      );
    });
  });

  it("can create Rental contract for item", async () => {
    // no existing rental before creating
    expect(Number(await rentalContractCreator.rentalContractCount())).to.eq(0);

    // no rental history for owner before creating
    expect(Number(await owner.rentalHistoryCount())).to.eq(0);
    expect(Number(await owner.lendingCount())).to.eq(0);
    expect(Number(await owner.borrowingCount())).to.eq(0);

    // no rental history for renter before creating
    expect(Number(await renter.rentalHistoryCount())).to.eq(0);
    expect(Number(await renter.lendingCount())).to.eq(0);
    expect(Number(await renter.borrowingCount())).to.eq(0);

    // create new Rental contract
    const response = await rentalContractCreator.createRentalContract(
      itemContractAddress,
      itemDetails,
      renterContractAddress,
      renterAddress,
      10000,
      200,
      1633442907000,
      1633529307000,
      {
        from: renterAddress,
        gas: 6000000,
        gasPrice: 20,
        value: 200000000000,
      }
    );

    // event emitted after creation of Rental contract
    truffleAssert.eventEmitted(response, "rentalContractCreated", (ev) => {
      rentalContractAddress = ev.rentalContract;
      return (
        ev.itemContract === itemContractAddress &&
        ev.renterAddress === renterAddress &&
        ev.rentalContract === rentalContractAddress
      );
    });

    // 1 Rental contract
    var rentalCount = await rentalContractCreator.rentalContractCount();
    expect(Number(rentalCount)).to.eq(1);

    // Rental contract address is stored
    expect(
      await rentalContractCreator.rentalContracts(rentalCount - 1)
    ).to.be.equal(rentalContractAddress);

    // correct balance in Rental contract
    rental = await Rental.at(rentalContractAddress);
    expect(Number(await web3.eth.getBalance(rentalContractAddress))).to.eq(
      200000000000
    );

    // rental history updated in owner user contract (lending)
    expect(Number(await owner.rentalHistoryCount())).to.eq(1);
    expect(Number(await owner.lendingCount())).to.eq(1);
    expect(Number(await owner.borrowingCount())).to.eq(0);

    // rental history updated in renter user contract (borrowing)
    expect(Number(await renter.rentalHistoryCount())).to.eq(1);
    expect(Number(await renter.lendingCount())).to.eq(0);
    expect(Number(await renter.borrowingCount())).to.eq(1);
  });

  it("cannot create Rental contract for if msg.sender is not renter", async () => {
    // no existing rental before creating
    expect(Number(await rentalContractCreator.rentalContractCount())).to.eq(0);

    // create new Rental contract
    await rentalContractCreator
      .createRentalContract(
        itemContractAddress,
        itemDetails,
        renterContractAddress,
        renterAddress,
        10000,
        200,
        1633442907000,
        1633529307000,
        {
          from: ownerAddress,
          gas: 6000000,
          gasPrice: 20,
          value: 200000000000,
        }
      )
      .should.be.rejectedWith(EVM_REVERT); //msg.sender is item owner
  });

  it("cannot create Rental contract for if msg.value is not equal to renter deposit", async () => {
    // no existing rental before creating
    expect(Number(await rentalContractCreator.rentalContractCount())).to.eq(0);

    // create new Rental contract
    await rentalContractCreator.createRentalContract(
      itemContractAddress,
      itemDetails,
      renterContractAddress,
      renterAddress,
      10000,
      200,
      1633442907000, // 5 Oct 2021
      1633529307000, // 6 Oct 2021
      {
        from: renterAddress,
        gas: 6000000,
        gasPrice: 20,
        value: 200000000000,
      }
    );

    // create another Rental contract
    await rentalContractCreator
      .createRentalContract(
        itemContractAddress,
        itemDetails,
        renterContractAddress,
        renterAddress,
        10000,
        200,
        1633529307000, //6 Oct 2021
        1633564800000, //7 Oct 2021
        {
          from: renterAddress,
          gas: 6000000,
          gasPrice: 20,
          value: 200000000000,
        }
      )
      .should.be.rejectedWith(EVM_REVERT); //clash of rental period
  });

  it("cannot create Rental contract for if rental period is not available", async () => {
    // no existing rental before creating
    expect(Number(await rentalContractCreator.rentalContractCount())).to.eq(0);

    // create new Rental contract
    await rentalContractCreator
      .createRentalContract(
        itemContractAddress,
        itemDetails,
        renterContractAddress,
        renterAddress,
        10000,
        200,
        1633442907000,
        1633529307000,
        {
          from: ownerAddress,
          gas: 6000000,
          gasPrice: 20,
        }
      )
      .should.be.rejectedWith(EVM_REVERT); //no msg.value
  });

  it("can update new rental to Item contract", async () => {
    item = await Item.at(itemContractAddress);

    expect(Number(await item.rentalContractCount())).to.eq(0);
    expect(Number(await item.renterCount())).to.eq(0);
    expect(await item.isRenter(renterAddress)).to.eq(false);

    // create new Rental contract
    const response = await rentalContractCreator.createRentalContract(
      itemContractAddress,
      itemDetails,
      renterContractAddress,
      renterAddress,
      10000,
      200,
      1633442907000,
      1633529307000,
      {
        from: renterAddress,
        gas: 6000000,
        gasPrice: 20,
        value: 200000000000,
      }
    );
    truffleAssert.eventEmitted(response, "rentalContractCreated", (ev) => {
      rentalContractAddress = ev.rentalContract;
      return (
        ev.itemContract === itemContractAddress &&
        ev.renterAddress === renterAddress &&
        ev.rentalContract === rentalContractAddress
      );
    });

    // new rental will be reflected on Item contract
    expect(Number(await item.rentalContractCount())).to.eq(1);
    expect(Number(await item.renterCount())).to.eq(1);
    expect(await item.isRenter(renterAddress)).to.eq(true);
    expect(await item.rentalContracts(0)).to.eq(rentalContractAddress);
    expect(await item.renters(0)).to.eq(renterAddress);
  });
});
