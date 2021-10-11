const DateTime = artifacts.require('DateTime')
const Utils = artifacts.require('Utils')
const Structs = artifacts.require('Structs')
const ItemContractCreator = artifacts.require('ItemContractCreator')
const UserContractCreator = artifacts.require('UserContractCreator')
const RentalContractCreator = artifacts.require('RentalContractCreator')
const ContractFactory = artifacts.require('ContractFactory')
const Item = artifacts.require('Item')
const User = artifacts.require('User')
const Rental = artifacts.require('Rental')

// module.exports = async function (deployer) {
//   // await deployer.deploy(DateTime)
//   // await deployer.deploy(Utils)
//   // await deployer.deploy(Structs)
//   await deployer.deploy(ItemContractCreator)
//   await deployer.deploy(UserContractCreator)
//   await deployer.deploy(RentalContractCreator)
//   // await deployer.deploy(ContractFactory)
// }

async function deploy(deployer, netowrk) {
  await deployer.deploy(Utils)
  await deployer.link(Utils, [
    UserContractCreator,
    ItemContractCreator,
    RentalContractCreator,
  ])

  await deployer.deploy(Structs)
  await deployer.link(Structs, [
    UserContractCreator,
    ItemContractCreator,
    RentalContractCreator,
  ])

  await deployer.deploy(ItemContractCreator)
  await deployer.deploy(UserContractCreator)
  await deployer.deploy(RentalContractCreator)
}

module.exports = (deployer, network) => {
  deployer.then(async () => {
    await deploy(deployer, network)
  })
}
