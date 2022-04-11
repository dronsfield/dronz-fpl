import React from "react";
import { LoaderFunction, Outlet, useLoaderData, useTransition } from "remix";
import styled from "styled-components";
import invariant from "tiny-invariant";
import appConfig from "~/appConfig";
import Button from "~/components/Button";
import FlexCenter from "~/components/FlexCenter";
import { Loader } from "~/components/Loader";
import Nav from "~/components/Nav";
import Spacer from "~/components/Spacer";
import managersData from "~/data/managers.json";
import { getLeague, init } from "~/services/api";
import colors from "~/style/colors";
import { BuyInManager, calculatePrizes } from "~/util/calculatePrizes";

const buyInsById: { [id: string]: number } = {};
managersData.forEach((manager) => {
  buyInsById[manager.id] = manager.datePaid ? manager.buyIn : 0;
});

export const getData = async (id: number) => {
  const initData = await init();
  const leagueData = await getLeague(id, initData.currentEventId);

  const buyInManagers: BuyInManager[] = leagueData.managers.map((manager) => {
    const buyIn =
      leagueData.id === appConfig.LEAGUE_ID
        ? buyInsById[String(manager.id)] || 0
        : 0;
    return { ...manager, buyIn };
  });
  const prizeCalculation = calculatePrizes(buyInManagers);

  return {
    ...initData,
    ...leagueData,
    managers: prizeCalculation.managers,
    prizeCalculation,
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
  color: white;

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
      <Nav />
      <Header>
        <Banner>
          <Title children={name} />
        </Banner>
        <Spacer height={5} />
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

export type LeagueData = Awaited<ReturnType<typeof getData>>;
export interface LeagueProps {
  foo: string;
}
const League: React.FC<LeagueProps> = (props) => {
  const data = useLoaderData<LeagueData>();
  const transition = useTransition();

  return (
    <Layout name={data.name}>
      {transition.state !== "idle" ? (
        <FlexCenter>
          <Spacer height={32} />
          <Loader size={36} color={colors.darkPurple} />
        </FlexCenter>
      ) : (
        <Outlet context={data} />
      )}
    </Layout>
  );
};

export default League;
