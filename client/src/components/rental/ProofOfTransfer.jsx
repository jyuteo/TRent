import moment from "moment";
import styled from "styled-components";
import { gweiToEth } from "../../helpers/mathUtils";
import UploadProofOfTransferAndPayDeposit from "./UploadProofOfTransferAndPayDeposit";

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
  flex-direction: column;
  justify-content: left;
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
  background-color: ${(props) =>
    props.type === "inactive" ? "#efefef" : "white"};
  text-overflow: ellipsis;
  overflow: hidden;
`;

const Image = styled.img`
  height: 200px;
  width: 30%;
  object-fit: contain;
  margin-top: 20px;
  padding: 5px;
  background-color: #efefef;
  box-shadow: 1px 1px 5px 1px #ccc;
`;

const ColoredText = styled.span`
  color: var(--dark-blue);
  margin: 0 5px;
`;

const ProofOfTransfer = ({ rentalDetails, onUploadSuccess }) => {
  return rentalDetails.ownerUploadProofOfTransfer.time > 0 ? (
    <Container>
      <Left>
        {moment
          .unix(rentalDetails.ownerUploadProofOfTransfer.time)
          .format("DD-MMM-YYYY, hh:mm A")}
      </Left>
      <Right>
        <div>
          Owner uploaded proof of transfer and paid deposit of
          <ColoredText>
            {gweiToEth(rentalDetails.renterDepositInGwei)} ETH
          </ColoredText>
        </div>
        <Image src={rentalDetails.ownerUploadProofOfTransfer.imageUrl} />
      </Right>
    </Container>
  ) : (
    <Container>
      <Left>N/A</Left>
      {parseInt(rentalDetails.role) === 0 ? (
        <Right type="active">
          <UploadProofOfTransferAndPayDeposit
            ownerEthAccountAddress={rentalDetails.ownerEthAccountAddress}
            rentalContractAddress={rentalDetails.rentalContractAddress}
            depositInGwei={rentalDetails.renterDepositInGwei}
            onUploadSuccess={onUploadSuccess}
          />
        </Right>
      ) : (
        <Right type="inactive">
          Owner to upload proof of transfer and pay deposit
        </Right>
      )}
    </Container>
  );
};

export default ProofOfTransfer;
