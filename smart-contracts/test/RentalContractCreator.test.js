import { expect } from "chai";
import { EVM_REVERT } from "./helpers/helpers.js";

require("chai").use(require("chai-as-promised")).should();
const Item = artifacts.require("Item");
const Rental = artifacts.require("Rental");
const ItemContractCreator = artifacts.require("ItemContractCreator");
const RentalContractCreator = artifacts.require("RentalContractCreator");
const truffleAssert = require("truffle-assertions");

const { accounts } = require("@openzeppelin/test-environment");
const [ownerContractAddress, renterContractAddress] = accounts;

const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));

contract("RentalContractCreator", ([deployer, owner, renter]) => {
  let item,
    itemDetails,
    itemContractCreator,
    itemContractAddress,
    rental,
    rentalContractCreator,
    rentalContractAddress;

  beforeEach(async () => {
    itemContractCreator = await ItemContractCreator.new({ from: deployer });
    rentalContractCreator = await RentalContractCreator.new({ from: deployer });

    itemDetails = {
      ownerUserContract: ownerContractAddress,
      ownerAddress: owner,
      name: "testItemName",
      collectionOrReturnAddress: "testCollectionAddress",
      description: "testItemDescription",
      rentPerDay: 10000000, // in gwei
      maxAllowableLateDays: 5,
      multipleForLateFees: 2,
      isAvailableForRent: true,
      imageIPFSUrl: ["a", "b"],
    };

    // create new Item
    const res = await itemContractCreator.createItemContract(itemDetails, {
      from: owner,
    });

    // event emitted after creation of Item contract
    truffleAssert.eventEmitted(res, "itemContractCreated", (ev) => {
      itemContractAddress = ev.itemContract;
      return (
        ev.itemOwnerAddress === owner && ev.itemContract === itemContractAddress
      );
    });
  });

  it("can create Rental contract for item", async () => {
    // no existing rental before creating
    expect(Number(await rentalContractCreator.rentalContractCount())).to.eq(0);

    // create new Rental contract
    const response = await rentalContractCreator.createRentalContract(
      itemContractAddress,
      itemDetails,
      renterContractAddress,
      renter,
      10000,
      200,
      1633442907,
      1633529307,
      {
        from: renter,
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
        ev.renterAddress === renter &&
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
        renter,
        10000,
        200,
        1633442907,
        1633529307,
        {
          from: owner,
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
    await rentalContractCreator
      .createRentalContract(
        itemContractAddress,
        itemDetails,
        renterContractAddress,
        renter,
        10000,
        200,
        1633442907,
        1633529307,
        {
          from: owner,
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
    expect(await item.isRenter(renter)).to.eq(false);

    // create new Rental contract
    const response = await rentalContractCreator.createRentalContract(
      itemContractAddress,
      itemDetails,
      renterContractAddress,
      renter,
      10000,
      200,
      1633442907,
      1633529307,
      {
        from: renter,
        gas: 6000000,
        gasPrice: 20,
        value: 200000000000,
      }
    );
    truffleAssert.eventEmitted(response, "rentalContractCreated", (ev) => {
      rentalContractAddress = ev.rentalContract;
      return (
        ev.itemContract === itemContractAddress &&
        ev.renterAddress === renter &&
        ev.rentalContract === rentalContractAddress
      );
    });

    // new rental will be reflected on Item contract
    expect(Number(await item.rentalContractCount())).to.eq(1);
    expect(Number(await item.renterCount())).to.eq(1);
    expect(await item.isRenter(renter)).to.eq(true);
    expect(await item.rentalContracts(0)).to.eq(rentalContractAddress);
    expect(await item.renters(0)).to.eq(renter);
  });
});
