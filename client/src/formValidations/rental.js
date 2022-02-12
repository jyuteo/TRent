export const validateImageUpload = (image) => {
  let errorMessage;
  if (!image) {
    errorMessage = "Please upload an image for the proof";
    return { isValid: false, message: errorMessage };
  } else {
    return { isValid: true, message: null };
  }
};
