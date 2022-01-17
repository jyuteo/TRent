import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import NewItemCreated from "../components/NewItemCreated";
import {
  validateAddress,
  validateDescription,
  validateImageUpload,
  validateItemName,
  validateRentalRate,
} from "../formValidations/listItem";
import { ethToGwei } from "../helpers/mathUtils";
import { createItemContract } from "../services/contractServices/itemContractCreator";
import { uploadImageToIPFS } from "../services/ipfsServices/uploadImage";

const Container = styled.div`
  width: 100%;
  height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Wrapper = styled.div`
  width: 30%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Title = styled.h1`
  font-style: 24px;
  font-weight: 300;
`;

const Form = styled.form``;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 2% 0;
`;

const FieldName = styled.span`
  font-size: 14px;
  margin: 5px 0px;
  padding: 0 1px;
  color: var(--dark-blue);
`;

const Input = styled.input`
  flex: 1;
  min-width: 40%;
  padding: 10px;

  &:focus {
    border: 2px solid var(--blue);
    outline: none;
  }
`;

const TextArea = styled.textarea`
  flex: 1;
  min-width: 40%;
  padding: 10px;

  &:focus {
    border: 2px solid var(--blue);
    outline: none;
  }
`;

const Uploader = styled.input`
  flex: 1;
  min-width: 40%;
  padding: 10px 0;
  color: grey;

  ::-webkit-file-upload-button {
    margin-right: 10px;
    cursor: pointer;
  }
`;

const SubmitContainer = styled.div`
  display: flex;
  justify-content: ${(props) => (props.withMessage ? "space-between" : "end")};
  align-items: center;
`;

const Button = styled.button`
  width: 20%;
  border: none;
  margin-top: 10px;
  padding: 10px 20px;
  background-color: var(--dark-blue);
  color: white;
  cursor: pointer;
  border-radius: 5px;
  float: right;

  &:hover {
    background-color: var(--blue);
  }
`;

const Error = styled.span`
  color: red;
  font-size: 14px;
  margin: 5px 0;
`;

const FieldError = styled.span`
  color: var(--blue);
  font-size: 14px;
  margin: 5px 0;
`;

const SuccessContainer = styled.div`
  position: fixed;
  top: 65px;
  width: 100%;
  height: 950px;
  display: ${(props) => (props.show ? "flex" : "none")};
  align-items: center;
  justify-content: center;
`;

const ListItem = () => {
  const [itemName, setItemName] = useState();
  const [description, setDescription] = useState();
  const [address, setAddress] = useState();
  const [rentalRate, setRentalRate] = useState();
  const [image, setImage] = useState();
  const [validationError, setValidationError] = useState();
  const [errors, setErrors] = useState({
    itemNameError: "",
    descriptionError: "",
    addressError: "",
    rentalRateError: "",
    imageUploadError: "",
  });
  const [createItemContractError, setCreateItemContractError] = useState();
  const [itemContractAddress, setItemContractAddress] = useState();

  const user = useSelector((state) => state.user.currentUser);

  const handleItemName = (itemName) => {
    setItemName(itemName);
    const { isValid, message } = validateItemName(itemName);
    if (!isValid) {
      setErrors({ ...errors, itemNameError: message });
      return false;
    } else {
      setErrors({ ...errors, itemNameError: "" });
      return true;
    }
  };

  const handleDescription = (description) => {
    setDescription(description);
    const { isValid, message } = validateDescription(description);
    if (!isValid) {
      setErrors({ ...errors, descriptionError: message });
      return false;
    } else {
      setErrors({ ...errors, descriptionError: "" });
      return true;
    }
  };

  const handleAddress = (address) => {
    setAddress(address);
    const { isValid, message } = validateAddress(address);
    if (!isValid) {
      setErrors({ ...errors, addressError: message });
      return false;
    } else {
      setErrors({ ...errors, addressError: "" });
      return true;
    }
  };

  const handleRentalRate = (rentalRate) => {
    setRentalRate(rentalRate);
    const { isValid, message } = validateRentalRate(rentalRate);
    if (!isValid) {
      setErrors({ ...errors, rentalRateError: message });
      return false;
    } else {
      setErrors({ ...errors, rentalRateError: "" });
      return true;
    }
  };

  const handleImageUpload = (image) => {
    setImage(image);
    const { isValid, message } = validateImageUpload(image);
    if (!isValid) {
      setErrors({ ...errors, imageUploadError: message });
      return false;
    } else {
      setErrors({ ...errors, imageUploadError: "" });
      return true;
    }
  };

  const validateForm = () => {
    return (
      handleItemName(itemName) &&
      handleDescription(description) &&
      handleAddress(address) &&
      handleRentalRate(rentalRate) &&
      handleImageUpload(image)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid) {
      setValidationError(false);
      const imageIpfsUrl = await uploadImageToIPFS(image);
      const rentalRateInGwei = ethToGwei(rentalRate);
      const newItemContractAddress = await createItemContract(
        user.userContractAddress,
        user.ethAccountAddress,
        itemName,
        description,
        address,
        rentalRateInGwei,
        [imageIpfsUrl]
      );
      if (!newItemContractAddress) {
        setCreateItemContractError(true);
        return;
      } else {
        setItemContractAddress(newItemContractAddress);
        console.log("[debug] newItemContractAddress: ", newItemContractAddress);
      }
    } else {
      setValidationError(true);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <Navbar />
      <Container>
        <Wrapper>
          <Title>LIST ITEM FOR RENT</Title>
          <Form>
            <InputContainer>
              <FieldName>Item name</FieldName>
              <Input
                placeholder="item name"
                onChange={(e) => handleItemName(e.target.value)}
              ></Input>
              {errors.itemNameError && (
                <FieldError>{errors.itemNameError}</FieldError>
              )}
            </InputContainer>
            <InputContainer>
              <FieldName>Description</FieldName>
              <TextArea
                placeholder="description"
                rows={5}
                onChange={(e) => handleDescription(e.target.value)}
              ></TextArea>
              {errors.descriptionError && (
                <FieldError>{errors.descriptionError}</FieldError>
              )}
            </InputContainer>
            <InputContainer>
              <FieldName>Collection and return address</FieldName>
              <TextArea
                placeholder="collection and return address"
                rows={5}
                onChange={(e) => handleAddress(e.target.value)}
              ></TextArea>
              {errors.addressError && (
                <FieldError>{errors.addressError}</FieldError>
              )}
            </InputContainer>
            <InputContainer>
              <FieldName>Daily rental rate (ETH)</FieldName>
              <Input
                placeholder="daily rental rate"
                onChange={(e) => handleRentalRate(e.target.value)}
              ></Input>
              {errors.rentalRateError && (
                <FieldError>{errors.rentalRateError}</FieldError>
              )}
            </InputContainer>
            <InputContainer>
              <FieldName>Upload an image for item</FieldName>
              <Uploader
                type="file"
                aria-label="File browser example"
                onChange={(e) => handleImageUpload(e.target.files[0])}
              />
              {errors.imageUploadError && (
                <FieldError>{errors.imageUploadError}</FieldError>
              )}
            </InputContainer>
            <SubmitContainer
              withMessage={validationError || createItemContractError}
            >
              {validationError && (
                <Error>Invalid details. Please try again</Error>
              )}
              {!validationError && createItemContractError && (
                <Error>Unable to create new item. Please try again</Error>
              )}
              <Button onClick={handleSubmit} disabled={itemContractAddress}>
                List Item
              </Button>
            </SubmitContainer>
          </Form>
        </Wrapper>
      </Container>
      <SuccessContainer show={itemContractAddress}>
        <NewItemCreated itemContractAddress={itemContractAddress} />
      </SuccessContainer>
    </div>
  );
};

export default ListItem;
