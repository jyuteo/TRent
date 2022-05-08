import Web3 from "web3";
import { gweiToWei } from "../../helpers/mathUtils";
import { getItemDetails, getItemStatus } from "./itemContract";
var web3 = new Web3(window.ethereum);

const rentalContractJSON = require("./abis/Rental.json");
const rentalContractABI = rentalContractJSON.abi;

const loadRentalContract = async (rentalContractAddress) => {
  return new web3.eth.Contract(rentalContractABI, rentalContractAddress);
};

export const getRentalStatus = async (rentalContractAddress) => {
  const rentalContract = await loadRentalContract(rentalContractAddress);
  const rentalStatus = await rentalContract.methods.rentalStatus().call();
  return rentalStatus;
};

export const getRentalDetails = async (rentalContractAddress) => {
  const rentalContract = await loadRentalContract(rentalContractAddress);
  const rentPerDayInGwei = await rentalContract.methods.rentPerDay().call();
  const rentalFeesInGwei = await rentalContract.methods.rentalFees().call();
  const rentalFeesPaidInGwei = await rentalContract.methods
    .rentalFeesPaid()
    .call();
  const renterDepositInGwei = await rentalContract.methods
    .renterDeposit()
    .call();
  const rentalStatus = await rentalContract.methods.rentalStatus().call();
  const itemContractAddress = await rentalContract.methods
    .itemContract()
    .call();
  const itemDetails = await getItemDetails(itemContractAddress);
  const itemStatus = await getItemStatus(itemContractAddress);
  const renterUserContractAddress = await rentalContract.methods
    .renterUserContractAddress()
    .call();
  const renterEthAccountAddress = await rentalContract.methods
    .renterAddress()
    .call();
  const ownerEthAccountAddress = await rentalContract.methods
    .ownerAddress()
    .call();
  const start = await rentalContract.methods.start().call();
  const end = await rentalContract.methods.end().call();
  const renterCreateRentalContractTimestamp = await rentalContract.methods
    .renterCreateRentalContractTimestamp()
    .call();
  const ownerUploadProofOfTransferTimestamp = await rentalContract.methods
    .ownerUploadProofOfTransferTimestamp()
    .call();
  const ownerProofOfTransferImageUrl =
    ownerUploadProofOfTransferTimestamp !== 0
      ? await rentalContract.methods.ownerProofOfTransfer().call()
      : "";
  const renterUploadProofOfReturnTimestamp = await rentalContract.methods
    .renterUploadProofOfReturnTimestamp()
    .call();
  const renterProofOfReturnImageUrl =
    renterUploadProofOfReturnTimestamp !== 0
      ? await rentalContract.methods.renterProofOfReturn().call()
      : "";
  const renterPayRentalFeesTimestamp = await rentalContract.methods
    .renterPayRentalTimestamp()
    .call();
  const ownerClaimRentalFeesTimestamp = await rentalContract.methods
    .ownerClaimRentalFeesTimestamp()
    .call();
  const ownerSettleRentalAfterMaximumLateDaysTimestamp =
    await rentalContract.methods
      .ownerSettleRentalAfterMaximumLateDaysTimestamp()
      .call();

  let rentalDetails = {
    itemContractAddress: itemContractAddress,
    itemImageUrl: itemDetails.imageIPFSUrl[0],
    itemName: itemDetails.name,
    itemStatus: itemStatus,
    rentalContractAddress: rentalContractAddress,
    ownerUserContractAddress: itemDetails.ownerUserContract,
    ownerEthAccountAddress: ownerEthAccountAddress,
    renterUserContractAddress: renterUserContractAddress,
    renterEthAccountAddress: renterEthAccountAddress,
    renterDepositInGwei: renterDepositInGwei,
    rentPerDayInGwei: rentPerDayInGwei,
    rentalFeesInGwei: rentalFeesInGwei,
    rentalFeesPaidInGwei: rentalFeesPaidInGwei,
    rentalStatus: rentalStatus,
    start: start,
    end: end,
    renterCreateRentalContractTimestamp: renterCreateRentalContractTimestamp,
    ownerUploadProofOfTransfer: {
      time: ownerUploadProofOfTransferTimestamp,
      imageUrl: ownerProofOfTransferImageUrl,
    },
    renterPayRentalFeesTimestamp: renterPayRentalFeesTimestamp,
    renterUploadProofOfReturn: {
      time: renterUploadProofOfReturnTimestamp,
      imageUrl: renterProofOfReturnImageUrl,
    },
    ownerClaimRentalFeesTimestamp: ownerClaimRentalFeesTimestamp,
    ownerSettleRentalAfterMaximumLateDaysTimestamp:
      ownerSettleRentalAfterMaximumLateDaysTimestamp,
  };

  return rentalDetails;
};

export const uploadOwnerProofOfTransferAndPayDeposit = async (
  rentalContractAddress,
  ownerEthAccountAddress,
  ownerProofOfTransfer,
  ownerDepositInGwei
) => {
  try {
    const rentalContract = await loadRentalContract(rentalContractAddress);
    await rentalContract.methods
      .uploadOwnerProofOfTransferAndPayDeposit(
        ownerProofOfTransfer,
        ownerDepositInGwei
      )
      .send({
        from: ownerEthAccountAddress,
        value: gweiToWei(ownerDepositInGwei),
      });
  } catch (err) {
    console.log("Error in uploading owner proof of transfer: ", err);
    return false;
  }
};

export const uploadRenterProofOfReturn = async (
  rentalContractAddress,
  renterEthAccountAddress,
  renterProofOfReturn
) => {
  try {
    const rentalContract = await loadRentalContract(rentalContractAddress);
    await rentalContract.methods
      .uploadRenterProofOfReturn(renterProofOfReturn)
      .send({
        from: renterEthAccountAddress,
      });
  } catch (err) {
    console.log("Error in uploading renter proof of return: ", err);
    return false;
  }
};

export const payRentalFeesIncludingLateFees = async (
  rentalContractAddress,
  rentalFeesInGwei,
  renterEthAccountAddress
) => {
  try {
    const rentalContract = await loadRentalContract(rentalContractAddress);
    await rentalContract.methods
      .payRentalIncludingLateFees(rentalFeesInGwei)
      .send({
        from: renterEthAccountAddress,
        value: gweiToWei(rentalFeesInGwei),
      });
  } catch (err) {
    console.log("Error in paying rental fees: ", err);
    return false;
  }
};

export const claimRentalFeesAndSettleDeposit = async (
  rentalContractAddress,
  ownerEthAccountAddress
) => {
  try {
    const rentalContract = await loadRentalContract(rentalContractAddress);
    await rentalContract.methods
      .settleDeposit()
      .send({ from: ownerEthAccountAddress });
  } catch (err) {
    console.log("Error in claiming rental fees: ", err);
  }
};

export const settleRentalAfterMaximumLateDays = async (
  rentalContractAddress,
  ownerEthAccountAddress
) => {
  try {
    const rentalContract = await loadRentalContract(rentalContractAddress);
    await rentalContract.methods
      .settleRentalAfterFiveLateDays()
      .send({ from: ownerEthAccountAddress });
  } catch (err) {
    console.log("Error in settling all fees after maxiumum late days: ", err);
  }
};
