import React from "react";
import { ManagerCell } from "~/components/CommonCells";
import Section from "~/components/Section";
import Table from "~/components/Table";
import { useLeagueData } from "~/hooks/useRouteData";
import { Player } from "~/services/api/models";
import { sortBy } from "~/util/sortBy";

const TBMHeaders = ["manager", "in", "out"] as const;
const TransfersByManager: React.FC<{}> = (props) => {
  const { managers, currentEventId, players } = useLeagueData();
  return (
    <Table
      data={managers}
      headers={TBMHeaders}
      renderCell={(header, manager) => {
        if (header === "manager") {
          return (
            <ManagerCell manager={manager} currentEventId={currentEventId} />
          );
        } else {
          const playerIds = manager.transfers[header];
          return playerIds.map((id) => players[id]?.webName).join(", ") || "-";
        }
      }}
      cellWidths={{
        manager: ["nowrap"],
        in: ["auto"],
        out: ["auto"],
      }}
    />
  );
};

interface TBPData {
  player: Player;
  value: number;
}
const TBPHeaders = ["player", "transfers"];
const TransfersByPlayer: React.FC<{}> = (props) => {
  const { managers, currentEventId, players } = useLeagueData();

  const data = React.useMemo(() => {
    const values: { [playerId: number]: number } = {};
    managers.forEach((manager) => {
      manager.transfers.in.forEach((id) => {
        values[id] = (values[id] || 0) + 1;
      });
      manager.transfers.out.forEach((id) => {
        values[id] = (values[id] || 0) - 1;
      });
    });
    let data: TBPData[] = Object.keys(values).map((playerIdStr) => {
      const playerId = Number(playerIdStr);
      return { player: players[playerId], value: values[playerId] };
    });
    data = data.filter((row) => Math.abs(row.value) > 1);
    data = sortBy(data, "value", true);
    return data;
  }, [managers, players]);

  return (
    <Table
      data={data}
      headers={TBPHeaders}
      renderCell={(header, row) => {
        if (header === "player") {
          return row.player.webName;
        } else if (header === "transfers") {
          const value = row.value;
          return value > 0 ? `+${value}` : value;
        }
      }}
      renderHeader={(header) => {
        if (header === "transfers") {
          return "net transfers";
        } else {
          return header;
        }
      }}
      cellWidths={{ player: ["auto"], transfers: ["auto"] }}
    />
  );
};

const Transfers: React.FC<{}> = (props) => {
  return (
    <Section>
      <p>Transfers made by each manager this gameweek:</p>
      <TransfersByManager />
      <p>
        {
          "Players that were transferred in or out 2 or more times this gameweek:"
        }
      </p>
      <TransfersByPlayer />
    </Section>
  );
};

export default Transfers;
