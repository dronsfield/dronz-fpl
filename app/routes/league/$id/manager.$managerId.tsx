import { capitalCase } from "change-case";
import React from "react";
import { useParams } from "remix";
import styled from "styled-components";
import Button from "~/components/Button";
import KeyValueTable from "~/components/KeyValueTable";
import PicksPitch from "~/components/PicksPitch";
import Section from "~/components/Section";
import Spacer from "~/components/Spacer";
import { useLeagueData } from "~/hooks/useRouteData";
import { getKeys } from "~/util/getKeys";

const TextContainer = styled.div`
  text-align: center;
`;

const ManagerName = styled.h2`
  margin: 0;
  font-size: 18px;
`;
const ManagerTeamName = styled.h3`
  margin: 0;
  font-size: inherit;
  font-weight: normal;
`;

export interface ManagerProps {}
const Manager: React.FC<ManagerProps> = (props) => {
  const { managerId } = useParams<{ managerId: string }>();

  const { managers, players, currentEventId } = useLeagueData();

  const { manager, picks } = React.useMemo(() => {
    const manager = managers.find((manager) => {
      return String(manager.id) === String(managerId);
    });
    const managerPicks = manager?.picks || {};
    const picks = getKeys(managerPicks).map((playerId) => {
      const player = players[playerId];
      const { pickType, position } = managerPicks[playerId];
      return {
        player,
        pickType,
        position,
        value: player.gameweekStats.total_points,
      };
    });
    return { manager, picks };
  }, [managers]);

  if (!manager) return null;

  return (
    <Section>
      <TextContainer>
        <ManagerName children={capitalCase(manager.name)} />
        <Spacer height={2} />
        <ManagerTeamName children={manager.teamName} />
      </TextContainer>
      <Spacer height={16} />
      <PicksPitch picks={picks} />
      <Spacer height={16} />
      <KeyValueTable
        items={[
          { key: "Gameweek points", value: String(manager.eventPoints) },
          { key: "Gameweek rank", value: String("TBD") },
          { key: "Season points", value: String(manager.totalPoints) },
          { key: "Season rank", value: "#" + String(manager.rank) },
          {
            key: "Transfers in",
            value:
              manager.transfers.in
                .map((id) => players[id]?.webName)
                .join(", ") || "-",
          },
          {
            key: "Transfers out",
            value:
              manager.transfers.out
                .map((id) => players[id]?.webName)
                .join(", ") || "-",
          },
          {
            key: "Chip",
            value: "TBD",
          },
        ]}
      />
      <Spacer height={16} />
      <Button
        to={`https://fantasy.premierleague.com/entry/${manager.id}/event/${currentEventId}`}
        children="Open in official FPL site"
        variant="PRIMARY"
      />
    </Section>
  );
};

export default Manager;
