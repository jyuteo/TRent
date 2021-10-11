import { EVM_REVERT } from './helpers/helpers.js'

require('chai').use(require('chai-as-promised')).should()
const ItemContractCreator = artifacts.require('ItemContractCreator')
const truffleAssert = require('truffle-assertions')

const { accounts } = require('@openzeppelin/test-environment')
const [ownerContractAddress] = accounts

contract('ItemContractCreator', ([deployer, owner, renter]) => {
  let itemContractCreator, itemContractAddress

  beforeEach(async () => {
    itemContractCreator = await ItemContractCreator.new({ from: deployer })
  })

  it('can create Item contract for item', async () => {
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

    // no existing item before creating
    expect(Number(await itemContractCreator.getItemCount())).to.eq(0)

    // create new Item contract for item
    const response = await itemContractCreator.createItemContract(itemDetails, {
      from: owner,
    })

    // event emitted after creation of Item contract
    truffleAssert.eventEmitted(response, 'itemContractCreated', (ev) => {
      itemContractAddress = ev.itemContract
      return (
        ev.itemOwnerAddress === owner && ev.itemContract === itemContractAddress
      )
    })

    // 1 item with Item contract
    var itemCount = await itemContractCreator.getItemCount()
    expect(Number(itemCount)).to.eq(1)

    // Item contract address is stored
    var itemContracts = await itemContractCreator.getItemContracts()
    expect(itemContracts[itemCount - 1]).to.be.equal(itemContractAddress)
  })

  it('cannot create User contract for existing user', async () => {
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

    await itemContractCreator
      .createItemContract(itemDetails, {
        from: renter,
      })
      .should.be.rejectedWith(EVM_REVERT) //msg.sender != item owner
  })
})
