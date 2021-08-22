const { accounts, contract } = require('@openzeppelin/test-environment')
const [admin, user1, user2, anotherUser] = accounts
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
const { expect } = require('chai')

const ContractFactory = contract.fromArtifact('ContractFactory')

describe('Contract Factory', async () => {
  beforeEach(async () => {
    contractFactory = await ContractFactory.new({ from: admin })
  })

  it('should have correct admin', async () => {
    expect(await contractFactory.admin()).to.be.equal(admin)
  })

  it('should allow admin to set new admin', async () => {
    const response = await contractFactory.setAdmin(anotherUser, {
      from: admin,
    })
    expect(await contractFactory.admin()).to.be.equal(anotherUser)
    expectEvent(response, 'adminChanged', {
      newAdmin: anotherUser,
    })
  })

  it('should not allow other user to set new admin', async () => {
    expect(await contractFactory.admin()).to.be.equal(admin)
    await expectRevert(
      contractFactory.setAdmin(anotherUser, { from: anotherUser }),
      'VM Exception while processing transaction: revert',
    )
  })

  describe('User Contract', async () => {
    it('can create new User contract for new user', async () => {
      let username = 'testUsername'
      let deliveryAddress = 'testAddress'

      // create new User contract for user1
      const response1 = await contractFactory.createUserContractForNewUser(
        user1,
        username,
        deliveryAddress,
        { from: user1 },
      )
      const user1ContractAddress = await contractFactory.getDeployedUserContractForUser(
        user1,
      )
      expectEvent(response1, 'userContractCreated', {
        userAddress: user1,
        userContractAddress: user1ContractAddress,
      })

      // create new User contract for user2
      const response2 = await contractFactory.createUserContractForNewUser(
        user2,
        username,
        deliveryAddress,
        { from: user2 },
      )
      const user2ContractAddress = await contractFactory.getDeployedUserContractForUser(
        user2,
      )
      expectEvent(response2, 'userContractCreated', {
        userAddress: user2,
        userContractAddress: user2ContractAddress,
      })
    })

    it('cannot create new User contract for existing user', async () => {
      let username = 'testUsername'
      let deliveryAddress = 'testAddress'

      // create new User contract for the first time
      await contractFactory.createUserContractForNewUser(
        user1,
        username,
        deliveryAddress,
        { from: user1 },
      )

      // create User contract for the second time
      await expectRevert(
        contractFactory.createUserContractForNewUser(
          user1,
          username,
          deliveryAddress,
          { from: user1 },
        ),
        'VM Exception while processing transaction: revert',
      )
    })
  })
})
