export const validateEthAccountAddress = (ethAccountAddress) => {
  let errorMessage;
  if (!ethAccountAddress) {
    errorMessage = "Please connect to Ethereum wallet";
    return { isValid: false, message: errorMessage };
  } else {
    return { isValid: true, message: null };
  }
};

export const validateUsername = (username) => {
  let errorMessage;
  if (!username) {
    errorMessage = "Please enter username";
    return { isValid: false, message: errorMessage };
  } else {
    return { isValid: true, message: null };
  }
};

export const validatePassword = (password) => {
  let errorMessage;
  if (!password) {
    errorMessage = "Please enter password";
    return { isValid: false, message: errorMessage };
  } else {
    return { isValid: true, message: null };
  }
};

export const validateConfirmPassword = (password, confirmPassword) => {
  let errorMessage;
  if (password !== confirmPassword) {
    errorMessage = "Passwords are not matching";
    return { isValid: false, message: errorMessage };
  } else {
    return { isValid: true, message: null };
  }
};

export const validateShippingAddress = (shippingAddress) => {
  let errorMessage;
  if (!shippingAddress) {
    errorMessage = "Please enter shipping address";
    return { isValid: false, message: errorMessage };
  } else {
    return { isValid: true, message: null };
  }
};
