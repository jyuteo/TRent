import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import NewRentalCreated from "../components/NewRentalCreated";
import RatingStars from "../components/RatingStars";
import ReviewCard from "../components/ReviewCard";
import {
  validateEndDate,
  validateStartDate,
} from "../formValidations/rentalDate";
import {
  calculateCalanderDaysBetween,
  calculateDeposit,
  ethToGwei,
  gweiToEth,
} from "../helpers/mathUtils";
import {
  getAllRentalPeriodsForItem,
  getItemDetails,
  getItemRating,
  getItemReviews,
  getItemStatus,
} from "../services/contractServices/itemContract";
import { createRentalContract } from "../services/contractServices/rentalContractCreator";

const Container = styled.div`
  width: 100%;
`;

const Wrapper = styled.div`
  width: 95%;
  margin: 2%;
  padding: 5px 20px;
`;

const Title = styled.span`
  font-size: 24px;
  font-weight: 500;
  color: var(--dark-blue);
  margin-bottom: 5px;
`;

const DetailsContainer = styled.div`
  display: flex;
  margin: 1% 0;
`;

const Left = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  max-width: 30%;
  box-shadow: 1px 1px 5px 1px grey;
  /* background-color: blue; */
`;

const Image = styled.img`
  flex: 1.5;
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const LeftBottom = styled.div`
  flex: 3;
  display: flex;
  flex-direction: column;
  width: 90%;
  /* max-height: 100px; */
  /* overflow-y: scroll; */
  padding: 5%;
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
`;

const ReviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  margin-top: 5px;
  padding: 1px 2px 1px 2px;
  max-height: 500px;
  width: 100%;
  overflow-y: scroll;
  overflow-x: visible;
  /* background-color: #efefef; */
  border-radius: 10px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: lightgray;
    border-radius: 20px;
    border: 2px solid white;
  }
`;

const NoReview = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 95%;
  min-height: 80px;
  margin-top: 10px 0;
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 5px;
  box-shadow: 1px 1px 5px 1px #ccc;
  overflow: hidden;
`;

const FieldTitle = styled.span`
  color: var(--blue);
  font-weight: 500;
  font-size: 20px;
  margin-right: 20px;
`;

const Right = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  /* background-color: green; */
  max-width: 60%;
  margin-left: 2%;
`;

const RightUpper = styled.div`
  /* flex: 1; */
  display: flex;
  width: 90%;
  padding: 0 5% 20px 5%;
  flex-direction: column;
  /* background-color: red; */
`;

const DetailsTable = styled.table`
  border-spacing: 0 25px;
`;

const DetailsTableBody = styled.tbody``;

const DetailsRow = styled.tr``;

const DetailsName = styled.td`
  color: var(--blue);
  font-weight: 500;
  font-size: 20px;
`;

const Details = styled.td`
  color: var(--dark-blue);
  font-weight: 500;
  font-size: 18px;
`;

const Description = styled.textarea`
  width: 100%;
  height: 150px;
  padding: 12px 10px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f8f8f8;
  font-size: 18px;
  resize: none;
  color: var(--dark-blue);

  &:focus {
    outline: none;
  }
`;

const Divider = styled.hr`
  background-color: #ccc;
  border-width: 0px;
  height: 2px;
`;

const RightBottom = styled.div`
  flex: 1;
  display: flex;
  width: 90%;
  padding: 0 5% 20px 5%;
  flex-direction: column;
  /* background-color: red; */
`;

const UnableToRentNotice = styled.div`
  width: 90%;
  background-color: #f8f8f8;
  border-radius: 5px;
  box-shadow: 1px 1px 5px 1px #ccc;
  padding: 5%;
  margin-top: 10px;
  text-align: center;
`;

const RentContainer = styled.div`
  display: flex;
  height: 100%;
`;

const RentLeft = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  /* background-color: green; */
`;

const RentRight = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  /* background-color: blue; */
  margin-left: 5%;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const RentFieldRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 25px;
`;

const RentFieldName = styled.div`
  flex: 3;
  color: ${(props) =>
    props.type === "date" ? "var(--blue)" : "var(--dark-blue)"};
  font-weight: 500;
  font-size: 20px;
`;

const Fees = styled.div`
  flex: 2;
  padding: 5px 10px;
  box-sizing: border-box;
  border: 2px solid #ccc;
  border-radius: 5px;
  background-color: #f8f8f8;
  font-size: 16px;
  text-align: right;
`;

const Eth = styled.span`
  flex: 0.5;
  color: var(--dark-blue);
  margin-left: 10px;
`;

const Input = styled.input`
  padding: 5px 10px;
`;

const SubmitContainer = styled.div`
  display: flex;
  justify-content: ${(props) => (props.withMessage ? "space-between" : "end")};
  align-items: center;
  width: 100%;
  margin-top: 10%;
`;

const Button = styled.button`
  width: 40%;
  border: none;
  margin: 10px 0;
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

const Error = styled.div`
  color: red;
  font-size: 14px;
  margin: 5px 0;
  width: 50%;
  text-align: right;
`;

const FieldError = styled.span`
  color: red;
  font-size: 14px;
  margin: 10px 0;
`;

const SuccessContainer = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  display: ${(props) => (props.show ? "flex" : "none")};
  align-items: center;
  justify-content: center;
`;

// const testReview = [
//   {
//     review: "ksvkvhbfdjkhvbdfkjvbfdhjkvbdfkjvbdfjkvbdf",
//     raterUserContract: "er3u2894u3242342508294209423424",
//     rate: "1",
//   },
//   {
//     review: "ksvkvhbfdjkhvbdfkjvbfdhjkvbdfkjvbdfjkvbdf",
//     raterUserContract: "er3u2894u3242342508294209423424",
//     rate: "2",
//   },
//   {
//     review: "ksvkvhbfdjkhvbdfkjvbfdhjkvbdfkjvbdfjkvbdf",
//     raterUserContract: "er3u2894u3242342508294209423424",
//     rate: "3",
//   },
//   {
//     review:
//       "ksvkvhbfdjkhvbdfkjvbfdhjkvbdfkjvbdfjkvdfvdfvfdvfdvdfvdfvdfvdfvfdvdfvdfvdfvdfvdfvdfvfvfvbdf",
//     raterUserContract: "er3u2894u3242342508294209423424",
//     rate: "4",
//   },
//   {
//     review:
//       "ksvkvhbfdjkhvbdfkjvbfdhjkvbdfkjvbdfjkvfdvdfvfdvdfvdfavdfvfdvdfvfdbfadbadfbfdbdfabdbdfbdfbadfbfdbadfbadfbfdbdfbdfbfdbfdbfdbfbfdbfdbdfbfdbdfbfdbdfbdfdbabadbadfbbdf",
//     raterUserContract: "er3u2894u3242342508294209423424",
//     rate: "5",
//   },
//   {
//     review:
//       "ksvkvhbfdjkhvbdfkjvbfdhjkvbdfkjvbdfjkvdfvdfvfdvfdvdfvdfvdfvdfvfdvdfvdfvdfvdfvdfvdfvfvfvbdf",
//     raterUserContract: "er3u2894u3242342508294209423424",
//     rate: "4",
//   },
//   {
//     review:
//       "ksvkvhbfdjkhvbdfkjvbfdhjkvbdfkjvbdfjkvfdvdfvfdvdfvdfavdfvfdvdfvfdbfadbadfbfdbdfabdbdfbdfbadfbfdbadfbadfbfdbdfbdfbfdbfdbfdbfbfdbfdbdfbfdbdfbfdbdfbdfdbabadbadfbbdf",
//     raterUserContract: "er3u2894u3242342508294209423424",
//     rate: "5",
//   },
// ];

const Item = () => {
  const user = useSelector((state) => state.user.currentUser);

  const { itemContractAddress } = useParams();
  const [itemDetails, setItemDetails] = useState();
  const [itemStatus, setItemStatus] = useState();
  const [rating, setRating] = useState(-1);
  const [reviews, setReviews] = useState([]);
  const [rentalPeriods, setRentalPeriods] = useState();

  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [errors, setErrors] = useState({
    startDateError: "",
    endDateError: "",
  });
  const [submitError, setSubmitError] = useState();

  const [rentalFeesPayable, setRentalFeesPayable] = useState("0");
  const [deposit, setDeposit] = useState("0");

  const [createRentalContractError, setCreateRentalContractError] = useState();
  const [rentalContractAddress, setRentalContractAddress] = useState();

  useEffect(() => {
    if (itemContractAddress) {
      getItemDetails(itemContractAddress).then((itemDetails) => {
        setItemDetails(itemDetails);
      });
      getItemRating(itemContractAddress).then((rate) => {
        setRating(rate);
      });
      getItemStatus(itemContractAddress).then((itemStatus) => {
        setItemStatus(parseInt(itemStatus));
      });
      getItemReviews(itemContractAddress).then((reviews) => {
        setReviews(reviews);
      });
      getAllRentalPeriodsForItem(itemContractAddress).then((rentalPeriods) => {
        setRentalPeriods(rentalPeriods);
      });
    }
  }, [itemContractAddress]);

  const handleStartDate = (startDate) => {
    // startDate: YYYY-MM-DD
    const startEpochTime = new Date(startDate).setHours(0, 0, 0, 0);
    setStartDate(startEpochTime);
    const { isValid, message } = validateStartDate(startEpochTime);
    if (!isValid) {
      setErrors({ ...errors, startDateError: message });
      return false;
    } else {
      setErrors({ ...errors, startDateError: "" });
      return true;
    }
  };

  const handleEndDate = (startEpochTime, endDate) => {
    const endEpochTime = new Date(endDate).setHours(0, 0, 0, 0);
    setEndDate(endEpochTime);
    const { isValid, message } = validateEndDate(startEpochTime, endEpochTime);
    if (!isValid) {
      setErrors({ ...errors, endDateError: message });
      return false;
    } else {
      const { isAvailable, message } = validateRentalPeriods(
        startEpochTime,
        endDate
      );
      if (!isAvailable) {
        setErrors({
          startDateError: message,
          endDateError: message,
        });
        return false;
      } else {
        setErrors({ ...errors, endDateError: "" });
        return true;
      }
    }
  };

  const validateDates = () => {
    return handleStartDate(startDate) && handleEndDate(startDate, endDate);
  };

  const validateRentalPeriods = (start, end) => {
    if (rentalPeriods.length > 0) {
      for (const rentalPeriod of rentalPeriods) {
        if (
          Math.max(start, rentalPeriod.start) <= Math.min(end, rentalPeriod.end)
        ) {
          return {
            isAvaliable: false,
            message: "Selected date is not available for rent.",
          };
        }
      }
      return { isAvailable: true, message: "" };
    } else {
      return { isAvailable: true, message: "" };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateDates();
    if (isValid) {
      setSubmitError(false);
      const rentalFeesPayableInGwei = ethToGwei(rentalFeesPayable);
      const depositInGwei = ethToGwei(deposit);
      const newRentalContractAddress = await createRentalContract(
        itemContractAddress,
        itemDetails,
        user.userContractAddress,
        user.ethAccountAddress,
        rentalFeesPayableInGwei,
        depositInGwei,
        startDate,
        endDate
      );
      if (!newRentalContractAddress) {
        setCreateRentalContractError(true);
        return;
      } else {
        setRentalContractAddress(newRentalContractAddress);
        console.log(
          "[debug] newRentalContractAddress: ",
          newRentalContractAddress
        );
      }
    } else {
      setSubmitError(true);
    }
    return;
  };

  useEffect(() => {
    if (itemDetails && validateDates()) {
      const rentalDays = calculateCalanderDaysBetween(startDate, endDate);
      const rentalFeesPayable = parseFloat(
        rentalDays * gweiToEth(itemDetails.rentPerDay)
      ).toFixed(5);
      const deposit = parseFloat(calculateDeposit(rentalFeesPayable)).toFixed(
        5
      );
      setRentalFeesPayable(rentalFeesPayable);
      setDeposit(deposit);
    } else {
      setRentalFeesPayable("0");
      setDeposit("0");
    }
  }, [startDate, endDate]);

  return (
    <div>
      <Container>
        <Navbar />
        {itemDetails && rating >= 0 && (
          <Wrapper>
            <Title>{itemDetails.name}</Title>
            <DetailsContainer>
              <Left>
                <Image src={itemDetails.imageIPFSUrl} />
                <LeftBottom>
                  <RatingContainer>
                    <FieldTitle>RATINGS</FieldTitle>
                    <RatingStars rating={rating} fontSize={25} />
                  </RatingContainer>
                  <RatingContainer>
                    <FieldTitle>REVIEWS</FieldTitle>
                  </RatingContainer>
                  <ReviewContainer>
                    {reviews.length > 0 ? (
                      reviews.map((review, i) => {
                        return <ReviewCard key={i} review={review} />;
                      })
                    ) : (
                      <NoReview>No review</NoReview>
                    )}
                  </ReviewContainer>
                </LeftBottom>
              </Left>
              <Right>
                <RightUpper>
                  <DetailsTable>
                    <DetailsTableBody>
                      <DetailsRow>
                        <DetailsName>Item contract address</DetailsName>
                        <Details>{itemContractAddress}</Details>
                      </DetailsRow>
                      <DetailsRow>
                        <DetailsName>Description</DetailsName>
                        <Details>
                          <Description
                            readOnly={true}
                            defaultValue={itemDetails.description}
                          />
                        </Details>
                      </DetailsRow>
                      <DetailsRow>
                        <DetailsName>Owner user contract</DetailsName>
                        <Details>{itemDetails.ownerUserContract}</Details>
                      </DetailsRow>
                      <DetailsRow>
                        <DetailsName>Daily rental rate</DetailsName>
                        <Details>{`${gweiToEth(
                          itemDetails.rentPerDay
                        )} ETH`}</Details>
                      </DetailsRow>
                    </DetailsTableBody>
                  </DetailsTable>
                </RightUpper>
                <RightBottom>
                  <Title>TO RENT</Title>
                  <Divider />
                  {itemDetails.ownerUserContract ===
                  user.userContractAddress ? (
                    <UnableToRentNotice>
                      You are the owner of the item
                    </UnableToRentNotice>
                  ) : itemStatus === 2 ? (
                    <UnableToRentNotice>
                      Unable to rent <br />
                      Item not returned by renter
                    </UnableToRentNotice>
                  ) : (
                    <RentContainer>
                      <RentLeft>
                        <InputContainer>
                          <RentFieldRow>
                            <RentFieldName>Start date</RentFieldName>
                            <Input
                              type="date"
                              onChange={(e) => handleStartDate(e.target.value)}
                            ></Input>
                          </RentFieldRow>
                          {errors.startDateError && (
                            <FieldError>{errors.startDateError}</FieldError>
                          )}
                        </InputContainer>
                        <InputContainer>
                          <RentFieldRow>
                            <RentFieldName>End date</RentFieldName>
                            <Input
                              type="date"
                              onChange={(e) =>
                                handleEndDate(startDate, e.target.value)
                              }
                            ></Input>
                          </RentFieldRow>
                          {errors.endDateError && (
                            <FieldError>{errors.endDateError}</FieldError>
                          )}
                        </InputContainer>
                      </RentLeft>
                      <RentRight>
                        <RentFieldRow>
                          <RentFieldName>Rental fees payable</RentFieldName>
                          <Fees>{rentalFeesPayable}</Fees>
                          <Eth>ETH</Eth>
                        </RentFieldRow>
                        <RentFieldRow>
                          <RentFieldName>Deposit</RentFieldName>
                          <Fees>{deposit}</Fees>
                          <Eth>ETH</Eth>
                        </RentFieldRow>
                        <RentFieldRow>
                          <SubmitContainer
                            withMessage={
                              submitError || createRentalContractError
                            }
                          >
                            {(submitError || createRentalContractError) && (
                              <Error>Unable to create rental contract</Error>
                            )}
                            <Button onClick={handleSubmit}>
                              Confirm & pay deposit
                            </Button>
                          </SubmitContainer>
                        </RentFieldRow>
                      </RentRight>
                    </RentContainer>
                  )}
                </RightBottom>
              </Right>
            </DetailsContainer>
          </Wrapper>
        )}
      </Container>
      <SuccessContainer show={rentalContractAddress}>
        <NewRentalCreated rentalContractAddress={rentalContractAddress} />
      </SuccessContainer>
    </div>
  );
};

export default Item;
