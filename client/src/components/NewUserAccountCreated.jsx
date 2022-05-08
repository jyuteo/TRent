import { Done } from "@material-ui/icons";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(169, 169, 169, 0.6);
`;

const PopUpBox = styled.div`
  width: 30%;
  height: 20%;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0px 2px 10px 1px #696969;
  padding: 20px 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
`;

const Title = styled.div`
  font-size: 20px;
  font-weight: 300;
  color: var(--dark-blue);
`;

const Address = styled.span`
  color: var(--blue);
  font-size: 16px;
  margin: 10px 0 5px 0;
`;

const ButtonRow = styled.div`
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
`;

const Button = styled.div`
  height: 20px;
  width: 120px;
  padding: 5px;
  background-color: var(--dark-blue);
  border-radius: 5px;
  color: white;
  text-align: center;
  cursor: pointer;

  &:hover {
    background-color: var(--blue);
  }
`;

const NewUserAccountCreated = ({ userContractAddress }) => {
  const navigate = useNavigate();
  return (
    <Container>
      <PopUpBox>
        <TitleRow>
          <Done style={{ fontSize: 30, color: "green", margin: "5 10 5 0" }} />
          <Title>User Account Created Successfully</Title>
        </TitleRow>

        <div>User Contract Address</div>
        <Address>{userContractAddress}</Address>
        <ButtonRow>
          <Button
            onClick={(e) => {
              navigate("/login");
            }}
          >
            Proceed to login
          </Button>
        </ButtonRow>
      </PopUpBox>
    </Container>
  );
};

export default NewUserAccountCreated;
