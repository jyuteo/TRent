const DateTime = artifacts.require("DateTime");
const Utils = artifacts.require("Utils");

require("chai").use(require("chai-as-promised")).should();

contract("Helpers: Utils, DateTime", (accounts) => {
  let datetime, utils;

  beforeEach(async () => {
    datetime = await DateTime.new();
    utils = await Utils.new();
  });

  it("getDaysBetween", async () => {
    const start = await datetime.toTimestamp(2021, 8, 16);
    const end = await datetime.toTimestamp(2021, 8, 21);
    const daysBetween = await utils.getDaysBetween(start * 1000, end * 1000);
    expect(Number(daysBetween)).to.be.equal(6);
  });

  it("gweiToWei", async () => {
    const gweiAmount = 6;
    const weiAmount = await utils.gweiToWei(gweiAmount);
    expect(Number(weiAmount)).to.be.equal(gweiAmount * 10 ** 9);
  });
});
