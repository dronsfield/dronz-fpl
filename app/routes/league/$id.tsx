import React from "react";
import { NavLink } from "react-router-dom";
import { LoaderFunction, Outlet, useLoaderData, useTransition } from "remix";
import styled from "styled-components";
import invariant from "tiny-invariant";
import { Loader } from "~/components/Loader";
import Spacer from "~/components/Spacer";
import { getLeague, init } from "~/services/api";
import colors from "~/style/colors";

export const getData = async (id: number) => {
  const initData = await init();
  const leagueData = await getLeague(id, initData.currentEventId);

  return {
    ...initData,
    ...leagueData,
  };
};

export const loader: LoaderFunction = async ({ params }) => {
  const id = Number(params.id);
  invariant(id, "expected params.id");
  return getData(id);
};

const Header = styled.nav`
  width: 100%;
  background-color: ${colors.purple};
  padding: 10px 0 6px;
`;

const Banner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 22px;
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

const CustomLink = (props: any) => (
  <NavLink {...props} activeClassName="active" exact replace />
);

const NavButton = styled(CustomLink)`
  font-weight: bold;
  text-transform: uppercase;
  padding: 4px 6px;
  border-radius: 4px;
  margin: 3px 3px;
  color: white;
  text-decoration: none;
  background-color: rgba(255, 255, 255, 0.2);
  transition: 0.1s linear all;
  -webkit-tap-highlight-color: transparent;

  &.active {
    background-color: white;
    color: ${colors.purple};
  }

  &:focus {
    background-color: rgba(255, 255, 255, 0.4);
  }
  &.active:focus {
    background-color: white;
  }
`;

interface LayoutProps {
  name: string;
}
const Layout: React.FC<LayoutProps> = (props) => {
  const { name, children } = props;

  return (
    <>
      <Header>
        <Banner>
          <Title children={name} />
        </Banner>
        <Spacer height={5} />
        <NavButtons>
          <NavButton children="Fixtures" to="fixtures" repl />
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

export type LeagueData = Awaited<ReturnType<typeof getData>>;
const leagueContextDefaultValue: LeagueData = {
  name: "",
  id: 0,
  managers: [],
  players: {},
  teams: {},
  fixtures: [],
  currentEventId: 1,
};
export const LeagueContext = React.createContext<LeagueData>(
  leagueContextDefaultValue
);

const League: React.FC<LeagueProps> = (props) => {
  const data = useLoaderData<LeagueData>();
  const transition = useTransition();
  console.log(JSON.stringify(transition));

  return (
    <LeagueContext.Provider value={data}>
      <Layout name={data.name}>
        {transition.state === "loading" ? (
          <Loader size={20} />
        ) : (
          <Outlet context={data} />
        )}
      </Layout>
    </LeagueContext.Provider>
  );
};

export default League;
