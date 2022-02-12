import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import ClaimRental from "../components/rental/ClaimRental";
import CreateRental from "../components/rental/CreateRental";
import PayRental from "../components/rental/PayRental";
import ProofOfReturn from "../components/rental/ProofOfReturn";
import ProofOfTransfer from "../components/rental/ProofOfTransfer";
import RentalPreview from "../components/rental/RentalPreview";
import { getReviewForRental } from "../services/contractServices/itemContract";
import { getRentalDetails } from "../services/contractServices/rentalContract";
import ItemReview from "../components/rental/ItemReview";

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

const Wrapper = styled.div`
  width: 70%;
  margin-top: 50px;
`;

const Rental = () => {
  const user = useSelector((state) => state.user.currentUser);
  const { rentalContractAddress } = useParams();
  const [rentalDetails, setRentalDetails] = useState();
  const [review, setReview] = useState();

  const updateRentalDetails = () => {
    if (user && rentalContractAddress) {
      getRentalDetails(rentalContractAddress).then((rentalDetails) => {
        if (
          user.userContractAddress === rentalDetails.ownerUserContractAddress
        ) {
          rentalDetails.role = 0;
        } else {
          rentalDetails.role = 1;
        }
        // console.log(rentalDetails);
        setRentalDetails(rentalDetails);
      });
    }
  };

  useEffect(updateRentalDetails, [
    user,
    rentalContractAddress,
    user.userContractAddress,
  ]);

  const getReview = () => {
    if (rentalDetails) {
      getReviewForRental(
        rentalDetails.itemContractAddress,
        rentalDetails.rentalContractAddress
      ).then((review) => {
        // console.log(review);
        setReview(review);
      });
    }
  };

  useEffect(getReview, [rentalDetails]);

  return (
    <MainContainer>
      <Navbar />
      {rentalDetails && (
        <Container>
          <RentalPreview rentalDetails={rentalDetails} />
          <Wrapper>
            <CreateRental rentalDetails={rentalDetails} />
            <ProofOfTransfer
              rentalDetails={rentalDetails}
              onUploadSuccess={updateRentalDetails}
            />
            <PayRental
              rentalDetails={rentalDetails}
              onPaySuccess={updateRentalDetails}
            />
            <ProofOfReturn
              rentalDetails={rentalDetails}
              onUploadSuccess={updateRentalDetails}
            />
            <ClaimRental
              rentalDetails={rentalDetails}
              onClaimSuccess={updateRentalDetails}
            />
            <ItemReview
              review={review}
              rentalDetails={rentalDetails}
              onReviewSuccess={getReview}
            />
          </Wrapper>
        </Container>
      )}
    </MainContainer>
  );
};

export default Rental;
