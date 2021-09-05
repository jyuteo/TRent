const { accounts, contract, web3 } = require('@openzeppelin/test-environment')
const [
  ownerUserContract,
  ownerAddress,
  anotherUser,
  renter,
  rentalContract,
] = accounts
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
const { expect } = require('chai')

const Item = contract.fromArtifact('Item')
const DateTime = contract.fromArtifact('DateTime')

describe('Item Contract', async () => {
  beforeEach(async () => {
    let itemDetails = {
      ownerUserContract: ownerUserContract,
      ownerAddress: ownerAddress,
      name: 'itemName',
      collectionOrReturnAddress: 'testReturnAddress',
      description: 'testDescription',
      rentPerDay: 1,
      maxAllowableLateDays: 5,
      multipleForLateFees: 2,
      isAvailableForRent: true,
      mediaIPFSHashes: ['testMedia1'],
    }
    item = await Item.new(itemDetails, { from: ownerAddress })
  })

  describe('Owner', async () => {
    it('should have correct owner', async () => {
      expect(await item.ownerUserContract()).to.be.equal(ownerUserContract)
      expect(await item.ownerAddress()).to.be.equal(ownerAddress)
    })

    it('should allow owner to change item details', async () => {
      const newItemName = 'newItemName'
      const response = await item.changeItemName(newItemName, {
        from: ownerAddress,
      })
      const newItemDetails = await item.itemDetails()
      expect(newItemDetails.name).to.be.equal(newItemName)
      expectEvent(response, 'itemDetailsChanged', {
        item: item.address,
        property: 'name',
        newDetails: newItemName,
      })
    })

    it('should not allow others to change item details', async () => {
      const newItemDescription = 'newItemDescription'
      await expectRevert(
        item.changeItemDescription(newItemDescription, { from: anotherUser }),
        'VM Exception while processing transaction: revert',
      )
    })
  })

  describe('Renter', async () => {
    it('should be able to add new renter', async () => {
      expect(await item.renterCount()).to.be.bignumber.equal(new BN(0))
      expect(await item.isRenter(renter)).to.be.equal(false)

      await item.addNewRenter(renter)
      expect(await item.renters(0)).to.be.equal(renter)
      expect(await item.renterCount()).to.be.bignumber.equal(new BN(1))
      expect(await item.isRenter(renter)).to.be.equal(true)
    })
  })

  describe('Rental', async () => {
    it('should be able to handle new rental', async () => {
      expect(await item.rentalContractCount()).to.be.bignumber.equal(new BN(0))

      datetime = await DateTime.new()
      const start = await datetime.toTimestamp(2021, 8, 16)
      const end = await datetime.toTimestamp(2021, 8, 20)

      await item.addNewRenter(renter)
      await item.handleNewRental(rentalContract, start, end, { from: renter })
      expect(await item.rentalContracts(0)).to.be.equal(rentalContract)
      expect(await item.rentalContractCount()).to.be.bignumber.equal(new BN(1))

      const rentalPeriod = await item.rentalPeriods(0)
      expect(Number(rentalPeriod.start)).to.be.equal(Number(start))
      expect(Number(rentalPeriod.end)).to.be.equal(Number(end))
    })
  })
})
