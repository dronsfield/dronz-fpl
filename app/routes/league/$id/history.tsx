import React from "react";
import styled from "styled-components";
import Button from "~/components/Button";
import { ManagerCell } from "~/components/CommonCells";
import PlainLink from "~/components/PlainLink";
import Section from "~/components/Section";
import Table from "~/components/Table";
import { useLeagueData } from "~/hooks/useRouteData";
import { FixtureTeam, PickType, Player } from "~/services/api/models";
import colors from "~/style/colors";
import { sortBy } from "~/util/sortBy";
import { ItemsOf } from "~/util/utilityTypes";

const headers = [
  "manager",
  "last3",
  "last5",
  "all",
  "best",
  "current",
  "prev",
  "quantity",
  "link",
] as const;

const numFormat = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });

const Container = styled.div`
  width: 1000px;
  margin: 0 auto;
`;

const Played: React.FC<{}> = (props) => {
  const { managers, currentEventId, players, fixtures } = useLeagueData();

  const data = React.useMemo(() => {
    const data = managers.map((manager) => {
      const { pastSeasons, overallSeasonRank } = manager;

      let last3 = null;
      const last3Items = pastSeasons.slice(-3);
      if (last3Items.length === 3) {
        last3 = last3Items.reduce((acc, item) => acc + item.rank, 0) / 3;
      }

      let last5 = null;
      const last5Items = pastSeasons.slice(-5);
      if (last5Items.length === 5) {
        last5 = last5Items.reduce((acc, item) => acc + item.rank, 0) / 5;
      }

      let all = null;
      if (pastSeasons.length) {
        all =
          pastSeasons.reduce((acc, item) => acc + item.rank, 0) /
          pastSeasons.length;
      }

      let best: number | null = null;
      pastSeasons.forEach(({ rank }) => {
        if (!best || rank < best) {
          best = rank;
        }
      });

      return {
        manager,
        current: overallSeasonRank,
        prev: pastSeasons.slice(-1)[0]?.rank,
        last3,
        last5,
        best,
        all,
        quantity: pastSeasons.length,
      };
    });
    return sortBy(data, "last3");
  }, [managers, players, fixtures]);

  return (
    <Section allowOverflow>
      <Container>
        <Table
          data={data}
          headers={headers}
          renderCell={(header, rowData) => {
            if (header === "manager") {
              return (
                <ManagerCell
                  manager={rowData.manager}
                  currentEventId={currentEventId}
                />
              );
            }
            if (header === "link") {
              return (
                <PlainLink
                  to={`https://fantasy.premierleague.com/entry/${rowData.manager.id}/history`}
                  children="View history"
                  style={{ color: colors.purple }}
                />
              );
            }
            const value = rowData[header];
            return typeof value === "number"
              ? numFormat.format(value)
              : value || "-";
          }}
          renderHeader={(header) => {
            switch (header) {
              case "manager":
                return "Manager";
              case "current":
                return "This season";
              case "prev":
                return "Last season";
              case "last3":
                return "Last 3 seasons avg";
              case "last5":
                return "Last 5 seasons avg";
              case "best":
                return "Best season";
              case "all":
                return "All seasons avg";
              case "quantity":
                return "Seasons";
            }
          }}
          cellWidths={undefined}
        />
      </Container>
    </Section>
  );
};

export default Played;
