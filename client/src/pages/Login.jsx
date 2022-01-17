import { Check, ReportProblem } from "@material-ui/icons";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Web3 from "web3";
import { login } from "../apiCalls/user";
import Navbar from "../components/Navbar";
import useMetaMask from "../hooks/metamask";

const Container = styled.div`
  width: 100%;
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

const WalletFieldInfo = styled.div`
  background-color: var(--dark-blue);
  color: white;
  border-radius: 8px;
  border: 1px solid white;
  padding: 4px 10px;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const WalletFieldButton = styled.div`
  background-color: #fc4e68;
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
    background-color: #d63031;
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

const SubmitContainer = styled.div`
  display: flex;
  justify-content: ${(props) => (props.withMessage ? "space-between" : "end")};
  align-items: center;
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

const Error = styled.span`
  color: red;
  font-size: 14px;
`;

const Success = styled.span`
  color: var(--dark-blue);
  font-size: 14px;
  margin: 5px 0;
`;

const Login = () => {
  const [ethAccountAddress, setEthAccountAddress] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { isFetchingLogin, loginSuccess, loginError } = useSelector(
    (state) => state.user
  );

  const dispatch = useDispatch();

  const { connect, isActive, account, shouldDisable } = useMetaMask();

  useEffect(() => {
    if (isActive) {
      setEthAccountAddress(account);
    }
  }, [isActive, account]);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("login", ethAccountAddress);
    const loginReqBody = {
      ethAccountAddress: ethAccountAddress,
      username: username,
      password: password,
    };
    login(dispatch, loginReqBody);
  };

  return (
    <Container>
      <Navbar />
      <Wrapper>
        <Title>LOG IN</Title>
        <TextContainer>
          <Text>Please connect to your Ethereum wallet</Text>
          <Text>
            New user?
            <TextLink to="/register">Create account</TextLink>
          </Text>
        </TextContainer>
        <Form>
          <InputContainer>
            <WalletFieldContainer>
              <WalletFieldName>Ethereum Wallet Address</WalletFieldName>
              {isActive ? (
                <WalletFieldInfo>
                  <Check style={{ fontSize: 14, marginRight: 5 }} /> Connected
                  to Metamask wallet
                </WalletFieldInfo>
              ) : (
                <WalletFieldButton onClick={async (e) => await connect(Web3)}>
                  <ReportProblem style={{ fontSize: 14, marginRight: 5 }} />{" "}
                  Click to connect wallet
                </WalletFieldButton>
              )}
            </WalletFieldContainer>
            <Input
              placeholder={
                ethAccountAddress ? ethAccountAddress : "connect to wallet"
              }
              readOnly={true}
              field="wallet"
            ></Input>
          </InputContainer>
          <InputContainer>
            <FieldName>Username</FieldName>
            <Input
              placeholder="username"
              onChange={(e) => setUsername(e.target.value)}
            ></Input>
          </InputContainer>
          <InputContainer>
            <FieldName>Password</FieldName>
            <Input
              placeholder="password"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            ></Input>
          </InputContainer>
          <SubmitContainer withMessage={true}>
            {loginError && <Error>Unable to login. Please try again.</Error>}
            {loginSuccess && <Success>Login successful.</Success>}
            <Button onClick={handleLogin} disabled={isFetchingLogin}>
              Log In
            </Button>
          </SubmitContainer>
        </Form>
      </Wrapper>
    </Container>
  );
};

export default Login;
