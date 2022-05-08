import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { gweiToEth } from "../helpers/mathUtils";
import { getItemRating } from "../services/contractServices/itemContract";
import RatingStars from "./RatingStars";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 350px;
  border: 1px solid lightgray;
  border-radius: 5px;
  box-shadow: 1px 2px 3px 1px lightgray;
  cursor: pointer;
  overflow: hidden;

  &:hover {
    box-shadow: 1px 1px 10px 0px darkgrey;
  }
`;

const Image = styled.img`
  min-height: 250px;
  height: 250px;
  object-fit: contain;
`;

const InfoContainer = styled.div`
  height: 100px;
  padding: 10px;
  background-color: #efefef;
`;

const Name = styled.div`
  width: 280px;
  font-size: 18px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--dark-blue);
`;

const RentContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 10px 0;
`;

const FieldTitle = styled.div`
  color: var(--blue);
  font-size: 16px;
  font-weight: 500;
`;

const RentalRate = styled.div`
  color: var(--dark-blue);
  font-size: 16px;
  font-weight: 500;
  margin-left: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
`;

// const Button = styled.div`
//   flex: 3;
//   background-color: var(--dark-blue);
//   color: white;
//   border-radius: 5px;
//   padding: 2px 5px;
//   text-align: center;
//   cursor: pointer;

//   &:hover {
//     background-color: var(--blue);
//   }
// `;

const ItemCard = ({ itemDetails, itemContractAddress }) => {
  const [rating, setRating] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    let isSubscribed = true;
    if (itemContractAddress) {
      getItemRating(itemContractAddress).then((rate) => {
        if (isSubscribed) {
          setRating(rate);
        }
      });
    }
    return () => {
      isSubscribed = false;
    };
  }, []);

  const handleClick = (e) => {
    navigate(`/item/${itemContractAddress}`);
  };

  return (
    <Container onClick={handleClick}>
      {itemDetails && <Image src={itemDetails.imageIPFSUrl[0]} />}
      {itemDetails && (
        <InfoContainer>
          <Name>{itemDetails.name}</Name>
          <RentContainer>
            <FieldTitle>DAILY RATE:</FieldTitle>
            <RentalRate>{`${gweiToEth(
              itemDetails.rentPerDay
            )} ETH`}</RentalRate>
          </RentContainer>
          <RatingContainer>
            <RatingStars rating={rating} />
          </RatingContainer>
        </InfoContainer>
      )}
    </Container>
  );
};

export default ItemCard;
