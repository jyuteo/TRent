const DateTime = artifacts.require('DateTime')
const Utils = artifacts.require('Utils')
const Structs = artifacts.require('Structs')
const ItemContractCreator = artifacts.require('ItemContractCreator')
const UserContractCreator = artifacts.require('UserContractCreator')
const RentalContractCreator = artifacts.require('RentalContractCreator')
const ContractFactory = artifacts.require('ContractFactory')

module.exports = async function (deployer) {
  await deployer.deploy(DateTime)
  await deployer.deploy(Utils)
  await deployer.deploy(Structs)
  await deployer.deploy(ItemContractCreator)
  await deployer.deploy(UserContractCreator)
  await deployer.deploy(RentalContractCreator)
  await deployer.deploy(ContractFactory)
}
