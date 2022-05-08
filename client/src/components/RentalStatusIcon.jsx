import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getRentalStatus } from "../services/contractServices/rentalContract";

const Container = styled.div`
  width: 80px;
  padding: 2px;
  background-color: ${(props) => props.color};
  color: white;
  border-radius: 5px;
  text-align: center;
  font-size: 14px;
  letter-spacing: 0.5px;
  box-shadow: 1px 1px 4px 1px lightgray;
`;

const RentalStatusIcon = ({ rentalContractAddress }) => {
  const [rentalStatus, setRentalStatus] = useState();

  useEffect(() => {
    getRentalStatus(rentalContractAddress).then((rentalStatus) => {
      setRentalStatus(rentalStatus);
    });
  }, []);

  let rentalStatusIcon;
  switch (parseInt(rentalStatus)) {
    case 0:
      rentalStatusIcon = <Container color="#54a0ff">Created</Container>;
      break;
    case 1:
      rentalStatusIcon = <Container color="#00b894">Rented</Container>;
      break;
    case 2:
      rentalStatusIcon = <Container color="#fdcb6e">Returned</Container>;
      break;
    case 3:
      rentalStatusIcon = <Container color="#b2bec3">Ended</Container>;
      break;
    default:
      rentalStatusIcon = <div></div>;
  }

  return rentalStatusIcon;
};

export default RentalStatusIcon;
