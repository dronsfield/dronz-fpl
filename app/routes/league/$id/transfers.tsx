import React from "react";
import { ColorSpan, HitsCell, ManagerCell } from "~/components/CommonCells";
import Section from "~/components/Section";
import Table from "~/components/Table";
import { useLeagueData } from "~/hooks/useRouteData";
import { ChipKey, Player } from "~/services/api/models";
import { sortBy } from "~/util/sortBy";
import { Manager } from "~/services/api";
import colors from "~/style/colors";

const ChipCell: React.FC<{ manager: Manager; currentEventId: number }> = (
  props
) => {
  const { manager, currentEventId } = props;
  const chip = manager.chips.find((chip) => chip.eventId === currentEventId);
  const relevantChips = ["wc1", "wc2", "fh"] as const;
  const isRelevant = chip?.key && (relevantChips as any).includes(chip.key);
  return (
    <ColorSpan
      color={isRelevant ? colors.text : colors.grey}
      style={{
        textTransform: "uppercase",
      }}
    >
      {chip?.key?.slice(0, 2) || "-"}
    </ColorSpan>
  );
};

const TBMHeaders = ["manager", "in", "out", "hits", "chip"] as const;
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
        } else if (header === "hits") {
          return <HitsCell manager={manager} />;
        } else if (header === "chip") {
          return <ChipCell manager={manager} currentEventId={currentEventId} />;
        } else {
          const playerIds = manager.transfers[header];
          return (
            (playerIds || []).map((id) => players[id]?.webName).join(", ") ||
            "-"
          );
        }
      }}
      cellWidths={{
        manager: ["nowrap"],
        in: ["auto"],
        out: ["auto"],
        hits: ["auto"],
        chip: ["auto"],
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
  let visibilityRequirement = 2;

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
    data = data.filter((row) => Math.abs(row.value) >= visibilityRequirement);
    if (data.length > 15) {
      visibilityRequirement++;
      data = data.filter((row) => Math.abs(row.value) >= visibilityRequirement);
    }
    data = sortBy(data, "value", true);
    return data;
  }, [managers, players]);

  return (
    <>
      <p>
        {`Players that were transferred in or out ${visibilityRequirement} or more times this gameweek:`}
      </p>
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
    </>
  );
};

const Transfers: React.FC<{}> = (props) => {
  return (
    <Section>
      <p>Transfers made by each manager this gameweek:</p>
      <TransfersByManager />

      <TransfersByPlayer />
    </Section>
  );
};

export default Transfers;
