import styled from "styled-components";
import { Search } from "@material-ui/icons";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import UserNavLink from "./UserNavLink";
import useMetaMask from "../hooks/metamask";
import { useState } from "react";

const Container = styled.div`
  height: 65px;
  width: 100%;
  background-color: var(--dark-blue);
  display: flex;
`;

const Wrapper = styled.div`
  max-height: 55px;
  padding: 5px 50px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  margin: auto;
`;

const Left = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  padding-right: 10px;
`;

const LogoLink = styled(Link)`
  height: 65px;
  display: flex;
  align-items: center;
`;

const Logo = styled.img`
  max-width: 100%;
  max-height: 80%;
  object-fit: cover;
`;

const Center = styled.div`
  flex: 2.5;
  display: flex;
  justify-content: space-between;
  text-align: center;
  align-items: center;
`;

const SearchContainer = styled.div`
  flex: 1;
  border: 0.25px solid white;
  display: flex;
  align-items: center;
  padding: 5px;
  max-width: 100%;
  height: 40%;
  background-color: white;
  border-radius: 10px;
  margin: 0 5%;
  cursor: pointer;
`;

const Input = styled.input`
  flex: 9;
  width: 95%;
  height: 90%;
  margin: 0 5%;
  border: none;

  &:focus {
    outline: none;
  }
`;

const IconContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--blue);
  border-radius: 5px;
`;

const NavLinksContainer = styled.div`
  flex: 1.5;
  margin: 0;
  padding: 0;
  display: flex;
  height: 60%;
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: white;
  width: 45%;
  margin: 0 1%;
`;

const NavLinkItem = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--blue);
  border-radius: 7px;
  font-size: 16px;

  &:hover {
    background-color: var(--hover-blue-dark-shade);
  }
`;

const Right = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  text-align: center;
  color: white;
`;

const AccountLinksContainer = styled.div`
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: space-between;
`;

const AccountLink = styled(Link)`
  text-decoration: none;
  color: white;
  width: 45%;
  margin: 0 20px;
`;

const AccountLinkItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;

  &:hover {
    color: var(--hover-blue-light-shade);
  }
`;

const Navbar = () => {
  const user = useSelector((state) => state.user.currentUser);
  const isLogin = useSelector((state) => state.user.loginSuccess);
  const { account } = useMetaMask();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (searchValue) => {
    if (!searchValue) {
      navigate("/");
    } else {
      navigate(`/?search=${searchValue}`);
    }
  };

  return (
    <Container>
      <Wrapper>
        <Left>
          <LogoLink to="/">
            <Logo src="https://ipfs.moralis.io:2053/ipfs/QmcBpH72x2HRH8ax71GL2jurMD4o9sCko2VZsZAjtSMPtj" />
          </LogoLink>
        </Left>
        <Center>
          <SearchContainer>
            <Input
              placeholder={"Search for an item"}
              onChange={(e) => {
                setSearchValue(e.target.value);
              }}
            />
            <IconContainer>
              <Search
                style={{ color: "white", fontSize: 24 }}
                onClick={(e) => {
                  handleSearch(searchValue);
                }}
              />
            </IconContainer>
          </SearchContainer>
          <NavLinksContainer>
            <NavLink to="/list">
              <NavLinkItem>List Item For Rent</NavLinkItem>
            </NavLink>
            <NavLink to="/my-rentals">
              <NavLinkItem>My Rentals</NavLinkItem>
            </NavLink>
          </NavLinksContainer>
        </Center>
        <Right>
          {isLogin ? (
            <AccountLinksContainer>
              <UserNavLink user={user} />
            </AccountLinksContainer>
          ) : (
            <AccountLinksContainer>
              <AccountLink to="/register">
                <AccountLinkItem>Register</AccountLinkItem>
              </AccountLink>
              |
              <AccountLink to="/login">
                <AccountLinkItem>Login</AccountLinkItem>
              </AccountLink>
            </AccountLinksContainer>
          )}
        </Right>
      </Wrapper>
    </Container>
  );
};

export default Navbar;
