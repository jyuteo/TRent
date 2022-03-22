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

export const getItemStatus = async (itemContractAddress) => {
  const itemContract = await loadItemContract(itemContractAddress);
  const itemStatus = await itemContract.methods.itemStatus().call();
  return itemStatus;
};

export const getItemRating = async (itemContractAddress) => {
  const itemContract = await loadItemContract(itemContractAddress);
  const ratingsSum = await itemContract.methods.getRatingsSum().call();
  const reviewCount = parseInt(await itemContract.methods.reviewCount().call());
  if (reviewCount === 0) {
    return 0;
  } else {
    return Math.floor(ratingsSum / reviewCount);
  }
};

export const getItemReviews = async (itemContractAddress) => {
  const itemContract = await loadItemContract(itemContractAddress);
  const reviewCount = await itemContract.methods.reviewCount().call();

  let reviews = [];
  for (let i = 0; i < reviewCount; i++) {
    reviews.push(await itemContract.methods.reviews(i).call());
  }
  return reviews;
};

export const getAllRentalPeriodsForItem = async (itemContractAddress) => {
  const itemContract = await loadItemContract(itemContractAddress);
  const rentalContractCount = await itemContract.methods
    .rentalContractCount()
    .call();
  let rentalPeriods = [];
  for (let i = 0; i < rentalContractCount; i++) {
    rentalPeriods.push(await itemContract.methods.rentalPeriods(i).call());
  }
  return rentalPeriods;
};

export const getReviewForRental = async (
  itemContractAddress,
  rentalContractAddress
) => {
  const itemContract = await loadItemContract(itemContractAddress);
  const reviewCount = await itemContract.methods.reviewCount().call();
  for (let i = 0; i < reviewCount; i++) {
    let review = await itemContract.methods.reviews(i).call();
    if (review.rentalContract === rentalContractAddress) {
      return review;
    }
  }
  return null;
};

export const reviewItem = async (
  itemContractAddress,
  rentalContractAddress,
  renterUserContractAddress,
  renterEthAccountAddress,
  rate,
  review
) => {
  const itemContract = await loadItemContract(itemContractAddress);
  try {
    await itemContract.methods
      .inputReview(
        rentalContractAddress,
        renterUserContractAddress,
        rate,
        review
      )
      .send({ from: renterEthAccountAddress });
  } catch (err) {
    console.log("Error in review item: ", err);
  }
};
