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
  const regex = /^\d+\.?\d*$/;
  if (!rentalRate) {
    errorMessage = "Please enter daily rental rate";
    return { isValid: false, message: errorMessage };
  } else if (!regex.test(rentalRate)) {
    errorMessage = "Invalid daily rental rate value";
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
