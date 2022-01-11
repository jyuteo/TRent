export const EVM_REVERT = 'VM Exception while processing transaction: revert'

export const ether = (n) => {
  return new web3.utils.BN(web3.utils.toWei(n.toString(), 'ether'))
}

export const waitDays = (days) => {
  const milliseconds = days * 24 * 60 * 60 * 1000
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}
