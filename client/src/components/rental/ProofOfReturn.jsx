import moment from "moment";
import styled from "styled-components";
import UploadProofOfReturn from "./UploadProofOfReturn";

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
  /* border: 1px solid var(--dark-blue);
  box-shadow: 1px 1px 3px 0px grey; */
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

const ProofOfReturn = ({ rentalDetails, onUploadSuccess }) => {
  return rentalDetails.renterUploadProofOfReturn.time > 0 ? (
    <Container>
      <Left>
        {moment
          .unix(rentalDetails.renterUploadProofOfReturn.time)
          .format("DD-MMM-YYYY, hh:mm A")}
      </Left>
      <Right>
        <div>Renter uploaded proof of return</div>
        <Image src={rentalDetails.renterUploadProofOfReturn.imageUrl} />
      </Right>
    </Container>
  ) : (
    <Container>
      <Left>N/A</Left>
      {parseInt(rentalDetails.role) === 1 &&
      rentalDetails.rentalFeesPaidInGwei >= rentalDetails.rentalFeesInGwei ? (
        <Right type="active">
          <UploadProofOfReturn
            renterEthAccountAddress={rentalDetails.renterEthAccountAddress}
            rentalContractAddress={rentalDetails.rentalContractAddress}
            onUploadSuccess={onUploadSuccess}
          />
        </Right>
      ) : (
        <Right type="inactive">
          Renter to upload proof of return and pay deposit after paying rental
          fees
        </Right>
      )}
    </Container>
  );
};

export default ProofOfReturn;
