import React from "react";
import { ManagerCell } from "~/components/CommonCells";
import PlainLink from "~/components/PlainLink";
import Section from "~/components/Section";
import Spacer from "~/components/Spacer";
import Table from "~/components/Table";
import { useLeagueData } from "~/hooks/useRouteData";
import { ChipKey, Manager, chipLabels } from "~/services/api/models";
import colors from "~/style/colors";
import { ItemsOf } from "~/util/utilityTypes";

function getCellWidths<K extends string>(headers: readonly K[]) {
  return headers.reduce((acc, header) => {
    return {
      ...acc,
      [header]: ["auto"],
    };
  }, {} as any);
}

const seasonHeaders = [
  "manager",
  "wc1",
  "wc2",
  "fh",
  "tc",
  "bb",
  "am",
] as const;
type SeasonHeader = ItemsOf<typeof seasonHeaders>;
const seasonCellWidths = getCellWidths(seasonHeaders);
type SeasonData = Omit<Record<SeasonHeader, number>, "manager"> & {
  manager: Manager;
};

const eventHeaders = ["manager", "chip"] as const;
type EventHeader = ItemsOf<typeof eventHeaders>;
const eventCellWidths = getCellWidths(eventHeaders);
type EventData = {
  manager: Manager;
  chip: ChipKey;
};

const Chips: React.FC<{}> = () => {
  const { managers, currentEventId } = useLeagueData();

  const { seasonData, eventData } = React.useMemo(() => {
    const eventData: EventData[] = [];
    const seasonData = managers.map((manager) => {
      const { chips } = manager;
      const data: Partial<SeasonData> = {};
      let wcIndex = 0;
      let fhIndex = 0;
      chips.forEach((chip) => {
        const { eventId, key } = chip;
        if (key) {
          const value = eventId;
          data[key] = value;
          if (key === "am") {
            if (currentEventId >= value && currentEventId <= value + 2) {
              eventData.push({
                manager,
                chip: key,
              });
            }
          } else if (value === currentEventId) {
            eventData.push({
              manager,
              chip: key,
            });
          }
        }
      });
      data.manager = manager;
      return data as SeasonData;
    });
    return { seasonData, eventData };
  }, [managers, currentEventId]);

  return (
    <Section>
      {eventData.length ? (
        <>
          <Table
            data={eventData}
            headers={eventHeaders}
            renderHeader={(header) => {
              if (header === "chip") {
                return "active chip";
              } else {
                return header;
              }
            }}
            renderCell={(header, rowData) => {
              if (header === "manager") {
                return (
                  <ManagerCell
                    manager={rowData.manager}
                    currentEventId={currentEventId}
                  />
                );
              } else if (header === "chip") {
                return chipLabels[rowData.chip];
              }
            }}
            cellWidths={eventCellWidths}
          />
          <Spacer height={16} />
        </>
      ) : null}
      <Table
        data={seasonData}
        headers={seasonHeaders}
        renderCell={(header, rowData) => {
          if (header === "manager") {
            return (
              <ManagerCell
                manager={rowData.manager}
                currentEventId={currentEventId}
              />
            );
          } else {
            const value = rowData[header];
            const active =
              value === currentEventId ||
              (header === "am" &&
                currentEventId >= value &&
                currentEventId <= value + 2);
            let color = colors.grey;
            if (active) color = colors.green;
            if (!value) color = colors.grey;
            return (
              <PlainLink
                style={{ color, fontWeight: active ? "bold" : undefined }}
                children={rowData[header] || "-"}
                to={`https://fantasy.premierleague.com/entry/${rowData.manager.id}/event/${rowData[header]}`}
              />
            );
          }
        }}
        cellWidths={seasonCellWidths}
      />
    </Section>
  );
};

export default Chips;
