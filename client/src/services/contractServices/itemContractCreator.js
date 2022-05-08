import Web3 from "web3";
var web3 = new Web3(window.ethereum);

const itemContractCreatorJSON = require("./abis/ItemContractCreator.json");
const itemContractCreatorABI = itemContractCreatorJSON.abi;
const itemContractCreatorAddress =
  process.env.REACT_APP_ITEM_CONTRACT_CREATOR_ADDRESS;
const itemContractCreator = new web3.eth.Contract(
  itemContractCreatorABI,
  itemContractCreatorAddress
);

export const createItemContract = async (
  ownerUserContract,
  ownerEthAccountAddress,
  name,
  description,
  collectionOrReturnAddress,
  rentPerDay,
  imageIPFSUrlArray
) => {
  const itemDetails = {
    ownerUserContract: ownerUserContract,
    ownerAddress: ownerEthAccountAddress,
    name: name,
    description: description,
    collectionOrReturnAddress: collectionOrReturnAddress,
    rentPerDay: rentPerDay, // in gwei
    maxAllowableLateDays: 5,
    multipleForLateFees: 2,
    isAvailableForRent: true,
    imageIPFSUrl: imageIPFSUrlArray,
  };
  let newItemContractAddress;
  try {
    await itemContractCreator.methods.createItemContract(itemDetails).send({
      from: ownerEthAccountAddress,
      gas: 6721974,
      gasPrice: 20000000000,
    });

    newItemContractAddress = itemContractCreator
      .getPastEvents("itemContractCreated", {
        fromBlock: "latest",
      })
      .then((events) => {
        newItemContractAddress = events[0].returnValues.itemContract;
        return newItemContractAddress;
      });
    return newItemContractAddress;
  } catch (err) {
    console.log("Error in creating Item contract: ", err);
    return null;
  }
};

export const getAllItemContracts = async () => {
  try {
    const itemContracts = await itemContractCreator.methods
      .getItemContracts()
      .call();
    return itemContracts;
  } catch (err) {
    throw new Error(err);
  }
};
