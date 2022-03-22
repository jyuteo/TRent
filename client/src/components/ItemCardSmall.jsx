import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { gweiToEth } from "../helpers/mathUtils";
import { getItemRating } from "../services/contractServices/itemContract";
import RatingStars from "./RatingStars";

const Container = styled.div`
  width: 95%;
  padding: 2%;
  height: 120px;
  border: 1px solid lightgray;
  border-radius: 5px;
  box-shadow: 1px 2px 3px 1px lightgray;
  overflow: hidden;
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  &:hover {
    box-shadow: 1px 1px 10px 0px darkgrey;
  }
`;

const Image = styled.img`
  height: 120px;
  width: 22%;
  object-fit: contain;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 120px;
  height: 120px;
  object-fit: contain;
  margin-left: 20px;
  width: 75%;
`;

const NameRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const Name = styled.div`
  width: 450px;
  font-size: 18px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--dark-blue);
`;

const FieldName = styled.span`
  flex: 3;
  color: var(--blue);
  margin-right: 20px;
`;

const Field = styled.div`
  flex: 7;
`;

const LinkRow = styled.div`
  flex: 7;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Link = styled.div`
  color: grey;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ItemCardSmall = ({ itemDetails, itemContractAddress }) => {
  const navigate = useNavigate();
  const [rating, setRating] = useState();

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
    <Container>
      <Image src={itemDetails.imageIPFSUrl[0]} />
      <InfoContainer>
        <NameRow>
          <Name>{itemDetails.name}</Name>
        </NameRow>
        <InfoRow>
          <FieldName>RATING</FieldName>
          <Field>
            <RatingStars rating={rating} />
          </Field>
        </InfoRow>
        <InfoRow>
          <FieldName>DAILY RENTAL RATE</FieldName>
          <LinkRow>
            <Field>{`${gweiToEth(itemDetails.rentPerDay)} ETH`}</Field>
            <Link onClick={handleClick}>View item</Link>
          </LinkRow>
        </InfoRow>
      </InfoContainer>
    </Container>
  );
};

export default ItemCardSmall;
