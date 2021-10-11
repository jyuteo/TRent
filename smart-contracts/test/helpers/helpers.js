export const EVM_REVERT = 'VM Exception while processing transaction: revert'

export const ether = (n) => {
  return new web3.utils.BN(web3.utils.toWei(n.toString(), 'ether'))
}

export const wait = (s) => {
  const milliseconds = s * 1000
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}
