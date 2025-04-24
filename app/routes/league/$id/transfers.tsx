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
  const chip = manager?.chips.find((chip) => {
    return (
      chip.eventId === currentEventId ||
      (chip.key === "am" &&
        currentEventId >= chip.eventId &&
        currentEventId <= chip.eventId + 2)
    );
  });
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

const TBMHeaders = ["manager", "in", "out", "gain","hits",  "chip"] as const;
const TransfersByManager: React.FC<{}> = (props) => {
  const { managers, currentEventId, players, fixturesPerTeam } =
    useLeagueData();

  const data = React.useMemo(() => {
    return managers.map((manager) => {
      let unfinishedFixtures = false;
      const [transfersIn, transfersOut] = [
        manager.transfers.in,
        manager.transfers.out,
      ].map((playerIds) => {
        return sortBy(
          (playerIds || []).map((id) => players[id]),
          "cost",
          true
        ).map((player) => {
          if (!player) return null;
          const lastFixtureFinished = [...fixturesPerTeam[player.teamId]].slice(
            -1
          )[0]?.finished;
          if (!lastFixtureFinished) {
            unfinishedFixtures = true;
          }
          const points = Number(player.gameweekStats.total_points) || 0;
          const pointsLabel = lastFixtureFinished ? points : points + "*";
          const playerLabel = `${player.webName} (${pointsLabel})`;

          return { points, pointsLabel, player, playerLabel };
        });
      });

      const inTotal = transfersIn.reduce(
        (acc, player) => acc + (player?.points || 0),
        0
      );
      const outTotal = transfersOut.reduce(
        (acc, player) => acc + (player?.points || 0),
        0
      );

      const gain = inTotal - outTotal - (manager.transfers.cost || 0);
      let gainLabel = gain > 0 ? `+${gain}` : gain;
      if (unfinishedFixtures) {
        gainLabel = `${gainLabel}*`;
      }

      return {
        manager,
        in: transfersIn,
        out: transfersOut,
        gainLabel,
        gain,
      };
    });
  }, [managers, players, currentEventId]);


  const [expandedManagers, setExpandedManagers] = React.useState<Record<number, boolean>>(
    {}
  );
  const expandManager = React.useCallback((managerId: number) => {
    setExpandedManagers((prev) => ({
      ...prev,
      [managerId]: true
    }));
  }, []);

  return (
    <Table
      data={data}
      headers={TBMHeaders}
      renderCell={(header, row) => {
        const { manager, in, out, gainLabel, gain } = row;
        if (header === "manager") {
          return (
            <ManagerCell manager={manager} currentEventId={currentEventId} />
          );
        } else if (header === "hits") {
          return <HitsCell manager={manager} />;
        } else if (header === "chip") {
          return <ChipCell manager={manager} currentEventId={currentEventId} />;
        } else if (header === "gain") {
          return <ColorSpan color={gain > 0 ? colors.green : gain < 0 ? colors.negative : colors.grey}>{gainLabel}</ColorSpan>
        } else {
          const playerList = row[header];
          const expanded = expandedManagers[manager.id];
          const showExpand = playerList.length > 3;
          const displayList = expanded || !showExpand ? playerList : playerList.slice(0, 2);
          
          return (
            <div style={{ whiteSpace: "pre-wrap", position: "relative" }}>
              {playerList.length === 0 ? <div>-</div> : null}
              {displayList.map((player) => {
                return player ? <div key={player.player.id}>{player.playerLabel}</div> : null;
              })}
              {!expanded && showExpand && (
                <button
                  onClick={() => expandManager(manager.id)}
                  style={{
                    border: "none",
                    background: "none", 
                    // color: colors.purple,
                    // textTransform: "uppercase",
                    fontSize: "0.8em",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                    // marginTop: 4
                  }}
                >
                  +{playerList.length - 2} more
                </button>
              )}
            </div>
          );
        }
      }}
      cellWidths={{
        manager: ["nowrap"],
        in: ["auto"],
        out: ["auto"],
        hits: ["auto"],
        gain: ["auto"],
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
      <p>
        Transfers made by each manager this gameweek. An asterix (*) indicates
        unfinished fixtures.
      </p>
      {/* <p>
        The number in parentheses is the player's points this GW, with a * if
        they still have unfinished fixtures.
      </p>
      <p>
        Gain is the net points gained from a manager's transfers, including the
        cost of hits.
      </p> */}
      <TransfersByManager />

      <TransfersByPlayer />
    </Section>
  );
};

export default Transfers;
