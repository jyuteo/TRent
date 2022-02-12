import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import RentalItemCard from "../components/RentalItemCard";
import { getRentalDetailsFromRentalHistories } from "../services/contractServices/userContract";

const MainContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Container = styled.div`
  width: 95%;
  margin: 2%;
  padding: 5px 20px;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 300;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin: 10px 0;
  /* background-color: blue; */
`;

const Left = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  width: 45%;
  padding: 1%;
  /* background-color: blue; */
`;

const Right = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  width: 45%;
  padding: 1%;
`;

const ColumnTitle = styled.div`
  font-size: 20px;
  font-weight: 300;
  color: var(--dark-blue);
  margin-bottom: 2%;
`;

const NoItem = styled.div`
  width: 95%;
  padding: 2%;
  height: 120px;
  color: var(--dark-blue);
  background-color: #efefef;
  border: 1px solid lightgray;
  border-radius: 5px;
  box-shadow: 1px 2px 3px 1px lightgray;
  overflow: hidden;
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
`;

const MyRentals = () => {
  const user = useSelector((state) => state.user.currentUser);
  const [rentalsAsOwner, setRentalsAsOwner] = useState([]);
  const [rentalsAsRenter, setRentalsAsRenter] = useState([]);

  useEffect(() => {
    getRentalDetailsFromRentalHistories(user.userContractAddress).then(
      ({ rentalsAsOwner, rentalsAsRenter }) => {
        setRentalsAsOwner(rentalsAsOwner);
        setRentalsAsRenter(rentalsAsRenter);
        // console.log(rentalsAsOwner);
        // console.log(rentalsAsRenter);
      }
    );
  }, []);

  return (
    <MainContainer>
      <Navbar />
      <Container>
        <Title>MY RENTALS</Title>
        <Wrapper>
          <Left>
            <ColumnTitle>Rentals as Renter</ColumnTitle>
            {rentalsAsRenter.length > 0 ? (
              rentalsAsRenter.map((rentalDetails, i) => {
                return <RentalItemCard key={i} rentalDetails={rentalDetails} />;
              })
            ) : (
              <NoItem>No item to show</NoItem>
            )}
          </Left>
          <Right>
            <ColumnTitle>Rentals as Owner</ColumnTitle>
            {rentalsAsOwner.length > 0 ? (
              rentalsAsOwner.map((rentalDetails, i) => {
                return <RentalItemCard key={i} rentalDetails={rentalDetails} />;
              })
            ) : (
              <NoItem>No item to show</NoItem>
            )}
          </Right>
        </Wrapper>
      </Container>
    </MainContainer>
  );
};

export default MyRentals;
