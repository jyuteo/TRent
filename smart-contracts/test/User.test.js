import { EVM_REVERT } from "./helpers/helpers.js";

require("chai").use(require("chai-as-promised")).should();
const UserContractCreator = artifacts.require("UserContractCreator");
const User = artifacts.require("User");
const DateTime = artifacts.require("DateTime");
const truffleAssert = require("truffle-assertions");

const { accounts } = require("@openzeppelin/test-environment");
const [
  rentalContractAddress,
  itemContractAddress,
  ownerUserContract,
  renterUserContract,
  // anotherItemContractAddress,
  // anotherRentalContractAddress,
] = accounts;

contract("User contract", ([deployer, user1, user2, raterAddress]) => {
  let userContractCreator, user, datetime;
  let username = "testUsername";
  let deliveryAddress = "testAddress";

  beforeEach(async () => {
    userContractCreator = await UserContractCreator.new({ from: deployer });

    // create new User contract of user1
    await userContractCreator.createUserContract(
      user1,
      username,
      deliveryAddress,
      {
        from: user1,
      }
    );

    let user1ContractAddress = await userContractCreator.userContractForUser(
      user1
    );

    user = await User.at(user1ContractAddress);
  });

  describe("Constructor", async () => {
    it("should have correct userAddress", async () => {
      expect(await user.getUserAddress()).to.be.equal(user1);
    });

    it("should have correct username", async () => {
      expect(await user.getUsername()).to.be.equal(username);
    });

    it("should have correct deliveryAddress", async () => {
      expect(await user.getDeliveryAddress()).to.be.equal(deliveryAddress);
    });
  });

  describe("Profile", async () => {
    it("should let user to change his/her own username", async () => {
      let newUsername = "newUsername";
      const response = await user.changeUsername(newUsername, {
        from: user1,
      });
      expect(await user.getUsername()).to.be.equal(newUsername);
      truffleAssert.eventEmitted(response, "usernameChanged", (ev) => {
        return ev.userAddress === user1 && ev.newUsername === newUsername;
      });
    });

    it("should not let anyone else to change username", async () => {
      let newUsername = "newUsername";
      await user
        .changeUsername(newUsername, {
          from: user2,
        })
        .should.be.rejectedWith(EVM_REVERT); //invalid user
      expect(await user.getUsername()).to.be.equal(username);
    });

    it("should let user to change his/her own delivery address", async () => {
      let newDeliveryAddress = "newDeliveryAddress";
      const response = await user.changeDeliveryAddress(newDeliveryAddress, {
        from: user1,
      });
      expect(await user.getDeliveryAddress()).to.be.equal(newDeliveryAddress);
      truffleAssert.eventEmitted(response, "deliveryAddressChanged", (ev) => {
        return (
          ev.userAddress === user1 &&
          ev.newDeliveryAddress === newDeliveryAddress
        );
      });
    });

    it("should not let anyone else to change delivery address", async () => {
      let newDeliveryAddress = "newDeliveryAddress";
      await user
        .changeDeliveryAddress(newDeliveryAddress, {
          from: user2,
        })
        .should.be.rejectedWith(EVM_REVERT); //invalid user
      expect(await user.getDeliveryAddress()).to.be.equal(deliveryAddress);
    });
  });

  describe("Rental history", async () => {
    beforeEach(async () => {
      datetime = await DateTime.new();
    });

    it("can add new lending to rental histories", async () => {
      // no rental history in the beginning
      expect(Number(await user.lendingCount())).to.eq(0);
      expect(Number(await user.rentalHistoryCount())).to.eq(0);

      let start = (await datetime.toTimestamp(2021, 8, 16)) * 1000;
      let end = (await datetime.toTimestamp(2021, 8, 21)) * 1000;

      await user.addNewLending(
        itemContractAddress,
        rentalContractAddress,
        ownerUserContract,
        renterUserContract,
        start,
        end
      );

      // increase lending history count correctly
      expect(Number(await user.lendingCount())).to.eq(1);
      expect(Number(await user.rentalHistoryCount())).to.eq(1);
      expect(
        Number(await user.rentalIndexInRentalHistory(itemContractAddress))
      ).to.eq(0);

      // add lending to rental history correctly
      let firstLendingHistory = await user.rentalHistories(0);
      expect(firstLendingHistory.itemContract).to.be.equal(itemContractAddress);
      expect(firstLendingHistory.rentalContract).to.be.equal(
        rentalContractAddress
      );
      expect(firstLendingHistory.role.toString()).to.be.equal("0"); // Role.OWNER
      expect(firstLendingHistory.hasRated).to.be.equal(false);
      expect(Number(firstLendingHistory.start)).to.eq(Number(start));
      expect(Number(firstLendingHistory.end)).to.eq(Number(end));
    });

    it("can add new borrowing to rental histories", async () => {
      // no rental history in the beginning
      expect(Number(await user.borrowingCount())).to.eq(0);
      expect(Number(await user.rentalHistoryCount())).to.eq(0);

      let start = (await datetime.toTimestamp(2021, 8, 16)) * 1000;
      let end = (await datetime.toTimestamp(2021, 8, 21)) * 1000;

      await user.addNewBorrowing(
        itemContractAddress,
        rentalContractAddress,
        ownerUserContract,
        renterUserContract,
        start,
        end
      );

      // increase lending history count correctly
      expect(Number(await user.borrowingCount())).to.eq(1);
      expect(Number(await user.rentalHistoryCount())).to.eq(1);
      expect(
        Number(await user.rentalIndexInRentalHistory(itemContractAddress))
      ).to.eq(0);

      // add lending to rental history correctly
      let firstBorrowingHistory = await user.rentalHistories(0);
      expect(firstBorrowingHistory.itemContract).to.be.equal(
        itemContractAddress
      );
      expect(firstBorrowingHistory.rentalContract).to.be.equal(
        rentalContractAddress
      );
      expect(firstBorrowingHistory.role.toString()).to.be.equal("1"); // Role.RENTER
      expect(firstBorrowingHistory.hasRated).to.be.equal(false);
      expect(Number(firstBorrowingHistory.start)).to.eq(Number(start));
      expect(Number(firstBorrowingHistory.end)).to.eq(Number(end));
    });
  });
});
