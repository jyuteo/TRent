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
  align-items: center;
`;

const Title = styled.h1`
  font-size: 16px;
  font-weight: 300;
`;

const NotConnectedToMetamask = () => {
  return (
    <Container>
      <Navbar />
      <Wrapper>
        <Title>Connecting to MetaMask...</Title>
      </Wrapper>
    </Container>
  );
};

export default NotConnectedToMetamask;
