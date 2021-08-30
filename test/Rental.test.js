const { accounts, contract } = require('@openzeppelin/test-environment')
const [
  ownerUserContract,
  ownerAddress,
  renterUserContract,
  renterAddress,
  otherAddress,
] = accounts
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
const { expect } = require('chai')

const Rental = contract.fromArtifact('Rental')
const DateTime = contract.fromArtifact('DateTime')
const Item = contract.fromArtifact('Item')

describe('Rental Contract', async () => {
  beforeEach(async () => {
    datetime = await DateTime.new()

    itemDetails = {
      ownerUserContract: ownerUserContract,
      ownerAddress: ownerAddress,
      name: 'itemName',
      collectionOrReturnAddress: 'testReturnAddress',
      description: 'testDescription',
      rentPerDay: 1,
      maxAllowableLateDays: 5,
      multipleForLateFees: 2,
      isAvailableForRent: true,
      mediaIPFSHashes: 'testMedia1',
    }
    item = await Item.new(itemDetails)

    let rentalFees = 6
    let renterDeposit = 20
    let start = await datetime.toTimestamp(2021, 8, 16)
    let end = await datetime.toTimestamp(2021, 8, 21)
    let numInstallment = 2
    rental = await Rental.new(
      item.address,
      renterUserContract,
      renterAddress,
      rentalFees,
      renterDeposit,
      start,
      end,
      numInstallment,
      { from: renterAddress, value: renterDeposit },
    )
  })

  describe('Constructor', async () => {
    it('should have correct rental information', async () => {
      // rental
      expect(Number(await rental.rentalFees())).to.be.equal(6)
      expect(Number(await rental.renterDeposit())).to.be.equal(20)
      expect(await rental.start()).to.be.bignumber.equal(
        new BN(await datetime.toTimestamp(2021, 8, 16)),
      )
      expect(await rental.end()).to.be.bignumber.equal(
        new BN(await datetime.toTimestamp(2021, 8, 21)),
      )
      expect(Number(await rental.numInstallment())).to.be.equal(2)
      expect(Number(await rental.rentalStatus())).to.be.equal(0)
      expect(Number(await rental.rentPerDay())).to.be.equal(1)
      expect(Number(await rental.maxAllowableLateDays())).to.be.equal(5)
      expect(Number(await rental.multipleForLateFees())).to.be.equal(2)

      // renter
      expect(await rental.renterUserContract()).to.be.equal(renterUserContract)
      expect(await rental.renterAddress()).to.be.equal(renterAddress)

      // owner
      expect(await rental.ownerUserContract()).to.be.equal(ownerUserContract)
      expect(await rental.ownerAddress()).to.be.equal(ownerAddress)

      // initial values
      expect(Number(await rental.remainingRentalFees())).to.be.equal(
        Number(await rental.rentalFees()),
      )
      expect(Number(await rental.paidRentalFees())).to.be.equal(0)
      expect(Number(await rental.claimableRentalFees())).to.be.equal(0)
      expect(Number(await rental.claimedRentalFees())).to.be.equal(0)
      expect(Number(await rental.remainingNumInstallment())).to.be.equal(
        Number(await rental.numInstallment()),
      )
    })
  })
  describe('Paying and claiming', async () => {
    it('should allow renter to pay rental installment', async () => {
      await rental.payRentalInstallment(2, {
        from: renterAddress,
        value: 2,
      })
      expect(Number(await rental.paidRentalFees())).to.be.equal(2)
      expect(Number(await rental.remainingRentalFees())).to.be.equal(Number(4))
      expect(Number(await rental.claimableRentalFees())).to.be.equal(2)
      expect(Number(await rental.claimedRentalFees())).to.be.equal(0)
      expect(Number(await rental.remainingNumInstallment())).to.be.equal(
        Number(1),
      )
    })
    it('should not allow others to pay renter installment', async () => {
      await expectRevert(
        rental.payRentalInstallment(2, {
          from: otherAddress,
          value: 2,
        }),
        'VM Exception while processing transaction: revert',
      )
    })
    it('should not allow renter to pay renter installment with incorrect value', async () => {
      await expectRevert(
        rental.payRentalInstallment(2, {
          from: renterAddress,
          value: 3,
        }),
        'VM Exception while processing transaction: revert',
      )
    })
  })
  // internal functions
  // describe('Helpers', async () => {
  //   it('getDaysBetween', async () => {
  //     const start = await datetime.toTimestamp(2021, 8, 16)
  //     const end = await datetime.toTimestamp(2021, 8, 21)
  //     const daysBetween = await rental.getDaysBetween(start, end, {
  //       from: rental.address,
  //     })
  //     expect(Number(daysBetween)).to.be.equal(5)
  //   })
  // })
})
