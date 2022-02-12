import Web3 from "web3";
import { getItemDetails } from "./itemContract";
var web3 = new Web3(window.ethereum);

const userContractJSON = require("./abis/User.json");
const userContractABI = userContractJSON.abi;

const loadUserContract = async (userContractAddress) => {
  return new web3.eth.Contract(userContractABI, userContractAddress);
};

export const getRentalDetailsFromRentalHistories = async (
  userContractAddress
) => {
  const userContract = await loadUserContract(userContractAddress);
  const rentalHistoryCount = parseInt(
    await userContract.methods.rentalHistoryCount().call()
  );

  if (rentalHistoryCount === 0) {
    return { rentalsAsOwner: [], rentalsAsRenter: [] };
  }

  return await Promise.all(
    [...Array(rentalHistoryCount).keys()].map((i) =>
      userContract.methods
        .rentalHistories(i)
        .call()
        .then(
          async ({
            itemContract,
            rentalContract,
            ownerUserContract,
            renterUserContract,
            role,
            start,
            end,
          }) => {
            let itemDetails = await getItemDetails(itemContract);
            let rentalDetails = {
              itemContractAddress: itemContract,
              rentalContractAddress: rentalContract,
              ownerUserContractAddress: ownerUserContract,
              renterUserContractAddress: renterUserContract,
              role: role,
              start: start,
              end: end,
              itemImageUrl: itemDetails.imageIPFSUrl[0],
              itemName: itemDetails.name,
            };
            return rentalDetails;
          }
        )
    )
  ).then((rentalDetailsList) => {
    let rentalsAsOwner = [];
    let rentalsAsRenter = [];
    rentalDetailsList.forEach((rentalDetails) => {
      if (parseInt(rentalDetails.role) === 0) {
        rentalsAsOwner.push(rentalDetails);
      } else {
        rentalsAsRenter.push(rentalDetails);
      }
    });
    return { rentalsAsOwner, rentalsAsRenter };
  });
};
