const { contract } = require('@openzeppelin/test-environment')
const { expect } = require('chai')

const DateTime = contract.fromArtifact('DateTime')
const Utils = contract.fromArtifact('Utils')

describe('Utils', async () => {
  beforeEach(async () => {
    datetime = await DateTime.new()
    utils = await Utils.new()
  })
  it('getDaysBetween', async () => {
    const start = await datetime.toTimestamp(2021, 8, 16)
    const end = await datetime.toTimestamp(2021, 8, 21)
    const daysBetween = await utils.getDaysBetween(start, end)
    expect(Number(daysBetween)).to.be.equal(5)
  })
  it('gweiToWei', async () => {
    const gweiAmount = 6
    const weiAmount = await utils.gweiToWei(gweiAmount)
    expect(Number(weiAmount)).to.be.equal(gweiAmount * 10 ** 9)
  })
})
