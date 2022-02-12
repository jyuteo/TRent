import { Clear } from "@material-ui/icons";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import ItemCard from "../components/ItemCard";
import Navbar from "../components/Navbar";
import NoItemToShow from "../components/NoItemToShow";
import SearchNotFound from "../components/SearchNotFound";
import { getItemDetails } from "../services/contractServices/itemContract";
import { getAllItemContracts } from "../services/contractServices/itemContractCreator";

const MainContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Container = styled.div`
  width: 95%;
  margin: 2%;
  padding: 5px 20px;
  display: flex;
  flex-direction: column;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 300;
`;

const SideNote = styled.div`
  font-size: 14px;
  font-style: italic;
  color: white;
  background-color: #efefef;
  color: var(--dark-blue);
  border-radius: 5px;
  margin-left: 20px;
  padding: 0 15px;
  cursor: pointer;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  box-shadow: 1px 1px 3px 0px grey;

  &:hover {
    background-color: var(--blue);
    color: white;
  }
`;

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin: 10px 0;
`;

const ItemContainer = styled.div`
  margin: 30px 0;
  margin-right: 35px;
  width: 300px;
  height: 350px;
`;

const Home = () => {
  const [allItemContracts, setAllItemContracts] = useState([]);
  const [allItemDetails, setAllItemDetails] = useState([]);
  const [filteredItemContracts, setFilteredItemContracts] = useState([]);
  const [filteredItemDetails, setFilteredItemDetails] = useState([]);
  const [filteredDone, setFilteredDone] = useState(false);
  const [searchParams] = useSearchParams();
  const searchValue = searchParams.get("search");
  const navigate = useNavigate();

  useEffect(() => {
    getAllItemContracts().then((itemContracts) => {
      setAllItemContracts(itemContracts);
      // setAllItemDetails([]);
      // setFilteredItemContracts([]);
      // setFilteredItemDetails([]);
      setFilteredDone(false);

      Promise.all(
        itemContracts.map((itemContractAddress) =>
          getItemDetails(itemContractAddress)
        )
      )
        .then((itemDetails) => {
          setAllItemDetails(itemDetails);
          setFilteredItemDetails(
            itemDetails.filter(
              (itemDetail) =>
                searchValue &&
                itemDetail.name
                  .toLowerCase()
                  .indexOf(searchValue.toLowerCase()) > -1
            )
          );
          setFilteredItemContracts(
            itemContracts.filter(
              (itemContractAddress, i) =>
                searchValue &&
                itemDetails[i].name
                  .toLowerCase()
                  .indexOf(searchValue.toLowerCase()) > -1
            )
          );
        })
        .then(() => {
          setFilteredDone(true);
        });

      // Promise.all(
      //   itemContracts.map((itemContractAddress) =>
      //     getItemDetails(itemContractAddress).then((itemDetails) => {
      //       setAllItemDetails((allItemDetails) => [
      //         ...allItemDetails,
      //         itemDetails,
      //       ]);
      //       if (
      //         searchValue &&
      //         itemDetails.name
      //           .toLowerCase()
      //           .indexOf(searchValue.toLowerCase()) > -1
      //       ) {
      //         setFilteredItemDetails((filteredItemDetails) => [
      //           ...filteredItemDetails,
      //           itemDetails,
      //         ]);
      //         setFilteredItemContracts((filteredItemContracts) => [
      //           ...filteredItemContracts,
      //           itemContractAddress,
      //         ]);
      //       }
      //     })
      //   )
      // ).then(() => {
      //   setFilteredDone(true);
      // });
    });
  }, [searchValue]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     setFilteredDone(true);
  //   }, 50);
  // }, [filteredItemContracts]);

  const handleClearSearch = (e) => {
    setAllItemContracts([]);
    setAllItemDetails([]);
    // setFilteredItemContracts([]);
    // setFilteredItemDetails([]);
    navigate("/");
  };

  return (
    <MainContainer>
      <Navbar />
      <Container>
        <TitleContainer>
          <Title>ITEMS FOR RENT</Title>
          {searchValue && (
            <SideNote onClick={handleClearSearch}>
              clear search
              <Clear style={{ marginLeft: 5, fontSize: 16 }} />
            </SideNote>
          )}
        </TitleContainer>
        <Wrapper>
          {allItemContracts &&
            allItemDetails &&
            (searchValue ? (
              filteredDone ? (
                filteredItemDetails.length === 0 &&
                filteredItemContracts.length === 0 ? (
                  <SearchNotFound />
                ) : filteredItemDetails &&
                  filteredItemContracts &&
                  filteredItemDetails.length ===
                    filteredItemContracts.length ? (
                  filteredItemDetails.map((itemDetails, i) => {
                    return (
                      <ItemContainer key={filteredItemContracts[i]}>
                        <ItemCard
                          key={i}
                          itemDetails={itemDetails}
                          itemContractAddress={filteredItemContracts[i]}
                        />
                      </ItemContainer>
                    );
                  })
                ) : (
                  <div></div>
                )
              ) : (
                <div></div>
              )
            ) : allItemDetails.length > 0 ? (
              allItemDetails.map((itemDetails, i) => {
                return (
                  <ItemContainer key={allItemContracts[i]}>
                    <ItemCard
                      itemDetails={itemDetails}
                      itemContractAddress={allItemContracts[i]}
                    />
                  </ItemContainer>
                );
              })
            ) : (
              <NoItemToShow />
            ))}
        </Wrapper>
      </Container>
    </MainContainer>
  );
};

export default Home;
