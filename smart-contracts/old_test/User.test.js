const { accounts, contract } = require('@openzeppelin/test-environment')
const [
  userAddress,
  anotherUserAddress,
  raterAddress,
  rentalContractAddress,
  anotherRentalContractAddress,
  itemContractAddress,
  anotherItemContractAddress,
] = accounts
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
const { expect } = require('chai')

const User = contract.fromArtifact('User')
const DateTime = contract.fromArtifact('DateTime')

describe('User Contract', async () => {
  let username = 'User1'
  let deliveryAddress = 'testDeliveryAddress'

  beforeEach(async () => {
    user = await User.new(userAddress, username, deliveryAddress, {
      from: userAddress,
    })
  })

  describe('Constructor', async () => {
    it('should have correct userAddress', async () => {
      expect(await user.userAddress()).to.be.equal(userAddress)
    })

    it('should have correct username', async () => {
      expect(await user.username()).to.be.equal(username)
    })

    it('should have correct deliveryAddress', async () => {
      expect(await user.deliveryAddress()).to.be.equal(deliveryAddress)
    })
  })

  describe('Profile', async () => {
    it('should let owner to change his/her own username', async () => {
      let newUsername = 'newUsername'
      const response = await user.changeUsername(newUsername, {
        from: userAddress,
      })
      expect(await user.username()).to.be.equal(newUsername)
      expectEvent(response, 'usernameChanged', {
        userAccount: userAddress,
        newUsername: newUsername,
      })
    })

    it('should not let anyone else to change username', async () => {
      let newUsername = 'newUsername'
      await expectRevert(
        user.changeUsername(newUsername, { from: anotherUserAddress }),
        'VM Exception while processing transaction: revert',
      )
      expect(await user.username()).to.be.equal(username)
    })

    it('should let owner to change his/her own deliveryAddress', async () => {
      let newDeliveryAddress = 'newdeliveryAddress'
      const response = await user.changeDeliveryAddress(newDeliveryAddress, {
        from: userAddress,
      })
      expect(await user.deliveryAddress()).to.be.equal(newDeliveryAddress)
      expectEvent(response, 'deliveryAddressChanged', {
        userAddress: userAddress,
        newDeliveryAddress: newDeliveryAddress,
      })
    })

    it('should not let anyone else to change deliveryAddress', async () => {
      let newDeliveryAddress = 'newDeliveryAddress'
      await expectRevert(
        user.changeDeliveryAddress(newDeliveryAddress, {
          from: anotherUserAddress,
        }),
        'VM Exception while processing transaction: revert',
      )
      expect(await user.deliveryAddress()).to.be.equal(deliveryAddress)
    })
  })

  describe('Rental history', async () => {
    beforeEach(async () => {
      datetime = await DateTime.new()
    })

    it('can add new lending to rental histories', async () => {
      // no rental history in the beginning
      expect(await user.lendingCount()).to.be.bignumber.equal(new BN(0))
      expect(await user.rentalHistoryCount()).to.be.bignumber.equal(new BN(0))

      let start = await datetime.toTimestamp(2021, 8, 16)
      let end = await datetime.toTimestamp(2021, 8, 21)

      await user.addNewLending(
        itemContractAddress,
        rentalContractAddress,
        start,
        end,
      )

      // increase lending history count correctly
      expect(await user.lendingCount()).to.be.bignumber.equal(new BN(1))
      expect(await user.rentalHistoryCount()).to.be.bignumber.equal(new BN(1))
      expect(
        await user.rentalIndexInRentalHistory(itemContractAddress),
      ).to.be.bignumber.equal(new BN(0))

      // add lending to rental history correctly
      let firstLendingHistory = await user.rentalHistories(0)
      expect(firstLendingHistory.item).to.be.equal(itemContractAddress)
      expect(firstLendingHistory.rental).to.be.equal(rentalContractAddress)
      expect(firstLendingHistory.role.toString()).to.be.equal('0') // Role.OWNER
      expect(firstLendingHistory.hasRated).to.be.equal(false)
      expect(firstLendingHistory.start).to.be.bignumber.equal(new BN(start))
      expect(firstLendingHistory.end).to.be.bignumber.equal(new BN(end))
    })

    it('can add new borrowing to rental histories', async () => {
      // no rental history in the beginning
      expect(await user.borrowingCount()).to.be.bignumber.equal(new BN(0))
      expect(await user.rentalHistoryCount()).to.be.bignumber.equal(new BN(0))

      let start = await datetime.toTimestamp(2021, 8, 16)
      let end = await datetime.toTimestamp(2021, 8, 21)

      await user.addNewBorrowing(
        itemContractAddress,
        rentalContractAddress,
        start,
        end,
      )

      // increase borrowing count correctly
      expect(await user.borrowingCount()).to.be.bignumber.equal(new BN(1))
      expect(await user.rentalHistoryCount()).to.be.bignumber.equal(new BN(1))
      expect(
        await user.rentalIndexInRentalHistory(itemContractAddress),
      ).to.be.bignumber.equal(new BN(0))

      // add borrowing to rental history correctly
      let firstBorrowingHistory = await user.rentalHistories(0)
      expect(firstBorrowingHistory.item).to.be.equal(itemContractAddress)
      expect(firstBorrowingHistory.rental).to.be.equal(rentalContractAddress)
      expect(firstBorrowingHistory.role.toString()).to.be.equal('1') //Role.RENTER
      expect(firstBorrowingHistory.hasRated).to.be.equal(false)
      expect(firstBorrowingHistory.start).to.be.bignumber.equal(new BN(start))
      expect(firstBorrowingHistory.end).to.be.bignumber.equal(new BN(end))
    })
  })

  describe('Input rating', async () => {
    beforeEach(async () => {
      datetime = await DateTime.new()
      rater = await User.new(
        raterAddress,
        'raterUsername',
        'raterDeliveryAddress',
        { from: raterAddress },
      )
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
      expect(await user.borrowingCount()).to.be.bignumber.equal(new BN(0))
      expect(await user.lendingCount()).to.be.bignumber.equal(new BN(1))
      expect(await user.rentalHistoryCount()).to.be.bignumber.equal(new BN(1))
      expect(await user.ratingCount()).to.be.bignumber.equal(new BN(0))

      // Add corresponding borrowing history for rater
      await rater.addNewBorrowing(
        itemContractAddress,
        rentalContractAddress,
        start2,
        end2,
      )

      // Rater has 1 lending history and 1 borrowing history at this stage
      expect(await rater.borrowingCount()).to.be.bignumber.equal(new BN(1))
      expect(await rater.lendingCount()).to.be.bignumber.equal(new BN(1))
      expect(await rater.rentalHistoryCount()).to.be.bignumber.equal(new BN(2))

      let rate = 5
      let review = 'testReview'
      let response = await user.inputRating(
        itemContractAddress,
        rater.address,
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
      let raterRrentalHistory = await rater.rentalHistories(rentalIndexOfRater)
      expect(userRentalHistory.hasRated).to.be.equal(false)
      expect(raterRrentalHistory.hasRated).to.be.equal(true)
      expectEvent(response, 'newRatingInput', {
        from: raterAddress,
        rate: new BN(rate),
        ratingCount: new BN(1),
      })

      // correct rating added
      let ratingCount = await user.ratingCount()
      expect(ratingCount).to.be.bignumber.equal(new BN(1))

      let newRating = await user.ratings(ratingCount - 1)
      expect(newRating.item).to.be.equal(itemContractAddress)
      expect(newRating.rate).to.be.bignumber.equal(new BN(rate))
      expect(newRating.rater).to.be.equal(await rater.userAddress())
      expect(newRating.review).to.be.equal(review)
      expect(newRating.role).to.be.bignumber.equal(new BN(1))
    })

    it('should not let user to rate him/herself', async () => {
      let rate = 5
      let review = 'testReview'
      await expectRevert(
        user.inputRating(itemContractAddress, rater.address, rate, review, 1, {
          from: userAddress,
        }),
        'VM Exception while processing transaction: revert',
      )
    })

    it('should sum up all ratings correctly', async () => {
      // Add mock lending history for rater (rater borrows from user)
      let start1 = await datetime.toTimestamp(2021, 8, 1)
      let end1 = await datetime.toTimestamp(2021, 8, 2)

      await rater.addNewLending(
        itemContractAddress,
        rentalContractAddress,
        start1,
        end1,
      )

      // Add mock borowing history for rater (rater lends to user)
      let start2 = await datetime.toTimestamp(2021, 8, 16)
      let end2 = await datetime.toTimestamp(2021, 8, 21)

      await rater.addNewBorrowing(
        anotherItemContractAddress,
        anotherRentalContractAddress,
        start2,
        end2,
      )

      // Rater has 1 lending history and 1 borrowing history at this stage
      expect(await rater.borrowingCount()).to.be.bignumber.equal(new BN(1))
      expect(await rater.lendingCount()).to.be.bignumber.equal(new BN(1))
      expect(await rater.rentalHistoryCount()).to.be.bignumber.equal(new BN(2))

      // Rater rates first item
      let rate1 = 5
      let review1 = 'testReview1'
      await user.inputRating(
        itemContractAddress,
        rater.address,
        rate1,
        review1,
        0, // OWNER
        { from: raterAddress },
      )
      expect(await user.ratingCount()).to.be.bignumber.equal(new BN(1))
      expect(await user.getRatingsSum()).to.be.bignumber.equal(new BN(5))

      // Rater rates second item
      let rate2 = 4
      let review2 = 'testReview2'
      await user.inputRating(
        anotherItemContractAddress,
        rater.address,
        rate2,
        review2,
        1, // RENTER
        { from: raterAddress },
      )
      expect(await user.ratingCount()).to.be.bignumber.equal(new BN(2))
      expect(await user.getRatingsSum()).to.be.bignumber.equal(new BN(9))
    })
  })
})
