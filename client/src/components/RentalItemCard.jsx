import moment from "moment";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import RentalStatusIcon from "./RentalStatusIcon";

const Container = styled.div`
  width: 95%;
  padding: 2%;
  height: 120px;
  border: 1px solid lightgray;
  border-radius: 5px;
  box-shadow: 1px 2px 3px 1px lightgray;
  overflow: hidden;
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  &:hover {
    box-shadow: 1px 1px 10px 0px darkgrey;
  }
`;

const Image = styled.img`
  height: 120px;
  width: 22%;
  object-fit: contain;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 120px;
  height: 120px;
  object-fit: contain;
  margin-left: 20px;
  width: 75%;
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

const Name = styled.div`
  width: 450px;
  font-size: 18px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--dark-blue);
`;

const FieldName = styled.span`
  flex: 1.2;
  color: var(--blue);
  margin-right: 20px;
`;

const Field = styled.div`
  flex: 9;
`;

const LinkRow = styled.div`
  flex: 9;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Link = styled.div`
  color: grey;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const RentalItemCard = ({ rentalDetails }) => {
  const navigate = useNavigate();
  const handleClick = (e) => {
    navigate(`/rental/${rentalDetails.rentalContractAddress}`);
  };

  return (
    <Container>
      <Image src={rentalDetails.itemImageUrl} />
      <InfoContainer>
        <NameRow>
          <Name>{rentalDetails.itemName}</Name>
          <RentalStatusIcon
            rentalContractAddress={rentalDetails.rentalContractAddress}
          />
        </NameRow>
        {rentalDetails.role === "0" ? (
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
        <InfoRow>
          <FieldName>START</FieldName>
          <Field>
            {moment.unix(rentalDetails.start / 1000).format("DD MMM YYYY")}
          </Field>
        </InfoRow>
        <InfoRow>
          <FieldName>END</FieldName>
          <LinkRow>
            <Field>
              {moment.unix(rentalDetails.end / 1000).format("DD MMM YYYY")}
            </Field>
            <Link onClick={handleClick}>View and manage</Link>
          </LinkRow>
        </InfoRow>
      </InfoContainer>
    </Container>
  );
};

export default RentalItemCard;
