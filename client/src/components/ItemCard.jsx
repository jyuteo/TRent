import { useEffect, useState } from "react";
import styled from "styled-components";
import { getItemDetails } from "../services/contractServices/itemContract";

const Container = styled.div`
  background-color: red;
  display: flex;
  flex-direction: column;
  height: 350px;
  border: 1px solid lightgray;
  border-radius: 5px;
  box-shadow: 1px 1px 2px 1px lightgray;
`;

const Image = styled.img`
  height: 250px;
  object-fit: contain;
`;

const InfoContainer = styled.div`
  height: 100px;
  padding: 10px;
  background-color: lightgray;
`;

const Name = styled.div`
  width: 280px;
  color: var(--dark-blue);
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ItemCard = ({ itemContractAddress, rating }) => {
  const [itemDetails, setItemDetails] = useState();

  useEffect(() => {
    getItemDetails(itemContractAddress).then((details) => {
      setItemDetails(details);
      console.log(details);
      console.log(rating);
    });
  }, []);

  return (
    <Container>
      {itemDetails && <Image src={itemDetails.imageIPFSUrl[0]} />}
      {itemDetails && (
        <InfoContainer>
          <Name>{itemDetails.name}</Name>
        </InfoContainer>
      )}
    </Container>
  );
};

export default ItemCard;
