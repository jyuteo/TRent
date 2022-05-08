import moment from "moment";
import styled from "styled-components";

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

const WarningText = styled.span`
  color: red;
`;

const ItemDeleted = ({ rentalDetails }) => {
  return (
    <Container>
      <Left>
        {moment
          .unix(rentalDetails.ownerSettleRentalAfterMaximumLateDaysTimestamp)
          .format("DD-MMM-YYYY, hh:mm A")}
      </Left>
      <Right>
        <WarningText>Item Deleted</WarningText> <br />
        Renter does not return item after 5 late days. Assume owner will not
        retrieve the item anymore.
      </Right>
    </Container>
  );
};

export default ItemDeleted;
