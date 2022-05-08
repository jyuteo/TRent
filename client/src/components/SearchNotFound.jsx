import styled from "styled-components";

const Container = styled.div`
  width: 95%;
  background-color: #efefef;
  border: 1px solid #efefef;
  border-radius: 10px;
  padding: 50px 100px;
  text-align: center;
  margin: 2%;
  color: var(--dark-blue);
  box-shadow: 1px 1px 5px 1px #bcbcbc;
`;

const SearchNotFound = () => {
  return <Container>No item found based on your search</Container>;
};

export default SearchNotFound;
