import { useState } from "react";
import styled from "styled-components";
import { validateImageUpload } from "../../formValidations/rental";
import { gweiToEth } from "../../helpers/mathUtils";
import { uploadOwnerProofOfTransferAndPayDeposit } from "../../services/contractServices/rentalContract";
import { uploadImageToIPFS } from "../../services/ipfsServices/uploadImage";

const Container = styled.div`
  width: 100%;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
  margin: 2% 0;
  width: 30%;
  border-radius: 5px;
  /* background-color: aliceblue; */
  background-color: rgba(240, 248, 255, 0.5);
  box-shadow: 1px 1px 5px 1px lightgray;
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

const FieldError = styled.span`
  color: var(--dark-blue);
  font-size: 14px;
  margin: 5px 0;
`;

const SubmitContainer = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
`;

const Error = styled.span`
  color: red;
  font-size: 14px;
  margin-left: 10px;
`;

const Button = styled.button`
  width: 15%;
  border: none;
  /* margin-top: 10px; */
  padding: 5px 10px;
  background-color: var(--dark-blue);
  color: white;
  cursor: pointer;
  border-radius: 5px;
  transition: all 0.15s ease-in-out;

  &:hover {
    transform: scale(1.03);
  }
`;

const ColoredText = styled.span`
  color: var(--dark-blue);
  margin: 0 5px;
`;

const UploadProofOfTransferAndPayDeposit = ({
  rentalContractAddress,
  ownerEthAccountAddress,
  depositInGwei,
  onUploadSuccess,
}) => {
  const [image, setImage] = useState();
  const [error, setErrorMessage] = useState("");
  const [uploadError, setUploadError] = useState(false);

  const handleImageUpload = (image) => {
    setImage(image);
    const { isValid, message } = validateImageUpload(image);
    if (!isValid) {
      setErrorMessage(message);
      return false;
    } else {
      setErrorMessage("");
      return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (handleImageUpload(image)) {
      const imageIpfsUrl = await uploadImageToIPFS(image);
      try {
        await uploadOwnerProofOfTransferAndPayDeposit(
          rentalContractAddress,
          ownerEthAccountAddress,
          imageIpfsUrl,
          depositInGwei
        );
        onUploadSuccess();
      } catch (err) {
        setUploadError(true);
        return;
      }
    } else {
      setUploadError(true);
      return;
    }
  };

  return (
    <Container>
      <div>
        Owner to upload proof of transfer and pay deposit of
        <ColoredText>{gweiToEth(depositInGwei)} ETH</ColoredText>
      </div>
      <InputContainer>
        <Uploader
          type="file"
          aria-label="File browser example"
          onChange={(e) => handleImageUpload(e.target.files[0])}
        />
        {error && <FieldError>{error}</FieldError>}
      </InputContainer>
      <SubmitContainer withMessage={error}>
        <Button onClick={handleSubmit}>Upload</Button>
        {uploadError && <Error>Unable to upload proof</Error>}
      </SubmitContainer>
    </Container>
  );
};

export default UploadProofOfTransferAndPayDeposit;
