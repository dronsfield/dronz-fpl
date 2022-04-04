import React, { ButtonHTMLAttributes } from "react";
import { NavLink } from "remix";
import styled from "styled-components";
import colors from "~/style/colors";
import { normalizeButton, normalizeList } from "~/style/mixins";
import VisuallyHidden from "./VisuallyHidden";

const HamburgerButtonBase = styled.button`
  position: fixed;
  top: 0;
  left: 0;
  width: 40px;
  height: 40px;
  ${normalizeButton};
  background-color: white;
  z-index: 1;
  overflow: hidden;
`;

const HamburgerFake = styled.div`
  width: 40px;
  height: 40px;
`;

const HamburgerButton: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = (
  props
) => {
  const { children } = props;
  return (
    <>
      <HamburgerFake />
      <HamburgerButtonBase {...props}>
        <VisuallyHidden>{children}</VisuallyHidden>
      </HamburgerButtonBase>
    </>
  );
};

const NavList = styled.ul`
  ${normalizeList};
`;

interface IsOpenProps {
  $isOpen: boolean;
}

const NavTray = styled.div<IsOpenProps>`
  position: fixed;
  top: 0px;
  bottom: 0px;
  left: 0px;
  width: 90vw;
  background-color: ${colors.darkPurple};
  color: white;
`;

const DarkLayer = styled.div<IsOpenProps>`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: ${(p) => (p.$isOpen ? 1 : 0)};
  transform: translateX(${(p) => (p.$isOpen ? 0 : "-100%")});
  transition: 0.1s linear opacity;
`;

export interface NavProps {
  foo?: string;
}
const Nav: React.FC<NavProps> = (props) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const navNode = React.useRef<HTMLAnchorElement>(null);

  return (
    <React.Fragment>
      <HamburgerButton
        onFocus={(event) => event.stopPropagation()}
        onClick={() => {
          setIsOpen((isOpen) => {
            if (!isOpen && navNode.current) {
              navNode.current.focus();
            }
            return !isOpen;
          });
        }}
      >
        Toggle Nav
      </HamburgerButton>
      <DarkLayer $isOpen={isOpen} onClick={() => setIsOpen(false)} />
      <NavTray
        $isOpen={isOpen}
        id="nav"
        style={{
          left: isOpen == null ? undefined : isOpen ? 0 : -250,
        }}
      >
        <HamburgerFake />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            minHeight: "100%",
          }}
        >
          <header>
            <nav>
              <NavList>
                <NavLink to="/" ref={navNode}>
                  Home
                </NavLink>
                <NavLink to="#">Funding</NavLink>
              </NavList>

              <hr aria-hidden />

              <NavList>
                <NavLink to="#">Animation</NavLink>
                <NavLink to="#">Styling</NavLink>
              </NavList>
            </nav>
          </header>
        </div>
      </NavTray>
    </React.Fragment>
  );
};

export default Nav;
