import moment from "moment";
import { useState } from "react";
import styled from "styled-components";
import { gweiToEth } from "../../helpers/mathUtils";
import {
  claimRentalFeesAndSettleDeposit,
  settleRentalAfterMaximumLateDays,
} from "../../services/contractServices/rentalContract";

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

const WarningText = styled.span`
  color: red;
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
  console.log(rentalDetails);
  const [error, setErrorMessage] = useState("");

  const lateDays = Math.floor(
    (Date.now() - parseInt(rentalDetails.end)) / 1000 / 60 / 60 / 24
  );

  // const lateDays = 2;

  const maximumAllowableLateDays = 5;

  const claimFeesAndSettleDeposit = async (e) => {
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

  const settleAllFeesAndDeposit = async (e) => {
    try {
      await settleRentalAfterMaximumLateDays(
        rentalDetails.rentalContractAddress,
        rentalDetails.ownerEthAccountAddress
      );
      onClaimSuccess();
    } catch (err) {
      setErrorMessage("Unable to claim rental fees");
      return;
    }
  };

  return parseInt(rentalDetails.ownerClaimRentalFeesTimestamp) > 0 ||
    parseInt(rentalDetails.ownerSettleRentalAfterMaximumLateDaysTimestamp) >
      0 ? (
    parseInt(rentalDetails.ownerClaimRentalFeesTimestamp) > 0 ? (
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
            </ColoredText>
            for both owner and renter
          </div>
        </Right>
      </Container>
    ) : (
      <Container>
        <Left>
          {moment
            .unix(rentalDetails.ownerSettleRentalAfterMaximumLateDaysTimestamp)
            .format("DD-MMM-YYYY, hh:mm A")}
        </Left>
        <Right>
          <div>
            Owner claimed rental fees of
            <ColoredText>
              {gweiToEth(rentalDetails.rentalFeesPaidInGwei)} ETH
            </ColoredText>
            and renter deposit of
            <ColoredText>
              {gweiToEth(rentalDetails.renterDepositInGwei)} ETH
            </ColoredText>
            and renter deposit of
            <ColoredText>
              {gweiToEth(rentalDetails.renterDepositInGwei)} ETH
            </ColoredText>
          </div>
        </Right>
      </Container>
    )
  ) : (
    <Container>
      <Left>N/A</Left>
      {
        // owner
        parseInt(rentalDetails.role) === 0 ? (
          // returned
          parseInt(rentalDetails.rentalStatus) === 2 ? (
            <Right type="active">
              <div>
                Owner to claim rental fees
                <ColoredText>
                  {gweiToEth(rentalDetails.rentalFeesPaidInGwei)} ETH
                </ColoredText>
                and settle deposit
              </div>
              <Button onClick={claimFeesAndSettleDeposit}>
                Settle all fees now
              </Button>
              {error && <Error>{error}</Error>}
            </Right>
          ) : // not returned
          parseInt(rentalDetails.rentalStatus) === 1 &&
            lateDays > maximumAllowableLateDays ? (
            // later than maximum late days
            <Right type="active">
              <div>
                <WarningText>
                  Renter is {lateDays} days to return item
                </WarningText>
                <br />
                Owner can claim back owner deposit paid
                <ColoredText>
                  {gweiToEth(rentalDetails.renterDepositInGwei)} ETH
                </ColoredText>
                <br />
                Owner can claim rental fees paid
                <ColoredText>
                  {gweiToEth(rentalDetails.rentalFeesPaidInGwei)} ETH
                </ColoredText>
                and renter deposit
                <ColoredText>
                  {gweiToEth(rentalDetails.renterDepositInGwei)} ETH
                </ColoredText>
              </div>
              <Button onClick={settleAllFeesAndDeposit}>
                Settle all fees now
              </Button>
              {error && <Error>{error}</Error>}
            </Right>
          ) : (
            // not later than maximum late days
            <Right type="inactive">
              <div>
                {lateDays > 0 && (
                  <div>
                    <WarningText>
                      Renter is {lateDays} days late to return item
                    </WarningText>
                    <br />
                  </div>
                )}
                Owner to claim rental fees and settle deposit
                <br />
                Owner can claim all rental fees, owner deposit and renter
                deposit if item is not returned after {
                  maximumAllowableLateDays
                }{" "}
                late days
              </div>
            </Right>
          )
        ) : // renter
        parseInt(rentalDetails.rentalStatus) === 2 ? (
          // returned
          <Right type="inactive">
            Owner to claim rental fees and settle deposit
          </Right>
        ) : // not returned
        parseInt(rentalDetails.rentalStatus) === 1 &&
          lateDays > maximumAllowableLateDays ? (
          // later than maximum late days
          <Right type="inactive">
            <div>
              <WarningText>
                You are {lateDays} days late to return item
              </WarningText>
              <br />
              Owner will claim all rental fees and deposit paid
            </div>
          </Right>
        ) : (
          // not later than maximum late days
          <Right type="inactive">
            <div>
              {lateDays > 0 && (
                <div>
                  <WarningText>
                    Renter is {lateDays} days late to return item
                  </WarningText>
                  <br />
                </div>
              )}
              Owner to claim rental fees and settle deposit
              <br />
              Owner can claim all rental fees, owner deposit and renter deposit
              if item is not returned after {maximumAllowableLateDays} late days
            </div>
          </Right>
        )
      }
    </Container>
  );
};

export default ClaimRental;
