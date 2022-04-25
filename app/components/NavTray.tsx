import React from "react";
import styled from "styled-components";
import appConfig from "~/appConfig";
import { useProfileData } from "~/hooks/useRouteData";
import colors from "~/style/colors";
import { normalizeList } from "~/style/mixins";
import { HamburgerButton, HamburgerFake } from "./Hamburger";
import LoaderLink from "./LoaderLink";
import Spacer from "./Spacer";

const NavList = styled.ul`
  ${normalizeList};
  padding: 16px;
  padding-bottom: 0;
`;

const NavLink = styled(LoaderLink)`
  display: block;
  font-weight: bold;
  text-decoration: none;
  padding: 2px 0;
  font-size: 16px;
`;

interface IsOpenProps {
  $isOpen: boolean;
}

const NavTrayBox = styled.nav<IsOpenProps>`
  position: fixed;
  z-index: 1;
  top: 0px;
  bottom: 0px;
  left: 0px;
  transform: translateX(${(p) => (p.$isOpen ? `0` : `-200px`)});
  width: 200px;
  background-color: ${colors.darkPurple};
  color: white;
  transition: 0.2s ease-out transform;
`;

const NavInner = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  width: 100%;
`;

const DarkLayer = styled.div<IsOpenProps>`
  position: fixed;
  z-index: 1;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: ${(p) => (p.$isOpen ? 1 : 0)};
  transform: translateX(${(p) => (p.$isOpen ? 0 : "-100%")});
  transition: 0.2s ease-out opacity;
`;

export interface NavTrayProps {
  foo?: string;
}
const NavTray: React.FC<NavTrayProps> = (props) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const navNode = React.useRef<HTMLAnchorElement>(null);

  const data = useProfileData();

  const validLeagues = React.useMemo(() => {
    return data?.leagues.filter(
      (league) => league.managerRank <= appConfig.MAX_MANAGERS
    );
  }, [data]);

  const onLoadEnd = () => setIsOpen(false);

  return (
    <React.Fragment>
      <DarkLayer $isOpen={isOpen} onClick={() => setIsOpen(false)} />
      <NavTrayBox $isOpen={isOpen} id="nav">
        <HamburgerFake />
        <Spacer height={8} />
        <NavInner>
          <header>
            <nav>
              <NavList>
                <NavLink
                  to="/"
                  ref={navNode}
                  children="Home"
                  {...{ onLoadEnd }}
                />
              </NavList>
              {validLeagues && validLeagues.length ? (
                <NavList>
                  {validLeagues.map((league) => {
                    return (
                      <NavLink
                        to={`/league/${league.id}`}
                        children={league.name}
                        key={league.id}
                        {...{ onLoadEnd }}
                      />
                    );
                  })}
                </NavList>
              ) : null}
              <NavList>
                <NavLink
                  to="/settings"
                  children="Settings"
                  {...{ onLoadEnd }}
                />
              </NavList>
            </nav>
          </header>
        </NavInner>
      </NavTrayBox>
      <HamburgerButton
        isActive={isOpen}
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
    </React.Fragment>
  );
};

export default NavTray;
