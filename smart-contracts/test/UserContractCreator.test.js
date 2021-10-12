import { EVM_REVERT } from './helpers/helpers.js'

require('chai').use(require('chai-as-promised')).should()
const UserContractCreator = artifacts.require('UserContractCreator')
const truffleAssert = require('truffle-assertions')

contract('UserContractCreator', ([deployer, user1, user2]) => {
  let userContractCreator

  beforeEach(async () => {
    userContractCreator = await UserContractCreator.new({ from: deployer })
  })

  it('can create User contract for new users', async () => {
    let username1 = 'testUsername1'
    let deliveryAddress1 = 'testAddress1'
    let username2 = 'testUsername2'
    let deliveryAddress2 = 'testAddress2'

    // no existing user before creating
    expect(Number(await userContractCreator.getUserCount())).to.eq(0)

    // create new User contract for user1
    const response1 = await userContractCreator.createUserContract(
      user1,
      username1,
      deliveryAddress1,
      { from: user1 },
    )

    // event emitted after creation of User contract
    const user1ContractAddress = await userContractCreator.userContractForUser(
      user1,
    )
    truffleAssert.eventEmitted(response1, 'userContractCreated', (ev) => {
      return (
        ev.userAddress === user1 && ev.userContract === user1ContractAddress
      )
    })

    // 1 user with User contract
    var userCount = await userContractCreator.getUserCount()
    expect(Number(userCount)).to.eq(1)

    // User contract address is stored
    var userContracts = await userContractCreator.getUserContracts()
    expect(userContracts[userCount - 1]).to.be.equal(user1ContractAddress)

    // create new User contract for user2
    const response2 = await userContractCreator.createUserContract(
      user2,
      username2,
      deliveryAddress2,
      { from: user2 },
    )

    // event emitted after creation of User contract
    const user2ContractAddress = await userContractCreator.userContractForUser(
      user2,
    )
    truffleAssert.eventEmitted(response2, 'userContractCreated', (ev) => {
      return (
        ev.userAddress === user2 && ev.userContract === user2ContractAddress
      )
    })

    // 2 users with User contract
    var userCount = await userContractCreator.getUserCount()
    expect(Number(userCount)).to.eq(2)

    // User contract address is stored
    var userContracts = await userContractCreator.getUserContracts()
    expect(userContracts[userCount - 1]).to.be.equal(user2ContractAddress)
  })

  it('cannot create User contract for existing user', async () => {
    let username = 'testUsername'
    let deliveryAddress = 'testAddress'

    // create new User contract of user1 for the first time
    await userContractCreator.createUserContract(
      user1,
      username,
      deliveryAddress,
      {
        from: user1,
      },
    )

    // create User contract of user1 for the second time
    await userContractCreator
      .createUserContract(user1, username, deliveryAddress, {
        from: user1,
      })
      .should.be.rejectedWith(EVM_REVERT) // existing user
  })
})
