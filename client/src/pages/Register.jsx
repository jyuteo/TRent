import { Check, ReportProblem } from "@material-ui/icons";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { register } from "../apiCalls/user";
import Navbar from "../components/Navbar";
import {
  validateConfirmPassword,
  validateEthAccountAddress,
  validatePassword,
  validateShippingAddress,
  validateUsername,
} from "../formValidations/register";
import useMetaMask from "../hooks/metamask";
import { registerReset } from "../stores/reducers/userReducer";

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
  margin: 5px 0;
`;

const FieldError = styled.span`
  color: var(--blue);
  font-size: 14px;
  margin: 5px 0;
`;

const Success = styled.span`
  color: var(--dark-blue);
  font-size: 14px;
  margin: 5px 0;
`;

const Register = () => {
  const [ethAccountAddress, setEthAccountAddress] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [validationError, setValidationError] = useState(false);
  const [errors, setErrors] = useState({
    ethAccountAddressError: "",
    usernameError: "",
    passwordError: "",
    confirmPasswordError: "",
    shippingAddressError: "",
  });

  const { isFetchingRegister, registerSuccess, registerError } = useSelector(
    (state) => state.user
  );

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { connect, isActive, account, shouldDisable } = useMetaMask();

  useEffect(() => {
    dispatch(registerReset());
  }, []);

  useEffect(() => {
    if (isActive) {
      setEthAccountAddress(account);
    }
  }, [isActive, account]);

  useEffect(() => {
    if (registerSuccess) {
      setTimeout(() => {
        dispatch(registerReset());
        navigate("/login");
      }, 1500);
    }
  }, [registerSuccess]);

  const handleEthAccountAddress = (ethAccountAddress) => {
    const { isValid, message } = validateEthAccountAddress(ethAccountAddress);
    if (!isValid) {
      setErrors({ ...errors, ethAccountAddressError: message });
      return false;
    } else {
      setErrors({ ...errors, ethAccountAddressError: "" });
      return true;
    }
  };

  const handleUsername = (username) => {
    setUsername(username);
    const { isValid, message } = validateUsername(username);
    if (!isValid) {
      setErrors({ ...errors, usernameError: message });
      return false;
    } else {
      setErrors({ ...errors, usernameError: "" });
      return true;
    }
  };

  const handlePassword = (password) => {
    setPassword(password);
    const { isValid, message } = validatePassword(password);
    if (!isValid) {
      setErrors({ ...errors, passwordError: message });
      return false;
    } else {
      setErrors({ ...errors, passwordError: "" });
      return true;
    }
  };

  const handleConfirmPassword = (password, confirmPassword) => {
    setConfirmPassword(confirmPassword);
    const { isValid, message } = validateConfirmPassword(
      password,
      confirmPassword
    );
    if (!isValid) {
      setErrors({ ...errors, confirmPasswordError: message });
      return false;
    } else {
      setErrors({ ...errors, confirmPasswordError: "" });
      return true;
    }
  };

  const handleShippingAddress = (shippingAddress) => {
    setShippingAddress(shippingAddress);
    const { isValid, message } = validateShippingAddress(shippingAddress);
    if (!isValid) {
      setErrors({ ...errors, shippingAddressError: message });
      return false;
    } else {
      setErrors({ ...errors, shippingAddressError: "" });
      return true;
    }
  };

  const validateForm = () => {
    return (
      handleEthAccountAddress(ethAccountAddress) &&
      handleUsername(username) &&
      handlePassword(password) &&
      handleConfirmPassword(password, confirmPassword) &&
      handleShippingAddress(shippingAddress)
    );
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid) {
      setValidationError(false);
      const registerReqBody = {
        ethAccountAddress: ethAccountAddress,
        username: username,
        password: password,
        shippingAddress: shippingAddress,
      };
      register(dispatch, registerReqBody);
    } else {
      setValidationError(true);
    }
    return;
  };

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
              {isActive ? (
                <WalletFieldInfo>
                  <Check style={{ fontSize: 14, marginRight: 5 }} /> Connected
                  to Metamask wallet
                </WalletFieldInfo>
              ) : (
                <WalletFieldButton onClick={connect} disabled={shouldDisable}>
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
              value={ethAccountAddress ? ethAccountAddress : ""}
              onChange={(e) => handleEthAccountAddress(e.target.value)}
            ></Input>
            {errors.ethAccountAddressError && (
              <FieldError>{errors.ethAccountAddressError}</FieldError>
            )}
          </InputContainer>
          <InputContainer>
            <FieldName>Username</FieldName>
            <Input
              placeholder="username"
              onChange={(e) => handleUsername(e.target.value)}
            ></Input>
            {errors.usernameError && (
              <FieldError>{errors.usernameError}</FieldError>
            )}
          </InputContainer>
          <InputContainer>
            <FieldName>Password</FieldName>
            <Input
              placeholder="password"
              type="password"
              onChange={(e) => handlePassword(e.target.value)}
            ></Input>
            {errors.passwordError && (
              <FieldError>{errors.passwordError}</FieldError>
            )}
          </InputContainer>
          <InputContainer>
            <FieldName>Confirm Password</FieldName>
            <Input
              placeholder="confirm password"
              type="password"
              onChange={(e) => handleConfirmPassword(password, e.target.value)}
            ></Input>
            {errors.confirmPasswordError && (
              <FieldError>{errors.confirmPasswordError}</FieldError>
            )}
          </InputContainer>
          <InputContainer>
            <FieldName>Shipping Address</FieldName>
            <Input
              placeholder="shipping address"
              onChange={(e) => handleShippingAddress(e.target.value)}
            ></Input>
            {errors.shippingAddressError && (
              <FieldError>{errors.shippingAddressError}</FieldError>
            )}
          </InputContainer>
          <SubmitContainer
            withMessage={registerError || registerSuccess || validationError}
          >
            {validationError && (
              <Error>Invalid details. Please try again.</Error>
            )}
            {!validationError && registerError && (
              <Error>Unable to create account. Please try again.</Error>
            )}
            {registerSuccess && (
              <Success>
                New account created successfully. Proceed to login.
              </Success>
            )}
            <Button onClick={handleRegister} disabled={isFetchingRegister}>
              Sign Up
            </Button>
          </SubmitContainer>
        </Form>
      </Wrapper>
    </Container>
  );
};

export default Register;
