import { EVM_REVERT } from './helpers/helpers.js'

require('chai').use(require('chai-as-promised')).should()
const ItemContractCreator = artifacts.require('ItemContractCreator')
const RentalContractCreator = artifacts.require('RentalContractCreator')
const truffleAssert = require('truffle-assertions')

const { accounts } = require('@openzeppelin/test-environment')
const [ownerContractAddress] = accounts

contract('RentalContractCreator', ([deployer, owner, renter]) => {
  let itemDetails,
    itemContractCreator,
    rentalContractCreator,
    itemContractAddress,
    rentalContractAddress

  beforeEach(async () => {
    itemContractCreator = await ItemContractCreator.new({ from: deployer })
    rentalContractCreator = await RentalContractCreator.new({ from: deployer })

    itemDetails = {
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

    // create new Item
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
  })

  it('can create Rental contract for item', async () => {
    // no existing rental before creating
    expect(Number(await rentalContractCreator.rentalContractCount())).to.eq(0)

    // create new Rental contract
    const response = await rentalContractCreator.createRentalContract(
      itemContractAddress,
      itemDetails,
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
      },
    )

    // event emitted after creation of Rental contract
    truffleAssert.eventEmitted(response, 'rentalContractCreated', (ev) => {
      rentalContractAddress = ev.rentalContract
      return (
        ev.itemContract === itemContractAddress &&
        ev.renterAddress === renter &&
        ev.rentalContract === rentalContractAddress
      )
    })

    // 1 Rental contract
    var rentalCount = await rentalContractCreator.rentalContractCount()
    expect(Number(rentalCount)).to.eq(1)

    // Rental contract address is stored
    expect(
      await rentalContractCreator.rentalContracts(rentalCount - 1),
    ).to.be.equal(rentalContractAddress)
  })

  it('cannot create Rental contract for if msg.sender is not renter', async () => {
    // no existing rental before creating
    expect(Number(await rentalContractCreator.rentalContractCount())).to.eq(0)

    // create new Rental contract
    await rentalContractCreator
      .createRentalContract(
        itemContractAddress,
        itemDetails,
        renter,
        10000,
        200,
        1633442907,
        1633529307,
        {
          from: owner,
          gas: 6000000,
          gasPrice: 20,
          value: 200000000000,
        },
      )
      .should.be.rejectedWith(EVM_REVERT) //msg.sender is item owner
  })

  it('cannot create Rental contract for if msg.value is not equal to renter deposit', async () => {
    // no existing rental before creating
    expect(Number(await rentalContractCreator.rentalContractCount())).to.eq(0)

    // create new Rental contract
    await rentalContractCreator
      .createRentalContract(
        itemContractAddress,
        itemDetails,
        renter,
        10000,
        200,
        1633442907,
        1633529307,
        {
          from: owner,
          gas: 6000000,
          gasPrice: 20,
        },
      )
      .should.be.rejectedWith(EVM_REVERT) //no msg.value
  })
})
