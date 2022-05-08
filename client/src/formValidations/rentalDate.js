export const validateStartDate = (startDate) => {
  let errorMessage;
  if (!startDate) {
    errorMessage = "Please select start date";
    return { isValid: false, message: errorMessage };
  } else {
    const today = new Date().setHours(0, 0, 0, 0);
    if (startDate < today) {
      errorMessage = "Invalid date. Start date must be later than today";
      return { isValid: false, message: errorMessage };
    }
    return { isValid: true, message: null };
  }
};

export const validateEndDate = (startDate, endDate) => {
  let errorMessage;
  if (!startDate) {
    errorMessage = "Please select start date";
    return { isValid: false, message: errorMessage };
  } else if (!endDate) {
    errorMessage = "Please select end date";
    return { isValid: false, message: errorMessage };
  } else {
    if (endDate < startDate) {
      errorMessage = "Invalid date. End date must be later than start date";
      return { isValid: false, message: errorMessage };
    } else {
      return { isValid: true, message: null };
    }
  }
};
