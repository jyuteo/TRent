import styled from "styled-components";
import RatingStars from "./RatingStars";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 95%;
  min-height: 80px;
  margin: 1% 0;
  padding: 10px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 1px 1px 5px 1px #ccc;
  overflow: hidden;
  scrollbar-width: none;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const Address = styled.div`
  color: var(--dark-blue);
  font-size: 14px;
  margin: 10px 0 5px 0;
`;

const Review = styled.textarea`
  resize: none;
  border: none;
  font-size: 14px;
  padding: 5px 0;
  text-overflow: ellipsis;
  scrollbar-width: none;

  &:focus {
    outline: none;
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: lightgray;
    border-radius: 20px;
    border: 2px solid white;
  }
`;

const ReviewCard = ({ review }) => {
  return (
    <Container>
      <Row>
        <Address>{review.raterUserContract}</Address>
        <div>
          <RatingStars rating={parseInt(review.rate)} fontSize={16} />
        </div>
      </Row>
      <Review readOnly={true} defaultValue={review.review} />
    </Container>
  );
};

export default ReviewCard;
