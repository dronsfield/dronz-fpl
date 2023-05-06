import React from "react";
import { useLeagueData } from "~/hooks/useRouteData";

import { ResponsiveBump } from "@nivo/bump";
import Section from "~/components/Section";
import { Manager } from "~/services/api";
import { sortBy } from "~/util/sortBy";
import { formatName } from "~/util/formatName";
import { blendColors } from "~/util/blendColors";
import { parseColor } from "~/util/blendColors";
import { formatColor } from "~/util/blendColors";
import { usefulColors } from "~/util/blendColors";

export interface RankbumpProps {
  foo?: string;
}

const Rankbump: React.FC<RankbumpProps> = (props) => {
  const { managers, currentEventId } = useLeagueData();

  const data = React.useMemo(() => {
    // compile list of gws
    // sort each one by total points, event points, name
    // compile list of managers by iterating through gws and getting index
    // tada
    const gws: Array<
      Array<{
        managerId: number;
        eventId: number;
        eventPoints: number;
        totalPoints: number;
        overallRank: number | null;
      }>
    > = [];

    managers.forEach((manager) => {
      manager.seasonHistory.forEach((gw) => {
        // gws[gw.eventId] = [...(gws[gw.eventId] || []), gw]
        gws[gw.eventId] = [
          ...(gws[gw.eventId] || []),
          { ...gw, managerId: manager.id },
        ];
      });
    });

    const sortedGws = gws.map((gw) => sortBy(gw, "overallRank"));

    console.log({ sortedGws });

    const managersData: { [id: number]: Array<{ x: number; y: number }> } = {};

    sortedGws.forEach((gw) => {
      gw.forEach((managerGw, index) => {
        managersData[managerGw.managerId] = [
          ...(managersData[managerGw.managerId] || []),
          { x: managerGw.eventId, y: index },
        ];
      });
    });

    return managers.map((manager) => {
      return {
        id: formatName(manager.name),
        data: managersData[manager.id],
      };
    });
  }, [managers]);

  const [selectedId, setSelectedId] = React.useState<string>();

  const colors = React.useMemo(() => {
    const colors: { [label: string]: [string, string] } = {};
    data.forEach(({ id, data }) => {
      const currentRank = data.slice(-1)[0]?.y;
      const baseColor = blendColors(
        parseColor("#ff0000"),
        parseColor("#000000"),
        currentRank / data.length
      );
      colors[id] = [
        formatColor(baseColor),
        formatColor(blendColors(baseColor, usefulColors.white, 0.9)),
      ];
    });

    return colors;
  }, [data]);

  return (
    <Section>
      <div
        style={{ width: "100%", height: 500 }}
        onClick={(e) => {
          let evt: any = e;
          if (evt.target?.nodeName === "text") {
            setSelectedId(evt.target?.innerHTML);
          }
        }}
      >
        <ResponsiveBump
          onClick={(e) => {
            console.log({ e });
          }}
          data={data}
          colors={(d) => {
            return colors[d.id][!selectedId || selectedId === d.id ? 0 : 1];
            // return "black";
          }}
          lineWidth={8}
          activeLineWidth={8}
          inactiveLineWidth={3}
          inactiveOpacity={0.15}
          pointSize={0}
          activePointSize={0}
          inactivePointSize={0}
          enableGridX={false}
          enableGridY={false}
          // axisTop={{
          //   tickSize: 5,
          //   tickPadding: 5,
          //   tickRotation: 0,
          //   legend: "",
          //   legendPosition: "middle",
          //   legendOffset: -36,
          // }}
          // axisBottom={{
          //   tickSize: 5,
          //   tickPadding: 5,
          //   tickRotation: 0,
          //   legend: "",
          //   legendPosition: "middle",
          //   legendOffset: 32,
          // }}
          // axisLeft={{
          //   tickSize: 5,
          //   tickPadding: 5,
          //   tickRotation: 0,
          //   legend: "ranking",
          //   legendPosition: "middle",
          //   legendOffset: -40,
          // }}
          margin={{ top: 0, right: 100, bottom: 0, left: 0 }}
          axisRight={null}
          tooltip={() => null}
          animate={false}
          isInteractive={false}
        />
      </div>
    </Section>
  );
};

export default Rankbump;
