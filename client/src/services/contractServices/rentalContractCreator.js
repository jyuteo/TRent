import Web3 from "web3";
import { gweiToWei } from "../../helpers/mathUtils";
var web3 = new Web3(window.ethereum);

const rentalContractCreatorJSON = require("./abis/RentalContractCreator.json");
const rentalContractCreatorABI = rentalContractCreatorJSON.abi;
const rentalContractCreatorAddress =
  process.env.REACT_APP_RENTAL_CONTRACT_CREATOR_ADDRESS;
const rentalContractCreator = new web3.eth.Contract(
  rentalContractCreatorABI,
  rentalContractCreatorAddress
);

export const createRentalContract = async (
  itemContractAddress,
  itemDetails,
  renterUserContractAddress,
  renterEthAccountAddress,
  rentalFeesPayableInGwei,
  renterDepositInGwei,
  startDate,
  endDate
) => {
  let newRentalContractAddress;
  try {
    await rentalContractCreator.methods
      .createRentalContract(
        itemContractAddress,
        itemDetails,
        renterUserContractAddress,
        renterEthAccountAddress,
        rentalFeesPayableInGwei,
        renterDepositInGwei,
        startDate,
        endDate
      )
      .send({
        from: renterEthAccountAddress,
        gas: 6721974,
        gasPrice: 20,
        value: gweiToWei(renterDepositInGwei),
      });

    newRentalContractAddress = rentalContractCreator
      .getPastEvents("rentalContractCreated", {
        fromBlock: "latest",
      })
      .then((events) => {
        newRentalContractAddress = events[0].returnValues.rentalContract;
        return newRentalContractAddress;
      });
    return newRentalContractAddress;
  } catch (err) {
    console.log("Error in creating Item contract: ", err);
    return null;
  }
};
