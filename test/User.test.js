const { accounts, contract } = require('@openzeppelin/test-environment')
const [userAddress, otherUserAddress, raterAddress] = accounts
const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
const { expect } = require('chai')

const User = contract.fromArtifact('User')

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
      const response = await user.setUsername(newUsername, {
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
        user.setUsername(newUsername, { from: otherUserAddress }),
        'VM Exception while processing transaction: revert',
      )
    })
    it('should let owner to change his/her own deliveryAddress', async () => {
      let newDeliveryAddress = 'newdeliveryAddress'
      const response = await user.setDeliveryAddress(newDeliveryAddress, {
        from: userAddress,
      })
      expect(await user.deliveryAddress()).to.be.equal(newDeliveryAddress)
      expectEvent(response, 'deliveryAddressChanged', {
        userAccount: userAddress,
        newDeliveryAddress: newDeliveryAddress,
      })
    })
    it('should not let anyone else to change username', async () => {
      let newDeliveryAddress = 'newDeliveryAddress'
      await expectRevert(
        user.setDeliveryAddress(newDeliveryAddress, { from: otherUserAddress }),
        'VM Exception while processing transaction: revert',
      )
    })
  })
})
