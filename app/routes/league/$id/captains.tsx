import React from "react";
import { useMatches, useOutletContext } from "remix";
import { ManagerCell } from "~/components/CommonCells";
import Section from "~/components/Section";
import Spacer from "~/components/Spacer";
import Table from "~/components/Table";
import { sortBy } from "~/util/sortBy";
import { LeagueContext, LeagueData } from "../$id";

const headers = ["manager", "captain", "vice"] as const;
const aggregateHeaders = ["player", "count"] as const;

const Captains: React.FC<{}> = (props) => {
  const { managers, currentEventId, players } = React.useContext(LeagueContext);

  const matches = useMatches();
  console.log(matches);

  const outletCtx = useOutletContext<LeagueData>();
  console.log(outletCtx);

  const data = React.useMemo(() => {
    return managers.map((manager) => {
      const { picks } = manager;
      let captainId: number = 0;
      let viceId: number = 0;
      Object.keys(picks).forEach((playerIdStr) => {
        const playerId = Number(playerIdStr);
        const pickType = picks[playerId];
        if (pickType === "CAPTAIN") captainId = playerId;
        if (pickType === "VICE") viceId = playerId;
      });
      return {
        // name: formatName(manager.name),
        manager,
        captain: players[captainId]?.webName,
        vice: players[viceId]?.webName,
      };
    });
  }, [managers]);

  const aggregateData = React.useMemo(() => {
    const captainCounts: { [name: string]: number } = {};
    data.forEach((item) => {
      captainCounts[item.captain] = (captainCounts[item.captain] || 0) + 1;
    });
    const countData = Object.keys(captainCounts).map((player) => {
      return { player, count: captainCounts[player] };
    });
    const sortedCountData = sortBy(countData, "count", true);
    return sortedCountData;
  }, [data]);

  return (
    <Section>
      <Table
        data={aggregateData}
        headers={aggregateHeaders}
        renderCell={(header, rowData) => {
          return rowData[header];
        }}
        renderHeader={(header) => {
          if (header === "count") {
            return "Captain count";
          } else {
            return header;
          }
        }}
        cellWidths={{
          player: ["auto"],
          count: ["auto"],
        }}
      />
      <Spacer height={16} />
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
          } else {
            return rowData[header];
          }
        }}
        cellWidths={{
          manager: ["auto"],
          captain: ["auto"],
          vice: ["auto"],
        }}
      />
    </Section>
  );
};

export default Captains;
