import moment from "moment";
import styled from "styled-components";
import { gweiToEth } from "../../helpers/mathUtils";
import RentalStatusIcon from "../RentalStatusIcon";

const Container = styled.div`
  width: 47%;
  padding: 2% 1%;
  height: 150px;
  border: 1px solid lightgray;
  border-radius: 5px;
  box-shadow: 1px 2px 3px 1px lightgray;
  overflow: hidden;
  display: flex;
  align-items: center;
  overflow: hidden;

  &:hover {
    box-shadow: 1px 1px 10px 0px darkgrey;
  }
`;

const Image = styled.img`
  height: 180px;
  width: 22%;
  object-fit: contain;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: left;
  margin-left: 20px;
  width: 100%;
`;

const NameRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const DateRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const Name = styled.div`
  width: 450px;
  font-size: 18px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--dark-blue);
`;

// const Role = styled.div`
//   width: 90px;
//   padding: 2px;
//   background-color: ${(props) =>
//     parseInt(props.role) === 0 ? "#6ae23f" : "#ffce31"};
//   color: var(--darkblue);
//   border-radius: 5px;
//   text-align: center;
//   font-size: 14px;
//   letter-spacing: 0.5px;
//   box-shadow: 1px 1px 4px 1px lightgray;
// `;

const FieldName = styled.span`
  width: 20%;
  color: var(--blue);
`;

const Field = styled.div`
  width: 80%;
`;

const Date = styled.div`
  width: 25%;
`;

const RentalPreview = ({ rentalDetails }) => {
  return (
    <Container>
      <Image src={rentalDetails.itemImageUrl} />
      <InfoContainer>
        <NameRow>
          <Name>{rentalDetails.itemName}</Name>
          {/* <Role role={rentalDetails.role}>
            {parseInt(rentalDetails.role) === 0 ? "RENT OUT" : "RENT IN"}
          </Role> */}
          <RentalStatusIcon
            rentalContractAddress={rentalDetails.rentalContractAddress}
          />
        </NameRow>
        <InfoRow>
          <FieldName>CONTRACT ADDRESS</FieldName>
          <Field>{rentalDetails.rentalContractAddress}</Field>
        </InfoRow>
        {parseInt(rentalDetails.role) === 0 ? (
          <InfoRow>
            <FieldName>RENTER</FieldName>
            <Field>{rentalDetails.renterUserContractAddress}</Field>
          </InfoRow>
        ) : (
          <InfoRow>
            <FieldName>OWNER</FieldName>
            <Field>{rentalDetails.ownerUserContractAddress}</Field>
          </InfoRow>
        )}
        <DateRow>
          <FieldName>START</FieldName>
          <Date>
            {moment.unix(rentalDetails.start / 1000).format("DD MMM YYYY")}
          </Date>
          <FieldName>END</FieldName>
          <Date>
            {moment.unix(rentalDetails.end / 1000).format("DD MMM YYYY")}
          </Date>
        </DateRow>
        <InfoRow>
          <FieldName>DAILY RENTAL</FieldName>
          <Field>{gweiToEth(rentalDetails.rentPerDayInGwei)} ETH</Field>
        </InfoRow>
      </InfoContainer>
    </Container>
  );
};

export default RentalPreview;
