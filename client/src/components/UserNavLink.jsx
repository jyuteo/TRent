import { Person } from "@material-ui/icons";
import styled from "styled-components";
import { usePopper } from "react-popper";
import React, { useRef, useState } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import UserNavLinkPopperMenu from "./UserNavLinkPopperMenu";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const PopperContainer = styled.div`
  background-color: #2c3e50;
  display: ${(props) => (props.visible ? " flex" : "none")};
  width: 350px;
  position: static;
  border-radius: 15px;
  opacity: 0.9;
  box-shadow: 3px 5px 10px 3px #888888;
`;

const popperOptions = {
  placement: "bottom",
  modifiers: [
    {
      name: "offset",
      enabled: true,
      options: {
        offset: [-120, 25],
      },
    },
  ],
};

const UserNavLink = ({ user }) => {
  const referenceRef = useRef(null);
  const popperRef = useRef(null);
  const [pop, setPop] = useState(false);
  const { styles, attributes, update } = usePopper(
    referenceRef.current,
    popperRef.current,
    popperOptions
  );
  const hide = (e) => {
    setPop(false);
    update();
  };
  const handleClick = (e) => {
    e.preventDefault();
    setPop((p) => !p);
    update();
  };

  return (
    <React.Fragment>
      <OutsideClickHandler onOutsideClick={hide}>
        <Container ref={referenceRef} onClick={handleClick}>
          <Person style={{ fontSize: 24, margin: "0 10px" }} />
          {user.username}
        </Container>
        <PopperContainer
          visible={pop}
          ref={popperRef}
          {...attributes.popper}
          style={styles.popper}
        >
          <UserNavLinkPopperMenu
            style={styles.offset}
            visible={pop}
            user={user}
          />
        </PopperContainer>
      </OutsideClickHandler>
    </React.Fragment>
  );
};

export default UserNavLink;
