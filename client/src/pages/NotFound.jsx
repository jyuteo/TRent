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
  align-items: center;
`;

const Title = styled.h1`
  font-size: 30px;
  font-weight: 300;
`;

const TextLink = styled(Link)`
  margin: 2%;
  color: var(--blue);
`;

const NotFound = () => {
  return (
    <Container>
      <Navbar />
      <Wrapper>
        <Title>Page Not Found</Title>
        <TextLink to="/">Return to homepage</TextLink>
      </Wrapper>
    </Container>
  );
};

export default NotFound;
