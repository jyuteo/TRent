const { accounts, contract } = require('@openzeppelin/test-environment')
const [
  ownerUserContract,
  ownerAddress,
  renterUserContract,
  renterAddress,
  otherAddress,
] = accounts
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
const balance = require('@openzeppelin/test-helpers/src/balance')
const { expect } = require('chai')

const Rental = contract.fromArtifact('Rental')
const DateTime = contract.fromArtifact('DateTime')
const Item = contract.fromArtifact('Item')

function ethToGwei(_eth) {
  return _eth * 10 ** 9
}

function ethToWei(_eth) {
  return _eth * 10 ** 18
}

describe('Rental Contract', async () => {
  beforeEach(async () => {
    datetime = await DateTime.new()

    itemDetails = {
      ownerUserContract: ownerUserContract,
      ownerAddress: ownerAddress,
      name: 'itemName',
      collectionOrReturnAddress: 'testReturnAddress',
      description: 'testDescription',
      rentPerDay: ethToGwei(0.01), // in gwei
      maxAllowableLateDays: 5,
      multipleForLateFees: 2,
      isAvailableForRent: true,
      mediaIPFSHashes: ['testMedia1'],
    }
    item = await Item.new(itemDetails)

    let rentalFees = ethToGwei(0.06)
    let renterDeposit = ethToGwei(0.2)
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
      { from: renterAddress, value: ethToGwei(renterDeposit) },
    )
  })

  describe('Constructor', async () => {
    it('should have correct rental information', async () => {
      // rental
      expect(Number(await rental.rentalFees())).to.be.equal(ethToGwei(0.06))
      expect(Number(await rental.renterDeposit())).to.be.equal(ethToGwei(0.2))
      expect(await rental.start()).to.be.bignumber.equal(
        new BN(await datetime.toTimestamp(2021, 8, 16)),
      )
      expect(await rental.end()).to.be.bignumber.equal(
        new BN(await datetime.toTimestamp(2021, 8, 21)),
      )
      expect(Number(await rental.numInstallment())).to.be.equal(2)
      expect(Number(await rental.rentalStatus())).to.be.equal(0)
      expect(Number(await rental.rentPerDay())).to.be.equal(ethToGwei(0.01))
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
    it('should allow renter to pay rental installment and calculate claimable rental fees correctly', async () => {
      await rental.payRentalInstallment(ethToGwei(0.02), {
        from: renterAddress,
        value: ethToWei(0.02),
      })
      expect(Number(await rental.paidRentalFees())).to.be.equal(ethToGwei(0.02))
      expect(Number(await rental.remainingRentalFees())).to.be.equal(
        ethToGwei(0.04),
      )
      expect(Number(await rental.claimableRentalFees())).to.be.equal(
        ethToGwei(0.02),
      )
      expect(Number(await rental.claimedRentalFees())).to.be.equal(0)
      expect(Number(await rental.remainingNumInstallment())).to.be.equal(1)
    })
    it('should not allow others to pay renter installment', async () => {
      await expectRevert(
        rental.payRentalInstallment(ethToGwei(0.02), {
          from: otherAddress,
          value: ethToWei(0.02),
        }),
        'VM Exception while processing transaction: revert',
      )
    })
    it('should not allow renter to pay renter installment with incorrect value', async () => {
      await expectRevert(
        rental.payRentalInstallment(ethToGwei(0.02), {
          from: renterAddress,
          value: ethToWei(0.03),
        }),
        'VM Exception while processing transaction: revert',
      )
    })
    it('should allow renter to claim rental fees', async () => {
      // total rental: 0.06 eth, num installments: 2
      // 1st installment: renter pays 0.02 eth
      await rental.payRentalInstallment(ethToGwei(0.02), {
        from: renterAddress,
        value: ethToWei(0.02),
      })

      before = Number(await balance.current(ownerAddress))
      await rental.claimRentalFees({ from: ownerAddress })
      after = Number(await balance.current(ownerAddress))
      expect(after).to.be.greaterThan(before)
      expect(Number(await rental.claimableRentalFees())).to.be.equal(
        ethToGwei(0),
      )
      expect(Number(await rental.claimedRentalFees())).to.be.equal(
        ethToGwei(0.02),
      )
      expect(Number(await rental.paidRentalFees())).to.be.equal(ethToGwei(0.02))
      expect(Number(await rental.remainingRentalFees())).to.be.equal(
        ethToGwei(0.04),
      )
      expect(Number(await rental.remainingNumInstallment())).to.be.equal(1)
    })
  })
  // internal functions, change the functions to public before testing
  // describe('Helpers', async () => {
  //   it('calculatePayoutIncentive', async () => {
  //     const payoutIncentive = await rental.calculatePayoutIncentive(200)
  //     expect(Number(payoutIncentive)).to.be.equal(10)
  //   })
  // })
})