import { expect } from "chai";
import { EVM_REVERT, waitDays } from "./helpers/helpers.js";

require("chai").use(require("chai-as-promised")).should();
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
const truffleAssert = require("truffle-assertions");

const User = artifacts.require("User");
const Item = artifacts.require("Item");
const Rental = artifacts.require("Rental");
const UserContractCreator = artifacts.require("UserContractCreator");
const ItemContractCreator = artifacts.require("ItemContractCreator");
const RentalContractCreator = artifacts.require("RentalContractCreator");

contract("Rental contract", ([deployer, ownerAddress, renterAddress]) => {
  let userContractCreator,
    owner,
    renter,
    ownerContractAddress,
    renterContractAddress,
    itemDetails,
    itemContractCreator,
    item,
    itemContractAddress,
    rentalContractCreator,
    rental,
    rentalContractAddress;

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
    let ownerContractAddress = await userContractCreator.userContractForUser(
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
    let renterContractAddress = await userContractCreator.userContractForUser(
      renterAddress
    );
    renter = await User.at(renterContractAddress);

    // create Item contract
    let itemDetails = {
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
    const itemResponse = await itemContractCreator.createItemContract(
      itemDetails,
      {
        from: ownerAddress,
      }
    );
    truffleAssert.eventEmitted(itemResponse, "itemContractCreated", (ev) => {
      itemContractAddress = ev.itemContract;
      return (
        ev.itemOwnerAddress === ownerAddress &&
        ev.itemContract === itemContractAddress
      );
    });
    item = await Item.at(itemContractAddress);

    // create Rental contract
    const rentalResponse = await rentalContractCreator.createRentalContract(
      itemContractAddress,
      itemDetails,
      renterContractAddress,
      renterAddress,
      11000000,
      200,
      1633442907,
      1634030272,
      {
        from: renterAddress,
        gas: 6000000,
        gasPrice: 20,
        value: 200000000000,
      }
    );
    truffleAssert.eventEmitted(
      rentalResponse,
      "rentalContractCreated",
      (ev) => {
        rentalContractAddress = ev.rentalContract;
        return (
          ev.itemContract === itemContractAddress &&
          ev.renterAddress === renterAddress &&
          ev.rentalContract === rentalContractAddress
        );
      }
    );
    rental = await Rental.at(rentalContractAddress);
  });

  describe("Owner", async () => {
    it("should allow owner to upload proof of transfer and pay owner deposit", async () => {
      // rental status == CREATED before owner uploads proof
      expect(Number(await rental.rentalStatus())).to.eq(0);

      // Rental contract only has renter deposit currently
      expect(Number(await web3.eth.getBalance(rental.address))).to.eq(
        200000000000
      );

      let ownerProofOfTransfer = ["ownerPoof1"];
      let ownerDeposit = 200; // gwei

      // upload proof and pay deposit
      const ownerUploadProofResponse =
        await rental.uploadOwnerProofOfTransferAndPayDeposit(
          ownerProofOfTransfer,
          ownerDeposit,
          { from: ownerAddress, value: 200000000000 }
        );

      truffleAssert.eventEmitted(
        ownerUploadProofResponse,
        "itemRented",
        (ev) => {
          return (
            ev.itemContract === itemContractAddress &&
            ev.renterAddress === renterAddress &&
            ev.ownerAddress === ownerAddress
          );
        }
      );

      // rental status == RENTED after owner uploads proof and pay deposit
      expect(Number(await rental.rentalStatus())).to.eq(1);

      // Rental contract has both renter deposit and owner deposit now
      expect(Number(await web3.eth.getBalance(rental.address))).to.eq(
        400000000000
      );
    });

    it("should not allow others to upload owner proof of transfer and pay owner deposit", async () => {
      // rental status == CREATED before owner uploads proof
      expect(Number(await rental.rentalStatus())).to.eq(0);

      // Rental contract only has renter deposit currently
      expect(Number(await web3.eth.getBalance(rental.address))).to.eq(
        200000000000
      );

      let ownerProofOfTransfer = ["ownerPoof1"];
      let ownerDeposit = 200; // gwei

      // upload proof and pay deposit
      await rental
        .uploadOwnerProofOfTransferAndPayDeposit(
          ownerProofOfTransfer,
          ownerDeposit,
          { from: renterAddress, value: 200000000000 }
        )
        .should.be.rejectedWith(EVM_REVERT); // invalid user address
    });

    it("should not allow owner to upload owner proof of transfer if msg.value != required owner deposit", async () => {
      // rental status == CREATED before owner uploads proof
      expect(Number(await rental.rentalStatus())).to.eq(0);

      // Rental contract only has renter deposit currently
      expect(Number(await web3.eth.getBalance(rental.address))).to.eq(
        200000000000
      );

      let ownerProofOfTransfer = ["ownerPoof1"];
      let ownerDeposit = 200; // gwei

      // upload proof and pay deposit
      await rental
        .uploadOwnerProofOfTransferAndPayDeposit(
          ownerProofOfTransfer,
          ownerDeposit,
          { from: ownerAddress }
        )
        .should.be.rejectedWith(EVM_REVERT); // msg.value != owner deposit
    });
  });

  describe("Renter", async () => {
    it("should allow renter to upload proof of return", async () => {
      // owner upload owner proof
      let ownerProofOfTransfer = ["ownerPoof1"];
      let ownerDeposit = 200; // gwei

      await rental.uploadOwnerProofOfTransferAndPayDeposit(
        ownerProofOfTransfer,
        ownerDeposit,
        { from: ownerAddress, value: 200000000000 }
      );

      // pay rental fees before upload proof
      await rental.payRentalIncludingLateFees(11000000, {
        from: renterAddress,
        value: web3.utils.toWei("0.011", "ether"),
      });

      expect(Number(await rental.rentalFeesPaid())).to.be.greaterThanOrEqual(
        Number(await rental.rentalFees())
      );

      // rental status == RENTED before renter uploads proof
      expect(Number(await rental.rentalStatus())).to.eq(1);

      let renterProofOfReturn = ["renterPoof1"];

      // upload proof of return
      const renterUploadProofReturn = await rental.uploadRenterProofOfReturn(
        renterProofOfReturn,
        { from: renterAddress }
      );

      truffleAssert.eventEmitted(
        renterUploadProofReturn,
        "itemReturned",
        (ev) => {
          return (
            ev.itemContract === itemContractAddress &&
            ev.renterAddress === renterAddress &&
            ev.ownerAddress === ownerAddress
          );
        }
      );

      // rental status == RETURNED after return uploads proof of return
      expect(Number(await rental.rentalStatus())).to.eq(2);
    });

    it("should not allow others to upload renter proof of return", async () => {
      // owner upload owner proof
      let ownerProofOfTransfer = ["ownerPoof1"];
      let ownerDeposit = 200; // gwei

      await rental.uploadOwnerProofOfTransferAndPayDeposit(
        ownerProofOfTransfer,
        ownerDeposit,
        { from: ownerAddress, value: 200000000000 }
      );

      // pay rental fees before upload proof
      await rental.payRentalIncludingLateFees(11000000, {
        from: renterAddress,
        value: web3.utils.toWei("0.011", "ether"),
      });

      expect(Number(await rental.rentalFeesPaid())).to.be.greaterThanOrEqual(
        Number(await rental.rentalFees())
      );

      // rental status == RENTED before renter uploads proof
      expect(Number(await rental.rentalStatus())).to.eq(1);

      let renterProofOfReturn = ["renterPoof1"];

      // upload proof of return
      await rental
        .uploadRenterProofOfReturn(renterProofOfReturn, { from: ownerAddress })
        .should.be.rejectedWith(EVM_REVERT); // invalid user address
    });
  });

  describe("Pay rental fees including late fees", async () => {
    it("should allow renter to pay rental fees and late fees", async () => {
      // owner upload owner proof
      let ownerProofOfTransfer = ["ownerPoof1"];
      let ownerDeposit = 200; // gwei

      await rental.uploadOwnerProofOfTransferAndPayDeposit(
        ownerProofOfTransfer,
        ownerDeposit,
        { from: ownerAddress, value: 200000000000 }
      );

      // rental status == RENTED before renter pays rental fees
      expect(Number(await rental.rentalStatus())).to.eq(1);

      // pay rental fees
      await rental.payRentalIncludingLateFees(11000000, {
        from: renterAddress,
        value: web3.utils.toWei("0.011", "ether"),
      });

      expect(Number(await rental.rentalFeesPaid())).to.eq(11000000);

      expect(Number(await rental.rentalFeesPaid())).to.be.greaterThanOrEqual(
        Number(await rental.rentalFees())
      );
    });

    it("should not allow renter to pay rental fees if rental status != RENTED", async () => {
      // rental status == CREATED
      expect(Number(await rental.rentalStatus())).to.eq(0);

      // pay rental fees
      await rental
        .payRentalIncludingLateFees(11000000, {
          from: renterAddress,
          value: web3.utils.toWei("0.011", "ether"),
        })
        .should.be.rejectedWith(EVM_REVERT); // invalid rental status
    });

    it("should not allow renter to pay rental fees if msg.value != amount specified", async () => {
      // owner upload owner proof
      let ownerProofOfTransfer = ["ownerPoof1"];
      let ownerDeposit = 200; // gwei

      await rental.uploadOwnerProofOfTransferAndPayDeposit(
        ownerProofOfTransfer,
        ownerDeposit,
        { from: ownerAddress, value: 200000000000 }
      );

      // rental status == RENTED before renter pays rental fees
      expect(Number(await rental.rentalStatus())).to.eq(1);

      // pay rental fees
      await rental
        .payRentalIncludingLateFees(11000000, {
          from: renterAddress,
          value: web3.utils.toWei("0.012", "ether"),
        })
        .should.be.rejectedWith(EVM_REVERT); // msg.value != specified amount
    });

    it("should not allow renter to pay rental fees if msg.value < rental fees", async () => {
      // owner upload owner proof
      let ownerProofOfTransfer = ["ownerPoof1"];
      let ownerDeposit = 200; // gwei

      await rental.uploadOwnerProofOfTransferAndPayDeposit(
        ownerProofOfTransfer,
        ownerDeposit,
        { from: ownerAddress, value: 200000000000 }
      );

      // rental status == RENTED before renter pays rental fees
      expect(Number(await rental.rentalStatus())).to.eq(1);

      // pay rental fees
      await rental
        .payRentalIncludingLateFees(11000000, {
          from: renterAddress,
          value: web3.utils.toWei("0.010", "ether"),
        })
        .should.be.rejectedWith(EVM_REVERT); // msg.value < rental fees
    });
  });

  describe("Settle deposit", async () => {
    it("should allow owner to settle owner deposit and renter deposit", async () => {
      // owner upload owner proof
      let ownerProofOfTransfer = ["ownerPoof1"];
      let ownerDeposit = 200; // gwei

      await rental.uploadOwnerProofOfTransferAndPayDeposit(
        ownerProofOfTransfer,
        ownerDeposit,
        { from: ownerAddress, value: 200000000000 }
      );

      // rental status == RENTED before renter pays rental fees
      expect(Number(await rental.rentalStatus())).to.eq(1);

      // pay rental fees
      await rental.payRentalIncludingLateFees(11000000, {
        from: renterAddress,
        value: web3.utils.toWei("0.011", "ether"),
      });

      // renter uploads proof of return
      let renterProofOfReturn = ["renterPoof1"];
      await rental.uploadRenterProofOfReturn(renterProofOfReturn, {
        from: renterAddress,
      });

      // rental status == RETURNED before owner settles deposit
      expect(Number(await rental.rentalStatus())).to.eq(2);

      let ownerInitialBalance = await web3.eth.getBalance(ownerAddress);
      let renterInitialBalance = await web3.eth.getBalance(renterAddress);
      // console.log('owner balance before settle deposit', ownerInitialBalance)

      // settle deposit
      const settleDepositResponse = await rental.settleDeposit({
        from: ownerAddress,
      });

      truffleAssert.eventEmitted(settleDepositResponse, "rentalEnded", (ev) => {
        return (
          ev.itemContract === itemContractAddress &&
          ev.rentalContract === rentalContractAddress
        );
      });

      // renter gets back renter deposit
      let ownerFinalBalance = await web3.eth.getBalance(ownerAddress);
      let renterFinalBalance = await web3.eth.getBalance(renterAddress);
      expect(Number(ownerFinalBalance)).to.be.greaterThan(
        Number(ownerInitialBalance)
      );
      expect(Number(renterFinalBalance)).to.be.greaterThan(
        Number(renterInitialBalance)
      );

      // Rental contract has 0 balance
      expect(Number(await web3.eth.getBalance(rental.address))).to.eq(0);

      // rental status == ENDED after owner settled deposit
      expect(Number(await rental.rentalStatus())).to.eq(3);
    });

    it("should not allow others to settle owner deposit and renter deposit", async () => {
      // owner upload owner proof
      let ownerProofOfTransfer = ["ownerPoof1"];
      let ownerDeposit = 200; // gwei

      await rental.uploadOwnerProofOfTransferAndPayDeposit(
        ownerProofOfTransfer,
        ownerDeposit,
        { from: ownerAddress, value: 200000000000 }
      );

      // rental status == RENTED before renter pays rental fees
      expect(Number(await rental.rentalStatus())).to.eq(1);

      // pay rental fees
      await rental.payRentalIncludingLateFees(11000000, {
        from: renterAddress,
        value: web3.utils.toWei("0.011", "ether"),
      });

      // renter uploads proof of return
      let renterProofOfReturn = ["renterPoof1"];
      await rental.uploadRenterProofOfReturn(renterProofOfReturn, {
        from: renterAddress,
      });

      // rental status == RETURNED before owner settles deposit
      expect(Number(await rental.rentalStatus())).to.eq(2);

      // settle deposit
      await rental
        .settleDeposit({
          from: renterAddress,
        })
        .should.be.rejectedWith(EVM_REVERT); // invalid user
    });
  });

  describe("Settle rental after 5 late days", async () => {
    it("should allow owner to settle rental after 5 late days", async () => {
      // owner upload owner proof
      let ownerProofOfTransfer = ["ownerPoof1"];
      let ownerDeposit = 10000000; // gwei

      await rental.uploadOwnerProofOfTransferAndPayDeposit(
        ownerProofOfTransfer,
        ownerDeposit,
        { from: ownerAddress, value: web3.utils.toWei("0.01", "ether") }
      );

      // rental status == RENTED
      expect(Number(await rental.rentalStatus())).to.eq(1);

      let ownerInitialBalance = await web3.eth.getBalance(ownerAddress);
      expect(await renter.isDishonestUser()).to.be.equal(false);

      await rental.settleRentalAfterFiveLateDays({ from: ownerAddress });

      let ownerFinalBalance = await web3.eth.getBalance(ownerAddress);
      // owner gets back owner deposit and renter deposit
      expect(Number(ownerFinalBalance)).to.be.greaterThan(
        Number(ownerInitialBalance)
      );

      // rental status == END
      expect(Number(await rental.rentalStatus())).to.eq(3);

      // 0 contract balance
      expect(Number(await web3.eth.getBalance(rental.address))).to.eq(0);

      // item status == DELETED will be reflected on Item contract
      expect(Number(await item.itemStatus())).to.eq(2);

      // renter is set as dishonest on renter User contract
      expect(await renter.isDishonestUser()).to.be.equal(true);
    });

    it("should not allow owner to settle rental if rental status != RENTED", async () => {
      // rental status == CREATED
      expect(Number(await rental.rentalStatus())).to.eq(0);

      await rental
        .settleRentalAfterFiveLateDays({ from: ownerAddress })
        .should.be.rejectedWith(EVM_REVERT); // rental status != RENTED
    });
  });
});
