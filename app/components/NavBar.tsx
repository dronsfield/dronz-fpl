import React from "react";
import styled from "styled-components";
import FlexCenter from "./FlexCenter";
import Spacer from "./Spacer";

const CONTAINER_HEIGHT = 40;
const Container = styled(FlexCenter)<{ $bg: string }>`
  height: ${CONTAINER_HEIGHT}px;
  background-color: ${(p) => p.$bg};
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
`;

export interface NavBarProps {
  bg?: string;
}
const NavBar: React.FC<NavBarProps> = (props) => {
  const { bg = "black", children } = props;

  return (
    <>
      <Container $bg={bg} as="header">
        {children}
      </Container>
      <Spacer height={CONTAINER_HEIGHT} />
    </>
  );
};

export default NavBar;
