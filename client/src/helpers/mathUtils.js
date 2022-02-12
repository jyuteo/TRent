export const ethToGwei = (ethValue) => {
  return ethValue * 10 ** 9;
};

export const gweiToEth = (gweiValue) => {
  return gweiValue / 10 ** 9;
};

export const gweiToWei = (gweiValue) => {
  return gweiValue * 10 ** 9;
};

export const calculateCalanderDaysBetween = (startEpochTime, endEpochTime) => {
  return 1 + Math.ceil((endEpochTime - startEpochTime) / 1000 / 60 / 60 / 24);
};

export const calculateDeposit = (rentalFeesPayable) => {
  // in eth
  return rentalFeesPayable / 2.0;
};
