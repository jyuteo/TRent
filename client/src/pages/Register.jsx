import { ShareOutlined } from "@material-ui/icons";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Navbar from "../components/Navbar";

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Wrapper = styled.div`
  width: 30%;
  height: 80%;
  padding: 20px;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Form = styled.form``;

const Title = styled.h1`
  font-style: 24px;
  font-weight: 300;
`;

const TextContainer = styled.div`
  margin: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Text = styled.span`
  font-size: 14px;
  font-weight: 300;
`;

const TextLink = styled(Link)`
  margin-left: 10px;
  color: var(--blue);
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 2% 0;
`;

const FieldName = styled.span`
  font-size: 14px;
  margin: 5px 0px;
  padding: 0 1px;
  color: var(--dark-blue);
`;

const WalletFieldContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 5px 15px 5px 0;
`;

const WalletFieldButton = styled.button`
  background-color: var(--dark-blue);
  color: white;
  border-radius: 8px;
  border: 1px solid white;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background-color: var(--blue);
  }
`;

const WalletFieldName = styled.span`
  font-size: 14px;
  padding: 0 1px;
  color: var(--dark-blue);
  margin-right: 20px;
`;

const Input = styled.input`
  flex: 1;
  min-width: 40%;
  padding: 10px;

  &:focus {
    border: ${(props) => props.field !== "wallet" && "2px solid var(--blue)"};
    outline: none;
  }
`;

const Button = styled.button`
  width: 20%;
  border: none;
  margin-top: 10px;
  padding: 10px 20px;
  background-color: var(--dark-blue);
  color: white;
  cursor: pointer;
  border-radius: 5px;
  float: right;

  &:hover {
    background-color: var(--blue);
  }
`;

const Register = () => {
  return (
    <Container>
      <Navbar />
      <Wrapper>
        <Title>CREATE AN ACCOUNT</Title>
        <TextContainer>
          <Text>Please connect to your Ethereum wallet</Text>
          <Text>
            Have an account?
            <TextLink to="/login">Log In Now</TextLink>
          </Text>
        </TextContainer>
        <Form>
          <InputContainer>
            <WalletFieldContainer>
              <WalletFieldName>Ethereum Wallet Address</WalletFieldName>
              <WalletFieldButton>
                <ShareOutlined style={{ fontSize: 14, marginRight: 5 }} />{" "}
                Connect to wallet
              </WalletFieldButton>
            </WalletFieldContainer>
            <Input
              placeholder="connect to wallet"
              readOnly={true}
              field="wallet"
            ></Input>
          </InputContainer>
          <InputContainer>
            <FieldName>Username</FieldName>
            <Input placeholder="username"></Input>
          </InputContainer>
          <InputContainer>
            <FieldName>Password</FieldName>
            <Input placeholder="password" type="password"></Input>
          </InputContainer>
          <InputContainer>
            <FieldName>Confirm Password</FieldName>
            <Input placeholder="confirm password" type="password"></Input>
          </InputContainer>
          <InputContainer>
            <FieldName>Shipping Address</FieldName>
            <Input placeholder="shipping address"></Input>
          </InputContainer>
          <Button>Sign Up</Button>
        </Form>
      </Wrapper>
    </Container>
  );
};

export default Register;
