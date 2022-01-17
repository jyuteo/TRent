import { Person } from "@material-ui/icons";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { logout } from "../apiCalls/user";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 5px 0;
  width: 350px;
  padding: 15px 0;
`;

const MenuLinkItem = styled(Link)`
  text-decoration: none;
  color: white;
  text-align: center;
  margin: 10px 0;
`;

const Profile = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const ProfileItem = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 5px 0;
`;

const Address = styled.span`
  color: var(--blue);
  margin: 2px 0;
  font-size: 14px;
`;

const Button = styled.div`
  background-color: ${(props) =>
    props.type === "logout" ? "darkgrey" : "var(--blue)"};
  width: 100px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) =>
      props.type === "logout" ? "grey" : "var(--hover-blue-dark-shade)"};
  }
`;

const UserNavLinkPopperMenu = ({ user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout(dispatch);
    return navigate("/");
  };

  return (
    <Container>
      <Profile>
        <Person style={{ fontSize: 48 }} />
        <ProfileItem>
          User Contract Address: <Address>{user.userContractAddress}</Address>
        </ProfileItem>
        <ProfileItem>
          Ethereum Wallet Address: <Address>{user.ethAccountAddress}</Address>
        </ProfileItem>
        <ProfileItem>
          <MenuLinkItem to="/profile">
            <Button>My Profile</Button>
          </MenuLinkItem>
        </ProfileItem>
      </Profile>
      <Button type="logout" onClick={handleLogout}>
        Logout
      </Button>
    </Container>
  );
};

export default UserNavLinkPopperMenu;
