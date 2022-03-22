import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import styled from "styled-components";
import ItemCardSmall from "../components/ItemCardSmall";
import Navbar from "../components/Navbar";
import RentalItemCard from "../components/RentalItemCard";
import { getItemDetails } from "../services/contractServices/itemContract";
import { getAllItemContracts } from "../services/contractServices/itemContractCreator";
import {
  getRentalDetailsForUser,
  getUserDeliveryAddress,
} from "../services/contractServices/userContract";

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

const ProfileTable = styled.table`
  width: 60%;
  margin: 20px 0;
  border-spacing: 0 10px;
`;

const ProfileTableBody = styled.tbody``;

const DetailsRow = styled.tr``;

const DetailsName = styled.td`
  color: var(--blue);
  font-weight: 500;
  font-size: 18px;
`;

const Details = styled.td`
  color: var(--dark-blue);
  font-weight: 500;
  font-size: 18px;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: flex-start;
  /* justify-content: space-between; */
  margin: 10px 0;
  /* background-color: blue; */
`;

const Left = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  width: 45%;
  margin-right: 100px;
  /* padding: 1%; */
  /* background-color: blue; */
`;

const Right = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  width: 45%;
  /* padding: 1%; */
`;

const NavigateLink = styled(Link)`
  text-decoration: none;
  color: white;
  width: 45%;
  margin: 1% 0;
`;

const LinkItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: grey;

  &:hover {
    text-decoration: underline;
  }
`;

const ColumnTitle = styled.div`
  font-size: 20px;
  font-weight: 500;
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

const Profile = () => {
  const user = useSelector((state) => state.user.currentUser);
  const [deliveryAddress, setDeliveryAddress] = useState();
  const [mostRecentRentals, setMostRecentRentals] = useState([]);
  const [filterDone, setFilterDone] = useState(false);
  const [itemContractsForUser, setItemContractsForUser] = useState();
  const [itemDetailsForUser, setItemDetailsForUser] = useState();

  const compareRentalTime = (a, b) => {
    if (a.start < b.start) {
      return 1;
    }
    if (a.start > b.start) {
      return -1;
    }
    return 0;
  };

  useEffect(() => {
    if (user) {
      getUserDeliveryAddress(user.userContractAddress).then(
        (deliveryAddress) => {
          setDeliveryAddress(deliveryAddress);
        }
      );
      getRentalDetailsForUser(user.userContractAddress).then(
        (rentalDetails) => {
          let mostRecentRentals = rentalDetails.sort(compareRentalTime);
          if (mostRecentRentals.length > 5) {
            mostRecentRentals = mostRecentRentals.slice(0, 6);
          }
          setMostRecentRentals(mostRecentRentals);
        }
      );
    }
  }, []);

  useEffect(() => {
    getAllItemContracts().then((itemContracts) => {
      //   setAllItemContracts(itemContracts);
      setFilterDone(false);

      Promise.all(
        itemContracts.map((itemContractAddress) =>
          getItemDetails(itemContractAddress)
        )
      )
        .then((itemDetails) => {
          //   setAllItemDetails(itemDetails);
          setItemDetailsForUser(
            itemDetails.filter(
              (itemDetail) =>
                itemDetail.ownerUserContract === user.userContractAddress
            )
          );
          setItemContractsForUser(
            itemContracts.filter(
              (itemContractAddress, i) =>
                itemDetails[i].ownerUserContract === user.userContractAddress
            )
          );
        })
        .then(() => {
          setFilterDone(true);
        });
    });
  }, []);

  return (
    <MainContainer>
      <Navbar />
      <Container>
        <Title>My Profile</Title>
        <ProfileTable>
          <ProfileTableBody>
            <DetailsRow>
              <DetailsName>Ethereum Wallet Address</DetailsName>
              <Details>{user.ethAccountAddress}</Details>
              <DetailsName>Username</DetailsName>
              <Details>{user.username}</Details>
            </DetailsRow>
            <DetailsRow>
              <DetailsName>User Contract Address</DetailsName>
              <Details>{user.userContractAddress}</Details>
              <DetailsName>Delivery Address</DetailsName>
              <Details>{deliveryAddress}</Details>
            </DetailsRow>
          </ProfileTableBody>
        </ProfileTable>
        <Wrapper>
          <Left>
            <ColumnTitle>My Rentals</ColumnTitle>
            {mostRecentRentals.length > 0 ? (
              mostRecentRentals.map((rentalDetails, i) => {
                return <RentalItemCard key={i} rentalDetails={rentalDetails} />;
              })
            ) : (
              <NoItem>No rental to show</NoItem>
            )}
            {mostRecentRentals.length > 0 && (
              <NavigateLink to="/my-rentals">
                <LinkItem>View all rentals</LinkItem>
              </NavigateLink>
            )}
          </Left>
          <Right>
            <ColumnTitle>My Items For Rent</ColumnTitle>
            {filterDone &&
              (itemContractsForUser.length > 0 &&
              itemDetailsForUser.length > 0 ? (
                itemDetailsForUser.map((itemDetails, i) => {
                  return (
                    <ItemCardSmall
                      key={i}
                      itemDetails={itemDetails}
                      itemContractAddress={itemContractsForUser[i]}
                    />
                  );
                })
              ) : (
                <NoItem>No item to show</NoItem>
              ))}
          </Right>
        </Wrapper>
      </Container>
    </MainContainer>
  );
};

export default Profile;
