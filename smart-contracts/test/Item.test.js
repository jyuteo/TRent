import { EVM_REVERT } from './helpers/helpers.js'

require('chai').use(require('chai-as-promised')).should()
const ItemContractCreator = artifacts.require('ItemContractCreator')
const Item = artifacts.require('Item')
const DateTime = artifacts.require('DateTime')
const truffleAssert = require('truffle-assertions')

const { accounts } = require('@openzeppelin/test-environment')
const [ownerContractAddress, rentalContractAddress] = accounts

contract('Item contract', ([deployer, owner, renter]) => {
  let itemContractCreator, item, itemContractAddress

  beforeEach(async () => {
    itemContractCreator = await ItemContractCreator.new({ from: deployer })

    let itemDetails = {
      ownerUserContract: ownerContractAddress,
      ownerAddress: owner,
      name: 'testItemName',
      collectionOrReturnAddress: 'testCollectionAddress',
      description: 'testItemDescription',
      rentPerDay: 10000000, // in gwei
      maxAllowableLateDays: 5,
      multipleForLateFees: 2,
      isAvailableForRent: true,
      mediaIPFSHashes: ['a', 'b'],
    }

    // create new User contract of user1
    const res = await itemContractCreator.createItemContract(itemDetails, {
      from: owner,
    })

    // event emitted after creation of Item contract
    truffleAssert.eventEmitted(res, 'itemContractCreated', (ev) => {
      itemContractAddress = ev.itemContract
      return (
        ev.itemOwnerAddress === owner && ev.itemContract === itemContractAddress
      )
    })

    item = await Item.at(itemContractAddress)
  })

  describe('Owner', async () => {
    it('should have correct owner', async () => {
      expect(await item.ownerUserContract()).to.be.equal(ownerContractAddress)
      expect(await item.ownerAddress()).to.be.equal(owner)
    })

    it('should allow owner to change item details', async () => {
      const newItemName = 'newItemName'
      const response = await item.changeItemName(newItemName, {
        from: owner,
      })
      const newItemDetails = await item.itemDetails()
      expect(newItemDetails.name).to.be.equal(newItemName)

      truffleAssert.eventEmitted(response, 'itemDetailsChanged', (ev) => {
        return (
          ev.item === itemContractAddress &&
          ev.property === 'name' &&
          ev.newDetails === newItemName
        )
      })
    })

    it('should not allow others to change item details', async () => {
      const newItemDescription = 'newItemDescription'
      await item
        .changeItemDescription(newItemDescription, { from: renter })
        .should.be.rejectedWith(EVM_REVERT) //invalid user
    })
  })

  describe('Rental', async () => {
    let datetime
    it('should be able to handle new rental', async () => {
      expect(Number(await item.rentalContractCount())).to.eq(0)

      datetime = await DateTime.new()
      const start = await datetime.toTimestamp(2021, 8, 16)
      const end = await datetime.toTimestamp(2021, 8, 20)

      await item.handleNewRental(rentalContractAddress, start, end, renter, {
        from: renter,
      })
      expect(await item.rentalContracts(0)).to.be.equal(rentalContractAddress)
      expect(Number(await item.rentalContractCount())).to.eq(1)

      const rentalPeriod = await item.rentalPeriods(0)
      expect(Number(rentalPeriod.start)).to.eq(Number(start))
      expect(Number(rentalPeriod.end)).to.eq(Number(end))
    })
  })
})
