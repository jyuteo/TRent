import { Check, ReportProblem } from "@material-ui/icons";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
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
import { createUserContract } from "../services/contractServices/userContractCreator";
import NewUserAccountCreated from "../components/NewUserAccountCreated";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Wrapper = styled.div`
  min-width: 500px;
  width: 30%;
  padding: 10%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Form = styled.form``;

const Title = styled.h1`
  font-size: 30px;
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

const SuccessContainer = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  display: ${(props) => (props.show ? "flex" : "none")};
  align-items: center;
  justify-content: center;
`;

const Register = () => {
  const [ethAccountAddress, setEthAccountAddress] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [validationError, setValidationError] = useState(false);
  const [createUserContractError, setCreateUserContractError] = useState(false);
  const [errors, setErrors] = useState({
    ethAccountAddressError: "",
    usernameError: "",
    passwordError: "",
    confirmPasswordError: "",
    shippingAddressError: "",
  });
  const [userContractAddress, setUserContractAddress] = useState();
  const { isFetchingRegister, registerSuccess, registerError } = useSelector(
    (state) => state.user
  );
  const dispatch = useDispatch();
  const { connect, isActive, account, shouldDisable } = useMetaMask();

  useEffect(() => {
    dispatch(registerReset());
  }, []);

  useEffect(() => {
    if (isActive) {
      setEthAccountAddress(account);
    }
  }, [isActive, account]);

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

  const handleRegister = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid) {
      setValidationError(false);
      const newUserContractAddress = await createUserContract(
        ethAccountAddress,
        username,
        shippingAddress
      );
      if (!newUserContractAddress) {
        setCreateUserContractError(true);
        return;
      } else {
        setUserContractAddress(newUserContractAddress);
        console.log("[debug] newUserContractAddress: ", newUserContractAddress);
        const registerReqBody = {
          userContractAddress: newUserContractAddress,
          ethAccountAddress: ethAccountAddress,
          username: username,
          password: password,
        };
        dispatch(registerReset());
        register(dispatch, registerReqBody);
      }
    } else {
      setValidationError(true);
    }
    return;
  };

  return (
    <div style={{ width: "100%" }}>
      <Navbar />
      <Container>
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
                {isActive && account ? (
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
                onChange={(e) =>
                  handleConfirmPassword(password, e.target.value)
                }
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
              withMessage={
                registerError || validationError || createUserContractError
              }
            >
              {validationError && (
                <Error>Invalid details. Please try again.</Error>
              )}
              {!validationError &&
                (createUserContractError || registerError) && (
                  <Error>Unable to create account. Please try again.</Error>
                )}
              <Button onClick={handleRegister} disabled={isFetchingRegister}>
                Sign Up
              </Button>
            </SubmitContainer>
          </Form>
        </Wrapper>
      </Container>
      {registerSuccess && (
        <SuccessContainer show={userContractAddress}>
          <NewUserAccountCreated userContractAddress={userContractAddress} />
        </SuccessContainer>
      )}
    </div>
  );
};

export default Register;
