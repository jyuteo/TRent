import Web3 from "web3";
var web3 = new Web3(window.ethereum);

const userContractCreatorJSON = require("./abis/UserContractCreator.json");
const userContractCreatorABI = userContractCreatorJSON.abi;
const userContractCreatorAddress =
  process.env.REACT_APP_USER_CONTRACT_CREATOR_ADDRESS;
const userContractCreator = new web3.eth.Contract(
  userContractCreatorABI,
  userContractCreatorAddress
);

const getUserContractAddress = async (ethAccountAddress) => {
  const userContractAddress = await userContractCreator.methods
    .userContractForUser(ethAccountAddress)
    .call();
  return userContractAddress;
};

export const createUserContract = async (
  ethAccountAddress,
  username,
  shippingAddress
) => {
  try {
    await userContractCreator.methods
      .createUserContract(ethAccountAddress, username, shippingAddress)
      .send({
        from: ethAccountAddress,
        gas: 6721974,
        gasPrice: 10000000000,
      });
    const userContractAddress = await getUserContractAddress(ethAccountAddress);
    return userContractAddress;
  } catch (err) {
    console.log("Error in creating User contract: ", err);
    return null;
  }
};
