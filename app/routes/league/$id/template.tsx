import React from "react";
import styled from "styled-components";
import PicksPitch from "~/components/PicksPitch";
import Section from "~/components/Section";
import Spacer from "~/components/Spacer";
import Table from "~/components/Table";
import { useLeagueData } from "~/hooks/useRouteData";
import { PickType, Player } from "~/services/api";
import { sortBy } from "~/util/sortBy";

const headers = ["Player", "Pos", "Price", "FPLBOYS", "Overall"] as const;

interface TemplateData {
  player: Player;
  pickCount: number;
}

const TotalCost = styled.div`
  padding: 9px;
  font-weight: bold;
`;

const TemplateTeam: React.FC<{}> = (props) => {
  const { managers, players, currentEventId } = useLeagueData();
  const [data, setData] = React.useState<TemplateData[]>([]);

  React.useEffect(() => {
    const pickCounts: { [id: number]: number } = {};
    managers.forEach((manager) => {
      Object.keys(manager.picks).forEach((playerIdStr) => {
        const playerId = Number(playerIdStr);
        pickCounts[playerId] = (pickCounts[playerId] || 0) + 1;
      });
    });
    const data = Object.keys(pickCounts).map((playerIdStr) => {
      const playerId = Number(playerIdStr);
      return { player: players[playerId], pickCount: pickCounts[playerId] };
    });
    const gkps = data.filter(({ player }) => player.position === "GKP");
    const defs = data.filter(({ player }) => player.position === "DEF");
    const mids = data.filter(({ player }) => player.position === "MID");
    const fwds = data.filter(({ player }) => player.position === "FWD");
    const sort = (group: TemplateData[]) => sortBy(group, "pickCount", true);
    const grouped = [
      ...sort(gkps).slice(0, 2),
      ...sort(defs).slice(0, 5),
      ...sort(mids).slice(0, 5),
      ...sort(fwds).slice(0, 3),
    ];

    setData(grouped);
  }, [managers, players]);

  const picks = React.useMemo(() => {
    const withCost = data.map((item) => ({ ...item, cost: item.player.cost }));
    const sorted = sortBy(withCost, "cost", true);
    return sorted.map((item) => {
      const { player, pickCount } = item;
      return {
        player,
        pickType: "STARTING" as PickType,
        value: `x${pickCount}`,
      };
    });
  }, [data]);

  const totalCost = data
    .reduce((currentTotalCost: number, { player }) => {
      return currentTotalCost + player.cost;
    }, 0)
    .toFixed(1);

  if (!data.length) return null;
  return (
    <Section>
      <PicksPitch picks={picks} />
      <Spacer height={16} />
      <Table
        data={data}
        headers={headers}
        renderCell={(header, { player, pickCount }) => {
          switch (header) {
            case "Player":
              return player.webName;
            case "Pos":
              return player.position;
            case "Price":
              return player.cost.toFixed(1);
            case "FPLBOYS":
              const ownershipPc = ((pickCount / managers.length) * 100).toFixed(
                1
              );
              return `${ownershipPc}% (${pickCount})`;
            case "Overall":
              return `${player.selectedBy}%`;
          }
        }}
        cellWidths={{
          Player: ["auto"],
          Pos: ["auto"],
          Price: ["auto"],
          FPLBOYS: ["auto"],
          Overall: ["auto"],
        }}
      />
      <TotalCost children={`Total cost: £${totalCost}m`} />
    </Section>
  );
};

export default TemplateTeam;
