export const validateRate = (rate) => {
  let errorMessage;
  if (!rate) {
    errorMessage = "Please select a rating";
    return { isValid: false, message: errorMessage };
  } else {
    return { isValid: true, message: null };
  }
};
