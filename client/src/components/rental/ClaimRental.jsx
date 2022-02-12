import moment from "moment";
import { useState } from "react";
import styled from "styled-components";
import { gweiToEth } from "../../helpers/mathUtils";
import { claimRentalFeesAndSettleDeposit } from "../../services/contractServices/rentalContract";

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
  border: ${(props) =>
    props.type === "active"
      ? "1px solid var(--blue)"
      : "1px solid var(--dark-blue)"};
  box-shadow: ${(props) =>
    props.type === "active"
      ? "1px 0px 3px 1px var(--blue)"
      : "1px 1px 3px 0px grey"};
  /* border: 1px solid var(--dark-blue);
  box-shadow: 1px 1px 3px 0px grey; */
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

const ClaimRental = ({ rentalDetails, onClaimSuccess }) => {
  const [error, setErrorMessage] = useState("");

  const handleClick = async (e) => {
    try {
      await claimRentalFeesAndSettleDeposit(
        rentalDetails.rentalContractAddress,
        rentalDetails.ownerEthAccountAddress
      );
      onClaimSuccess();
    } catch (err) {
      setErrorMessage("Unable to claim rental fees");
      return;
    }
  };

  return rentalDetails.ownerClaimRentalFeesTimestamp > 0 ? (
    <Container>
      <Left>
        {moment
          .unix(rentalDetails.ownerClaimRentalFeesTimestamp)
          .format("DD-MMM-YYYY, hh:mm A")}
      </Left>
      <Right>
        <div>
          Owner claimed rental fees of
          <ColoredText>
            {gweiToEth(rentalDetails.rentalFeesInGwei)} ETH
          </ColoredText>
          and settled deposit of
          <ColoredText>
            {gweiToEth(rentalDetails.renterDepositInGwei)} ETH
          </ColoredText>{" "}
          for both owner and renter
        </div>
      </Right>
    </Container>
  ) : (
    <Container>
      <Left>N/A</Left>
      {parseInt(rentalDetails.role) === 0 &&
      parseInt(rentalDetails.rentalStatus) === 2 ? (
        <Right type="active">
          <div>
            Owner to claim rental fees{" "}
            <ColoredText>
              {gweiToEth(rentalDetails.rentalFeesPaidInGwei)} ETH
            </ColoredText>{" "}
            and settle deposit
          </div>
          <Button onClick={handleClick}>Claim rental fees now</Button>
          {error && <Error>{error}</Error>}
        </Right>
      ) : (
        <Right type="inactive">
          Owner to claim rental fees and settle deposit
        </Right>
      )}
    </Container>
  );
};

export default ClaimRental;
