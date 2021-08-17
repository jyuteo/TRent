const DateTime = artifacts.require('DateTime')

module.exports = async function (deployer) {
  await deployer.deploy(DateTime)
}
