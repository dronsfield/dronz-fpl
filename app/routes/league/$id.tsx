import React from "react";
import { Outlet, useTransition } from "remix";
import styled from "styled-components";
import Button from "~/components/Button";
import FlexCenter from "~/components/FlexCenter";
import { Loader } from "~/components/Loader";
import NavBar from "~/components/NavBar";
import Spacer from "~/components/Spacer";
import { useLeagueData } from "~/hooks/useRouteData";
import { leagueLoader } from "~/loaders/leagueLoader";
import colors from "~/style/colors";

export const loader = leagueLoader;

const Header = styled.nav`
  width: 100%;
  background-color: ${colors.purple};
  padding: 0 0 6px;
  margin-top: -2px;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: bold;
  line-height: 1;
  color: white;
  margin: 0;
`;

const NavButtons = styled.div`
  margin: 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const NavButton = styled(Button).attrs({
  replace: true,
  isNav: true,
})`
  text-transform: uppercase;
  margin: 3px 3px;

  color: white !important; //sc-bug
  background-color: rgba(255, 255, 255, 0.2) !important; //sc-bug
  transition: 0.1s linear all;
  -webkit-tap-highlight-color: transparent;

  &.active {
    background-color: white !important; //sc-bug
    color: ${colors.purple} !important; //sc-bug
  }

  &:focus {
    background-color: rgba(255, 255, 255, 0.4) !important; //sc-bug
  }
  &.active:focus {
    background-color: white !important; //sc-bug
  }
`;

interface LayoutProps {
  name: string;
}
const Layout: React.FC<LayoutProps> = (props) => {
  const { name, children } = props;

  return (
    <>
      <NavBar bg={colors.purple}>
        <Title children={name} />
      </NavBar>
      <Header>
        <NavButtons>
          <NavButton children="Standings" to="standings" />
          <NavButton children="Fixtures" to="fixtures" />
          <NavButton children="Captains" to="captains" />
          <NavButton children="Chips" to="chips" />
        </NavButtons>
        <NavButtons>
          <NavButton children="Transfers" to="transfers" />
          <NavButton children="Played" to="played" />
          <NavButton children="Template" to="template" />
          <NavButton children="Value" to="value" />
        </NavButtons>
      </Header>
      {children}
    </>
  );
};
export interface LeagueProps {
  foo: string;
}
const League: React.FC<LeagueProps> = (props) => {
  const transition = useTransition();
  const data = useLeagueData();

  return (
    <Layout name={data.name}>
      {transition.state !== "idle" ? (
        <FlexCenter>
          <Spacer height={32} />
          <Loader size={36} color={colors.darkPurple} />
        </FlexCenter>
      ) : (
        <Outlet />
      )}
    </Layout>
  );
};

export default League;
