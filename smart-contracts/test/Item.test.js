import { expect } from "chai";
import { EVM_REVERT } from "./helpers/helpers.js";

require("chai").use(require("chai-as-promised")).should();
const ItemContractCreator = artifacts.require("ItemContractCreator");
const UserContractCreator = artifacts.require("UserContractCreator");
const RentalContractCreator = artifacts.require("RentalContractCreator");
const Item = artifacts.require("Item");
const User = artifacts.require("User");
const Rental = artifacts.require("Rental");
const DateTime = artifacts.require("DateTime");
const truffleAssert = require("truffle-assertions");

const { accounts } = require("@openzeppelin/test-environment");
const [ownerContractAddress, rentalContractAddress] = accounts;

contract("Item contract", ([deployer, owner, renter]) => {
  let itemContractCreator, item, itemContractAddress, itemDetails;

  beforeEach(async () => {
    itemContractCreator = await ItemContractCreator.new({ from: deployer });

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

    // create new User contract of user1
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

    item = await Item.at(itemContractAddress);
  });

  describe("Owner", async () => {
    it("should have correct owner", async () => {
      expect(await item.ownerUserContract()).to.be.equal(ownerContractAddress);
      expect(await item.ownerAddress()).to.be.equal(owner);
    });

    it("should allow owner to change item details", async () => {
      const newItemName = "newItemName";
      const response = await item.changeItemName(newItemName, {
        from: owner,
      });
      const newItemDetails = await item.itemDetails();
      expect(newItemDetails.name).to.be.equal(newItemName);

      truffleAssert.eventEmitted(response, "itemDetailsChanged", (ev) => {
        return (
          ev.item === itemContractAddress &&
          ev.property === "name" &&
          ev.newDetails === newItemName
        );
      });
    });

    it("should not allow others to change item details", async () => {
      const newItemDescription = "newItemDescription";
      await item
        .changeItemDescription(newItemDescription, { from: renter })
        .should.be.rejectedWith(EVM_REVERT); //invalid user
    });
  });

  describe("Rental", async () => {
    let datetime;
    it("should be able to handle new rental", async () => {
      expect(Number(await item.rentalContractCount())).to.eq(0);

      datetime = await DateTime.new();
      const start = await datetime.toTimestamp(2021, 8, 16);
      const end = await datetime.toTimestamp(2021, 8, 20);

      await item.handleNewRental(rentalContractAddress, start, end, renter, {
        from: renter,
      });
      expect(await item.rentalContracts(0)).to.be.equal(rentalContractAddress);
      expect(Number(await item.rentalContractCount())).to.eq(1);

      const rentalPeriod = await item.rentalPeriods(0);
      expect(Number(rentalPeriod.start)).to.eq(Number(start));
      expect(Number(rentalPeriod.end)).to.eq(Number(end));
    });
  });

  describe("Input rating", async () => {
    let userContractCreator,
      renterContractAddress,
      rentalContractCreator,
      rentalContractAddress;

    beforeEach(async () => {
      userContractCreator = await UserContractCreator.new({ from: deployer });
      rentalContractCreator = await RentalContractCreator.new({
        from: deployer,
      });

      await userContractCreator.createUserContract(
        renter,
        "renterUsername",
        "renterDeliveryAddress",
        {
          from: renter,
        }
      );

      renterContractAddress = await userContractCreator.userContractForUser(
        renter
      );

      // renter = await User.at(renterContractAddress)

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
    });

    it("should allow renter to rate item", async () => {
      let reviewCount = await item.reviewCount();
      expect(Number(reviewCount)).to.eq(0);

      let rate = 5;
      let review = "testReview";

      const response = await item.inputReview(
        rentalContractAddress,
        renterContractAddress,
        rate,
        review,
        { from: renter }
      );

      truffleAssert.eventEmitted(response, "newReviewInput", (ev) => {
        return (
          ev.from === renterContractAddress &&
          Number(ev.rate) === rate &&
          Number(ev.reviewCount) === 1
        );
      });

      // correct rating added
      reviewCount = await item.reviewCount();
      expect(Number(reviewCount)).to.eq(1);

      let newReview = await item.reviews(reviewCount - 1);
      expect(Number(newReview.rate)).to.eq(rate);
      expect(newReview.raterUserContract).to.be.equal(renterContractAddress);
      expect(newReview.rentalContract).to.be.equal(rentalContractAddress);
      expect(newReview.review).to.be.equal(review);
    });

    it("should not allow non renter to rate item", async () => {
      let rate = 5;
      let review = "testReview";

      await item
        .inputReview(
          rentalContractAddress,
          renterContractAddress,
          rate,
          review,
          { from: owner }
        )
        .should.be.rejectedWith(EVM_REVERT);
    });
  });
});
