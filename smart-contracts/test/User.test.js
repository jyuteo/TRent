import { EVM_REVERT } from './helpers/helpers.js'

require('chai').use(require('chai-as-promised')).should()
const UserContractCreator = artifacts.require('UserContractCreator')
const User = artifacts.require('User')
const DateTime = artifacts.require('DateTime')
const truffleAssert = require('truffle-assertions')

const { accounts } = require('@openzeppelin/test-environment')
const [
  rentalContractAddress,
  itemContractAddress,
  anotherItemContractAddress,
  anotherRentalContractAddress,
] = accounts

contract('User contract', ([deployer, user1, user2, raterAddress]) => {
  let userContractCreator, user, datetime
  let username = 'testUsername'
  let deliveryAddress = 'testAddress'

  beforeEach(async () => {
    userContractCreator = await UserContractCreator.new({ from: deployer })

    // create new User contract of user1
    await userContractCreator.createUserContract(
      user1,
      username,
      deliveryAddress,
      {
        from: user1,
      },
    )

    let user1ContractAddress = await userContractCreator.userContractForUser(
      user1,
    )

    user = await User.at(user1ContractAddress)
  })

  describe('Constructor', async () => {
    it('should have correct userAddress', async () => {
      expect(await user.getUserAddress()).to.be.equal(user1)
    })

    it('should have correct username', async () => {
      expect(await user.getUsername()).to.be.equal(username)
    })

    it('should have correct deliveryAddress', async () => {
      expect(await user.getDeliveryAddress()).to.be.equal(deliveryAddress)
    })
  })

  describe('Profile', async () => {
    it('should let user to change his/her own username', async () => {
      let newUsername = 'newUsername'
      const response = await user.changeUsername(newUsername, {
        from: user1,
      })
      expect(await user.getUsername()).to.be.equal(newUsername)
      truffleAssert.eventEmitted(response, 'usernameChanged', (ev) => {
        return ev.userAddress === user1 && ev.newUsername === newUsername
      })
    })

    it('should not let anyone else to change username', async () => {
      let newUsername = 'newUsername'
      await user
        .changeUsername(newUsername, {
          from: user2,
        })
        .should.be.rejectedWith(EVM_REVERT) //invalid user
      expect(await user.getUsername()).to.be.equal(username)
    })

    it('should let user to change his/her own delivery address', async () => {
      let newDeliveryAddress = 'newDeliveryAddress'
      const response = await user.changeDeliveryAddress(newDeliveryAddress, {
        from: user1,
      })
      expect(await user.getDeliveryAddress()).to.be.equal(newDeliveryAddress)
      truffleAssert.eventEmitted(response, 'deliveryAddressChanged', (ev) => {
        return (
          ev.userAddress === user1 &&
          ev.newDeliveryAddress === newDeliveryAddress
        )
      })
    })

    it('should not let anyone else to change delivery address', async () => {
      let newDeliveryAddress = 'newDeliveryAddress'
      await user
        .changeDeliveryAddress(newDeliveryAddress, {
          from: user2,
        })
        .should.be.rejectedWith(EVM_REVERT) //invalid user
      expect(await user.getDeliveryAddress()).to.be.equal(deliveryAddress)
    })
  })

  describe('Rental history', async () => {
    beforeEach(async () => {
      datetime = await DateTime.new()
    })

    it('can add new lending to rental histories', async () => {
      // no rental history in the beginning
      expect(Number(await user.lendingCount())).to.eq(0)
      expect(Number(await user.rentalHistoryCount())).to.eq(0)

      let start = await datetime.toTimestamp(2021, 8, 16)
      let end = await datetime.toTimestamp(2021, 8, 21)

      await user.addNewLending(
        itemContractAddress,
        rentalContractAddress,
        start,
        end,
      )

      // increase lending history count correctly
      expect(Number(await user.lendingCount())).to.eq(1)
      expect(Number(await user.rentalHistoryCount())).to.eq(1)
      expect(
        Number(await user.rentalIndexInRentalHistory(itemContractAddress)),
      ).to.eq(0)

      // add lending to rental history correctly
      let firstLendingHistory = await user.rentalHistories(0)
      expect(firstLendingHistory.itemContract).to.be.equal(itemContractAddress)
      expect(firstLendingHistory.rentalContract).to.be.equal(
        rentalContractAddress,
      )
      expect(firstLendingHistory.role.toString()).to.be.equal('0') // Role.OWNER
      expect(firstLendingHistory.hasRated).to.be.equal(false)
      expect(Number(firstLendingHistory.start)).to.eq(Number(start))
      expect(Number(firstLendingHistory.end)).to.eq(Number(end))
    })

    it('can add new borrowing to rental histories', async () => {
      // no rental history in the beginning
      expect(Number(await user.borrowingCount())).to.eq(0)
      expect(Number(await user.rentalHistoryCount())).to.eq(0)

      let start = await datetime.toTimestamp(2021, 8, 16)
      let end = await datetime.toTimestamp(2021, 8, 21)

      await user.addNewBorrowing(
        itemContractAddress,
        rentalContractAddress,
        start,
        end,
      )

      // increase lending history count correctly
      expect(Number(await user.borrowingCount())).to.eq(1)
      expect(Number(await user.rentalHistoryCount())).to.eq(1)
      expect(
        Number(await user.rentalIndexInRentalHistory(itemContractAddress)),
      ).to.eq(0)

      // add lending to rental history correctly
      let firstBorrowingHistory = await user.rentalHistories(0)
      expect(firstBorrowingHistory.itemContract).to.be.equal(
        itemContractAddress,
      )
      expect(firstBorrowingHistory.rentalContract).to.be.equal(
        rentalContractAddress,
      )
      expect(firstBorrowingHistory.role.toString()).to.be.equal('1') // Role.RENTER
      expect(firstBorrowingHistory.hasRated).to.be.equal(false)
      expect(Number(firstBorrowingHistory.start)).to.eq(Number(start))
      expect(Number(firstBorrowingHistory.end)).to.eq(Number(end))
    })
  })

  describe('Input rating', async () => {
    let raterContractAddress, rater

    beforeEach(async () => {
      datetime = await DateTime.new()

      await userContractCreator.createUserContract(
        raterAddress,
        'raterUsername',
        'raterDeliveryAddress',
        {
          from: raterAddress,
        },
      )

      raterContractAddress = await userContractCreator.userContractForUser(
        raterAddress,
      )

      rater = await User.at(raterContractAddress)
    })

    it('should allow others to rate user', async () => {
      // Add 1 previous rental history (lending) for rater
      let start1 = await datetime.toTimestamp(2021, 8, 1)
      let end1 = await datetime.toTimestamp(2021, 8, 2)

      await rater.addNewLending(
        anotherItemContractAddress,
        anotherRentalContractAddress,
        start1,
        end1,
      )

      // Add 1 lending history for user
      let start2 = await datetime.toTimestamp(2021, 8, 16)
      let end2 = await datetime.toTimestamp(2021, 8, 21)

      await user.addNewLending(
        itemContractAddress,
        rentalContractAddress,
        start2,
        end2,
      )

      // User has 1 lending history at this stage
      expect(Number(await user.borrowingCount())).to.eq(0)
      expect(Number(await user.lendingCount())).to.eq(1)
      expect(Number(await user.rentalHistoryCount())).to.eq(1)
      expect(Number(await user.reviewCount())).to.eq(0)
      // expect(await user.borrowingCount()).to.be.bignumber.equal(new BN(0))
      // expect(await user.lendingCount()).to.be.bignumber.equal(new BN(1))
      // expect(await user.rentalHistoryCount()).to.be.bignumber.equal(new BN(1))
      // expect(await user.ratingCount()).to.be.bignumber.equal(new BN(0))

      // Add corresponding borrowing history for rater
      await rater.addNewBorrowing(
        itemContractAddress,
        rentalContractAddress,
        start2,
        end2,
      )

      // Rater has 1 lending history and 1 borrowing history at this stage
      expect(Number(await rater.borrowingCount())).to.eq(1)
      expect(Number(await rater.lendingCount())).to.eq(1)
      expect(Number(await rater.rentalHistoryCount())).to.eq(2)
      // expect(await rater.borrowingCount()).to.be.bignumber.equal(new BN(1))
      // expect(await rater.lendingCount()).to.be.bignumber.equal(new BN(1))
      // expect(await rater.rentalHistoryCount()).to.be.bignumber.equal(new BN(2))

      let rate = 5
      let review = 'testReview'
      let response = await user.inputReview(
        itemContractAddress,
        rentalContractAddress,
        raterContractAddress,
        rate,
        review,
        1, // RENTER
        { from: raterAddress },
      )

      let rentalIndexOfUser = Number(
        await user.rentalIndexInRentalHistory(itemContractAddress),
      )
      let rentalIndexOfRater = Number(
        await rater.rentalIndexInRentalHistory(itemContractAddress),
      )

      // update RentalHistory.hasRated correctly
      expect(rentalIndexOfUser).to.be.equal(0)
      expect(rentalIndexOfRater).to.be.equal(1)

      let userRentalHistory = await user.rentalHistories(rentalIndexOfUser)
      let raterRentalHistory = await rater.rentalHistories(rentalIndexOfRater)
      expect(userRentalHistory.hasRated).to.be.equal(false) // user has not rate as owner
      expect(raterRentalHistory.hasRated).to.be.equal(true) // rater has rated as a renter
      // expectEvent(response, 'newRatingInput', {
      //   from: raterAddress,
      //   rate: new BN(rate),
      //   ratingCount: new BN(1),
      // })
      truffleAssert.eventEmitted(response, 'newReviewInput', (ev) => {
        return (
          ev.from === raterAddress &&
          Number(ev.rate) === rate &&
          Number(ev.reviewCount) === 1
        )
      })

      // correct rating added
      let reviewCount = await user.reviewCount()
      expect(Number(reviewCount)).to.eq(1)

      let newReview = await user.reviews(reviewCount - 1)
      expect(newReview.itemContract).to.be.equal(itemContractAddress)
      expect(Number(newReview.rate)).to.eq(rate)
      expect(newReview.raterUserContract).to.be.equal(raterContractAddress)
      expect(newReview.rentalContract).to.be.equal(rentalContractAddress)
      expect(newReview.review).to.be.equal(review)
      expect(Number(newReview.role)).to.eq(1)
    })
  })
})
