import { useState } from "react";
import styled from "styled-components";
import { validateRate } from "../../formValidations/inputReview";
import { reviewItem } from "../../services/contractServices/itemContract";

const Container = styled.div`
  width: 100%;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
  margin: 2% 0;
  width: 60%;
  border-radius: 5px;
  background-color: rgba(240, 248, 255, 0.5);
  box-shadow: 1px 1px 5px 1px lightgray;
`;

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
    border: ${(props) =>
      props.field !== "wallet" && "1px solid var(--dark-blue)"};
    outline: none;
  }
`;

const RatesContainer = styled.div`
  flex: 4;
  display: flex;
  align-items: center;
  margin-top: 1%;
`;

const RateButton = styled.div`
  background-color: ${(props) =>
    props.selected ? "rgba(63, 187, 226, 0.2)" : "white"};
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid var(--dark-blue);
  margin: 0 1%;
  cursor: pointer;
  transition: all 0.15s ease-in-out;

  &:hover {
    background-color: rgba(63, 187, 226, 0.2);
    transform: scale(1.05);
  }
`;

const SubmitContainer = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  margin: 1% 0;
`;

const Error = styled.span`
  color: red;
  font-size: 14px;
  margin-left: 15px;
`;

const Button = styled.button`
  width: 30%;
  border: none;
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

const InputReview = ({ rentalDetails, onReviewSuccess }) => {
  const [review, setReview] = useState("");
  const [rate, setRate] = useState();
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const { isValid, message } = validateRate(rate);
    if (!isValid) {
      setError(message);
      return false;
    } else {
      setError("");
      try {
        await reviewItem(
          rentalDetails.itemContractAddress,
          rentalDetails.rentalContractAddress,
          rentalDetails.renterUserContractAddress,
          rentalDetails.renterEthAccountAddress,
          rate,
          review
        );
        onReviewSuccess();
      } catch (err) {
        console.log(err);
        return false;
      }
      return true;
    }
  };

  return (
    <Container>
      <div>Renter to rate and review item</div>
      <InnerContainer>
        <InputContainer>
          <FieldName>Add rating</FieldName>
          <RatesContainer>
            <RateButton selected={rate === 1} onClick={(e) => setRate(1)}>
              1
            </RateButton>
            <RateButton selected={rate === 2} onClick={(e) => setRate(2)}>
              2
            </RateButton>
            <RateButton selected={rate === 3} onClick={(e) => setRate(3)}>
              3
            </RateButton>
            <RateButton selected={rate === 4} onClick={(e) => setRate(4)}>
              4
            </RateButton>
            <RateButton selected={rate === 5} onClick={(e) => setRate(5)}>
              5
            </RateButton>
          </RatesContainer>
        </InputContainer>
        <InputContainer>
          <FieldName>Add review</FieldName>
          <Input
            placeholder="review"
            onChange={(e) => setReview(e.target.value)}
          ></Input>
        </InputContainer>
        <SubmitContainer withMessage={error}>
          <Button onClick={handleSubmit}>Add rating</Button>
          {error && <Error>{error}</Error>}
        </SubmitContainer>
      </InnerContainer>
    </Container>
  );
};

export default InputReview;
