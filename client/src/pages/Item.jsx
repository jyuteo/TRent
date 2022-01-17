import { useParams } from "react-router-dom";
import styled from "styled-components";
import Navbar from "../components/Navbar";

const Container = styled.div``;

const Item = () => {
  const { itemContractAddress } = useParams();
  return (
    <Container>
      <Navbar />
      {itemContractAddress}
    </Container>
  );
};

export default Item;
