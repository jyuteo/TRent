export const validateItemName = (itemName) => {
  let errorMessage;
  if (!itemName) {
    errorMessage = "Please enter item name";
    return { isValid: false, message: errorMessage };
  } else {
    return { isValid: true, message: null };
  }
};

export const validateDescription = (description) => {
  let errorMessage;
  if (!description) {
    errorMessage = "Please enter description";
    return { isValid: false, message: errorMessage };
  } else {
    return { isValid: true, message: null };
  }
};

export const validateAddress = (address) => {
  let errorMessage;
  if (!address) {
    errorMessage = "Please enter address";
    return { isValid: false, message: errorMessage };
  } else {
    return { isValid: true, message: null };
  }
};

export const validateDeposit = (deposit) => {
  let errorMessage;
  const regex = /^\d+\.?\d*$/;
  if (!deposit) {
    errorMessage = "Please enter deposit";
    return { isValid: false, message: errorMessage };
  } else if (!regex.test(deposit)) {
    errorMessage = "Invalid deposit value";
    return { isValid: false, message: errorMessage };
  } else {
    return { isValid: true, message: null };
  }
};

export const validateRentalRate = (rentalRate) => {
  let errorMessage;
  const regex = /^\d+\.?\d{0,4}$/;

  let decimalPlaces;
  if (rentalRate.indexOf(".") > -1) {
    decimalPlaces = rentalRate.split(".")[1];
  }
  if (!rentalRate) {
    errorMessage = "Please enter daily rental rate";
    return { isValid: false, message: errorMessage };
  } else if (!regex.test(rentalRate)) {
    if (decimalPlaces && decimalPlaces.length > 4) {
      errorMessage = "Please only enter up to 4 decimal places";
    } else {
      errorMessage = "Invalid daily rental rate value";
    }
    return { isValid: false, message: errorMessage };
  } else {
    return { isValid: true, message: null };
  }
};

export const validateImageUpload = (image) => {
  let errorMessage;
  if (!image) {
    errorMessage = "Please upload item image";
    return { isValid: false, message: errorMessage };
  } else {
    return { isValid: true, message: null };
  }
};
