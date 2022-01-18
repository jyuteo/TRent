import Web3 from "web3";
var web3 = new Web3(window.ethereum);

const itemContractJSON = require("./abis/Item.json");
const itemContractABI = itemContractJSON.abi;

const loadItemContract = async (itemContractAddress) => {
  return new web3.eth.Contract(itemContractABI, itemContractAddress);
};

export const getItemDetails = async (itemContractAddress) => {
  const itemContract = await loadItemContract(itemContractAddress);
  const itemDetails = await itemContract.methods.getItemDetails().call();
  return itemDetails;
};
