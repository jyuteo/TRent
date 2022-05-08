import moment from "moment";
import styled from "styled-components";
import { gweiToEth } from "../../helpers/mathUtils";

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
  text-overflow: ellipsis;
  overflow: hidden;
`;

const Right = styled.div`
  width: 70%;
  display: inline;
  align-items: center;
  justify-content: left;
  padding: 20px;
  border-radius: 5px;
  border: 1px solid var(--dark-blue);
  box-shadow: 1px 1px 3px 0px grey;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const ColoredText = styled.span`
  color: var(--dark-blue);
  margin: 0 5px;
`;

const CreateRental = ({ rentalDetails }) => {
  return rentalDetails.renterCreateRentalContractTimestamp > 0 ? (
    <Container>
      <Left>
        {moment
          .unix(rentalDetails.renterCreateRentalContractTimestamp)
          .format("DD-MMM-YYYY, hh:mm A")}
      </Left>
      <Right>
        Renter created rental contract
        <ColoredText>{rentalDetails.rentalContractAddress}</ColoredText>and paid
        deposit of
        <ColoredText>
          {gweiToEth(rentalDetails.renterDepositInGwei)} ETH
        </ColoredText>
      </Right>
    </Container>
  ) : (
    <div></div>
  );
};

export default CreateRental;
