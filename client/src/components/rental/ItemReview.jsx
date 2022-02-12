import moment from "moment";
import styled from "styled-components";
import RatingStars from "../RatingStars";
import InputReview from "./InputReview";

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
`;

const Left = styled.div`
  width: 20%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-radius: 5px;
  border: 1px solid var(--dark-blue);
  box-shadow: 1px 1px 3px 0px grey;
  background-color: ${(props) =>
    props.type === "inactive" ? "#efefef" : "white"};
  text-overflow: ellipsis;
  overflow: hidden;
`;

const Right = styled.div`
  width: 70%;
  display: flex;
  flex-direction: column;
  justify-content: left;
  padding: 20px;
  border-radius: 5px;
  border: ${(props) =>
    props.type === "active"
      ? "1px solid var(--blue)"
      : "1px solid var(--dark-blue)"};
  box-shadow: ${(props) =>
    props.type === "active"
      ? "1px 0px 3px 1px var(--blue)"
      : "1px 1px 3px 0px grey"};
  /* border: 1px solid var(--dark-blue);
  box-shadow: 1px 1px 3px 0px grey; */
  background-color: ${(props) =>
    props.type === "inactive" ? "#efefef" : "white"};
  text-overflow: ellipsis;
  overflow: hidden;
`;

const RatingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  margin: 2% 0;
  width: 20%;
  border-radius: 5px;
  background-color: rgba(240, 248, 255, 0.5);
  box-shadow: 1px 1px 5px 1px lightgray;
`;

const ReviewContainer = styled.textarea`
  display: flex;
  flex-direction: column;
  padding: 10px;
  margin: 2% 0;
  width: 60%;
  border-radius: 5px;
  border: none;
  background-color: rgba(240, 248, 255, 0.5);
  box-shadow: 1px 1px 5px 1px lightgray;
  resize: none;
  font-size: 16px;

  &:focus {
    outline: none;
  }
`;

const ItemReview = ({ review, rentalDetails, onReviewSuccess }) => {
  return review ? (
    <Container>
      <Left>{moment.unix(review.time).format("DD-MMM-YYYY, hh:mm A")}</Left>
      <Right>
        <div>Rating</div>
        <RatingContainer>
          <RatingStars rating={parseInt(review.rate)} fontSize={28} />
        </RatingContainer>
        <div>Review</div>
        <ReviewContainer readOnly={true} defaultValue={review.review} />
      </Right>
    </Container>
  ) : (
    <Container>
      <Left>N/A</Left>
      {parseInt(rentalDetails.role) === 1 &&
      parseInt(rentalDetails.rentalStatus) === 3 ? (
        <Right type="active">
          <InputReview
            rentalDetails={rentalDetails}
            onReviewSuccess={onReviewSuccess}
          />
        </Right>
      ) : (
        <Right type="inactive">Renter to rate and review item</Right>
      )}
    </Container>
  );
};

export default ItemReview;
