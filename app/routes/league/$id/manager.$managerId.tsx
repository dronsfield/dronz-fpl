import { capitalCase } from "change-case";
import React from "react";
import {
  useHref,
  useLocation,
  useMatches,
  useParams,
  useResolvedPath,
} from "remix";
import styled from "styled-components";
import Button from "~/components/Button";
import { HitsCell } from "~/components/CommonCells";
import KeyValueTable from "~/components/KeyValueTable";
import PicksPitch from "~/components/PicksPitch";
import Section from "~/components/Section";
import Spacer from "~/components/Spacer";
import { useLeagueData, useProfileData } from "~/hooks/useRouteData";
import { chipLabels, getPitchPicks } from "~/services/api";
import { calculatePoints } from "~/util/calculatePoints";
import { getKeys } from "~/util/getKeys";
import { sortBy } from "~/util/sortBy";

const numFormat = new Intl.NumberFormat();

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
  const location = useLocation();
  const profile = useProfileData();

  const { managers, players, currentEventId, fixturesPerTeam } =
    useLeagueData();

  const { manager, picks, chipKey, gwRank, gwPoints } = React.useMemo(() => {
    const manager = managers.find((manager) => {
      return String(manager.id) === String(managerId);
    });
    const picks = getPitchPicks(manager, players, fixturesPerTeam);
    const chipKey = manager?.chips.find(
      (chip) => chip.eventId === currentEventId
    )?.key;

    const gwRank =
      sortBy(managers, "eventPoints", true).findIndex(
        (someManager) => manager?.eventPoints === someManager.eventPoints
      ) + 1;

    const gwPoints = calculatePoints(picks);

    return { manager, picks, chipKey, gwRank, gwPoints };
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
      <PicksPitch picks={picks} isManagerPage={true} />
      <Spacer height={16} />
      <KeyValueTable
        items={[
          { key: "GW points", value: `${manager.eventPoints} (${gwPoints})` },
          { key: "GW league rank", value: "#" + String(gwRank) },
          {
            key: "GW overall rank",
            value: numFormat.format(manager.overallGameweekRank),
          },
          { key: "Season points", value: String(manager.totalPoints) },
          { key: "Season league rank", value: "#" + String(manager.rank) },
          {
            key: "Season overall rank",
            value: numFormat.format(manager.overallSeasonRank),
          },
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
            key: "Hits",
            value: <HitsCell manager={manager} />,
          },
          {
            key: "Chip",
            value: chipKey ? chipLabels[chipKey] : "-",
          },
        ]}
      />
      <Spacer height={16} />
      <Button
        to={`https://fantasy.premierleague.com/entry/${manager.id}/event/${currentEventId}`}
        children="Open in official FPL site"
        variant="PRIMARY"
      />
      <Spacer inline width={8} />
      {profile?.id && String(profile.id) !== String(managerId) ? (
        <Button
          to={`${location.pathname}/compare`}
          children="Compare with my team"
          variant="PRIMARY"
        />
      ) : null}
    </Section>
  );
};

export default Manager;
