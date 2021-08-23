const {
  accounts,
  contract,
  web3,
  provider,
} = require('@openzeppelin/test-environment')
const [admin, user1, user2, anotherUser, owner, media1] = accounts
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
const { expect } = require('chai')

const ContractFactory = contract.fromArtifact('ContractFactory')
const Item = contract.fromArtifact('Item')

describe('Contract Factory', async () => {
  beforeEach(async () => {
    contractFactory = await ContractFactory.new({ from: admin })
  })

  describe('Admin', async () => {
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
  })

  describe('User', async () => {
    it('can create User contract for new user', async () => {
      let username = 'testUsername'
      let deliveryAddress = 'testAddress'

      // create new User contract for user1
      const response1 = await contractFactory.createUserContractForNewUser(
        user1,
        username,
        deliveryAddress,
        { from: user1 },
      )
      const user1ContractAddress = await contractFactory.getUserContractForUser(
        user1,
      )
      let userCount = await contractFactory.userCount()
      expect(userCount).to.be.bignumber.equal(new BN(1))
      expect(await contractFactory.userContracts(userCount - 1)).to.be.equal(
        user1ContractAddress,
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
      const user2ContractAddress = await contractFactory.getUserContractForUser(
        user2,
      )
      userCount = await contractFactory.userCount()
      expect(userCount).to.be.bignumber.equal(new BN(2))
      expect(await contractFactory.userContracts(userCount - 1)).to.be.equal(
        user2ContractAddress,
      )
      expectEvent(response2, 'userContractCreated', {
        userAddress: user2,
        userContractAddress: user2ContractAddress,
      })
    })

    it('cannot create User contract for existing user', async () => {
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

  describe('Item', async () => {
    it('can create Item contract for new item', async () => {
      let itemDetails = {
        owner: owner,
        name: 5,
        collectionOrReturnAddress: 'testReturnAddress',
        description: 'testDescription',
        rentPerDay: 1,
        maxAllowableLateDays: 5,
        isAvailableForRent: true,
        mediaIPFSHashes: [media1],
      }
      const response = await contractFactory.createItemContract(itemDetails, {
        from: owner,
      })
      itemCount = await contractFactory.itemCount()
      expect(itemCount).to.be.bignumber.equal(new BN(1))
      const itemContractAddress = await contractFactory.itemContracts(
        itemCount - 1,
      )
      expectEvent(response, 'itemContractCreated', {
        itemOwnerAddress: owner,
        itemContractAddress: itemContractAddress,
      })
      // get item details from deployed item contract
    })
  })
})
