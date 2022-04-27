import React from "react";
import styled from "styled-components";
import appConfig from "~/appConfig";
import Button from "~/components/Button";
import { ManagerCell, MoneyCell } from "~/components/CommonCells";
import Section from "~/components/Section";
import Spacer from "~/components/Spacer";
import Table from "~/components/Table";
import { useLeagueData } from "~/hooks/useRouteData";
import Calculation from "~/views/PrizeCalculation";

const RankSpan = styled.span`
  opacity: 0.5;
  font-weight: bold;
  font-style: italic;
`;

const basicHeaders = ["rank", "manager", "gwPoints", "totalPoints"] as const;

const fplboysHeaders = [
  ...basicHeaders,
  "buyIn",
  "prizeValue",
  "profit",
] as const;

const Standings: React.FC<{}> = (props) => {
  const data = useLeagueData();
  const { id, managers, currentEventId } = data;

  const isFplboys = id === appConfig.LEAGUE_ID;

  const headers = isFplboys ? fplboysHeaders : basicHeaders;

  return (
    <>
      <Section>
        <Table
          data={managers}
          headers={headers}
          renderHeader={(header) => {
            switch (header) {
              case "rank":
                return null;
              case "manager":
                return "Name";
              case "gwPoints":
                return "GW";
              case "totalPoints":
                return "Total";
              case "buyIn":
                return "Buy-in";
              case "prizeValue":
                return "Prize";
              case "profit":
                return "Profit";
            }
          }}
          renderCell={(header, manager) => {
            switch (header) {
              case "rank":
                return <RankSpan children={`#${manager.rank}`} />;
              case "manager":
                return (
                  <ManagerCell
                    manager={manager}
                    currentEventId={currentEventId}
                  />
                );
              case "gwPoints":
                return manager.eventPoints;
              case "totalPoints":
                return manager.totalPoints;
              case "buyIn":
                return <MoneyCell value={manager.buyIn} />;
              case "prizeValue":
                return <MoneyCell value={manager.prizeValue} showColor />;
              case "profit":
                return <MoneyCell value={manager.profit} showColor showSign />;
            }
          }}
          cellWidths={{
            // rank: [28],
            // manager: ["nowrap"],
            // gwPoints: [40, 50],
            // totalPoints: [40, 50],
            // buyIn: [40, 50],
            // prizeValue: [55, 70],
            // profit: ["hide", 70],

            rank: [28],
            manager: ["auto"],
            gwPoints: ["auto"],
            totalPoints: ["auto"],
            buyIn: ["auto"],
            prizeValue: ["auto"],
            profit: ["hide", "auto"],
          }}
        />
        <Spacer height={16} />
        <Button
          to={`https://fantasy.premierleague.com/leagues/${id}/standings/c`}
          children="Open in official FPL site"
          variant="PRIMARY"
        />
      </Section>
      {isFplboys ? <Calculation /> : null}
    </>
  );
};

export default Standings;
