import moment from "moment";
import { useState } from "react";
import styled from "styled-components";
import { gweiToEth } from "../../helpers/mathUtils";
import { payRentalFeesIncludingLateFees } from "../../services/contractServices/rentalContract";

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
  justify-content: left;
  align-items: center;
  padding: 20px;
  border-radius: 5px;
  /* border: 1px solid var(--dark-blue);
  box-shadow: 1px 1px 3px 0px grey; */
  border: ${(props) =>
    props.type === "active"
      ? "1px solid var(--blue)"
      : "1px solid var(--dark-blue)"};
  box-shadow: ${(props) =>
    props.type === "active"
      ? "1px 0px 3px 1px var(--blue)"
      : "1px 1px 3px 0px grey"};
  background-color: ${(props) =>
    props.type === "inactive" ? "#efefef" : "white"};
  text-overflow: ellipsis;
  overflow: hidden;
`;

const ColoredText = styled.span`
  color: var(--dark-blue);
  margin: 0 5px;
`;

const Button = styled.button`
  width: 20%;
  border: none;
  padding: 10px 5px;
  background-color: var(--dark-blue);
  color: white;
  cursor: pointer;
  border-radius: 5px;
  margin-left: 20px;

  &:hover {
    background-color: var(--blue);
  }
`;

const Error = styled.span`
  color: red;
  font-size: 14px;
  margin-left: 20px;
`;

const PayRental = ({ rentalDetails, onPaySuccess }) => {
  const [error, setErrorMessage] = useState("");

  const handleClick = async (e) => {
    try {
      await payRentalFeesIncludingLateFees(
        rentalDetails.rentalContractAddress,
        rentalDetails.rentalFeesInGwei,
        rentalDetails.renterEthAccountAddress
      );
      onPaySuccess();
    } catch (err) {
      setErrorMessage("Unable to pay rental fees");
      return;
    }
  };

  return parseInt(rentalDetails.renterPayRentalFeesTimestamp) !== 0 ? (
    <Container>
      <Left>
        {moment
          .unix(rentalDetails.renterPayRentalFeesTimestamp)
          .format("DD-MMM-YYYY, hh:mm A")}
      </Left>
      <Right>
        <div>
          Renter paid rental fees of
          <ColoredText>
            {gweiToEth(rentalDetails.rentalFeesPaidInGwei)} ETH
          </ColoredText>
        </div>
      </Right>
    </Container>
  ) : (
    <Container>
      <Left>N/A</Left>
      {parseInt(rentalDetails.rentalStatus) === 1 &&
      parseInt(rentalDetails.role) === 1 ? (
        <Right type="active">
          <div>
            Renter to pay rental fees of
            <ColoredText>
              {gweiToEth(rentalDetails.rentalFeesInGwei)} ETH
            </ColoredText>
            by
            <ColoredText>
              {moment.unix(rentalDetails.end / 1000).format("DD-MMM-YYYY")}
            </ColoredText>
          </div>
          <Button onClick={handleClick}>Pay rental fees now</Button>
          {error && <Error>{error}</Error>}
        </Right>
      ) : (
        <Right type="inactive">Renter to pay rental fees</Right>
      )}
    </Container>
  );
};

export default PayRental;
