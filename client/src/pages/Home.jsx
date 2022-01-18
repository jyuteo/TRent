import { useEffect, useState } from "react";
import styled from "styled-components";
import ItemCard from "../components/ItemCard";
import Navbar from "../components/Navbar";
import { getAllItemContracts } from "../services/contractServices/itemContractCreator";

const MainContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Container = styled.div`
  width: 95%;
  margin: 2% 5%;
  padding: 5px 20px;
  display: flex;
  flex-direction: column;
  /* align-items: center; */
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 300;
`;

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin: 10px 0;
`;

const ItemContainer = styled.div`
  margin: 30px 0;
  margin-right: 35px;
  width: 300px;
  height: 350px;
  background-color: blue;
`;

const Home = () => {
  const [itemContracts, setItemContracts] = useState();

  useEffect(() => {
    getAllItemContracts().then((allItemContracts) => {
      setItemContracts(allItemContracts);
    });
  }, []);

  return (
    <MainContainer>
      <Navbar />
      <Container>
        <Title>ITEMS FOR RENT</Title>
        <Wrapper>
          {itemContracts && (
            <ItemContainer>
              <ItemCard itemContractAddress={itemContracts[0]} rating={6} />
            </ItemContainer>
          )}
          <ItemContainer>fwefew</ItemContainer>
          <ItemContainer>fwefew</ItemContainer>
          <ItemContainer>fwefwe</ItemContainer>
          <ItemContainer>fwefew</ItemContainer>
          <ItemContainer>fwefew</ItemContainer>
          <ItemContainer>fwefew</ItemContainer>
          <ItemContainer>fwefew</ItemContainer>
        </Wrapper>
      </Container>
    </MainContainer>
  );
};

export default Home;
