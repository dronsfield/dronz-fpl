import React from "react";
import { useTransition } from "remix";
import { ManagerCell } from "~/components/CommonCells";
import Section from "~/components/Section";
import Spacer from "~/components/Spacer";
import Table from "~/components/Table";
import { useLeagueData } from "~/hooks/useRouteData";
import { Manager } from "~/services/api/models";
import colors from "~/style/colors";
import { ItemsOf } from "~/util/utilityTypes";

const chipKeys = ["wc1", "wc2", "fh1", "fh2", "tc", "bb"] as const;
type ChipKey = ItemsOf<typeof chipKeys>;
const chipLabels = {
  wc1: "Wildcard 1",
  wc2: "Wildcard 2",
  fh1: "Free Hit 1",
  fh2: "Free Hit 2",
  tc: "Triple Captain",
  bb: "Bench Boost",
} as const;

function getCellWidths<K extends string>(headers: readonly K[]) {
  return headers.reduce((acc, header) => {
    return {
      ...acc,
      [header]: ["auto"],
    };
  }, {} as any);
}

const seasonHeaders = ["manager", ...chipKeys] as const;
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
        const { eventId, name } = chip;
        const key: SeasonHeader | undefined = (() => {
          if (name === "wildcard") {
            wcIndex++;
            if (wcIndex === 1) return "wc1";
            if (wcIndex === 2) return "wc2";
          } else if (name === "3xc") {
            return "tc";
          } else if (name === "freehit") {
            fhIndex++;
            if (fhIndex === 1) return "fh1";
            if (fhIndex === 2) return "fh2";
          } else if (name === "bboost") {
            return "bb";
          }
        })();
        if (key) {
          const value = eventId;
          data[key] = value;
          if (value === currentEventId) {
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

  console.log(useTransition());

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
            const active = value === currentEventId;
            let color = colors.grey;
            if (active) color = colors.green;
            if (!value) color = colors.grey;
            return (
              <span
                style={{ color, fontWeight: active ? "bold" : undefined }}
                children={rowData[header] || "-"}
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
