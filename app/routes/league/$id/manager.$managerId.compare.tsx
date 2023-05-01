import React from "react";
import { useLeagueData, useProfileData } from "~/hooks/useRouteData";
import { useParams } from "remix";
import {
  Manager,
  PitchPick,
  getPitchPicks,
  positionIndexes,
} from "~/services/api";
import { sortBy } from "~/util/sortBy";
import styled from "styled-components";
import { PlayerBlock } from "~/components/PicksPitch";
import Section from "~/components/Section";
import FlexCenter from "~/components/FlexCenter";
import { ManagerCell } from "~/components/CommonCells";
import Spacer from "~/components/Spacer";
import { formatName } from "~/util/formatName";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  // font-weight: bold;
`;

const PlayerWrapper = styled(FlexCenter)`
  padding: 8px 16px;
`;

const pickSortProp = [
  (pick: PitchPick) => (pick.pickType === "BENCHED" ? 1 : 0),
  (pick: PitchPick) => positionIndexes[pick.player.position],
  (pick: PitchPick) => pick.player.cost * -1,
  (pick: PitchPick) => pick.player.id,
];
const filterPicks = (picks: PitchPick[], refPicks: PitchPick[]) => {
  return picks.filter(
    (pick) =>
      !refPicks.find(
        (refPick) =>
          pick.player.id === refPick.player.id &&
          pick.multiplier === refPick.multiplier
      )
  );
};

const renderPicks = (picks: PitchPick[]) => (
  <>
    {picks.map((pick) => (
      <PlayerWrapper key={pick.player.id}>
        <PlayerBlock pick={pick} />
      </PlayerWrapper>
    ))}
  </>
);

const calculatePoints = (picks: PitchPick[]) => {
  let total = 0;
  picks.forEach((pick) => {
    total += pick.points || 0;
  });
  return total;
};

export interface CompareProps {
  foo?: string;
}
const Compare: React.FC<CompareProps> = (props) => {
  const { managerId } = useParams<{ managerId: string }>();

  const { managers, players, currentEventId, fixturesPerTeam } =
    useLeagueData();
  const profile = useProfileData();

  const { myManager, theirManager, myPicks, theirPicks } = React.useMemo(() => {
    let myManager: Manager | undefined;
    let theirManager: Manager | undefined;
    managers.forEach((manager) => {
      if (String(managerId) === String(manager.id)) {
        theirManager = manager;
      } else if (String(profile?.id) === String(manager.id)) {
        myManager = manager;
      }
    });
    if (!myManager || !theirManager)
      return { myManager, theirManager, myPicks: [], theirPicks: [] };

    const _myPicks = getPitchPicks(myManager, players, fixturesPerTeam);
    const _theirPicks = getPitchPicks(theirManager, players, fixturesPerTeam);

    const myFilteredPicks = filterPicks(_myPicks, _theirPicks);
    const theirFilteredPicks = filterPicks(_theirPicks, _myPicks);

    const mySortedPicks = sortBy(myFilteredPicks, pickSortProp);
    const theirSortedPicks = sortBy(theirFilteredPicks, pickSortProp);

    return {
      myManager,
      theirManager,
      myPicks: mySortedPicks,
      theirPicks: theirSortedPicks,
    };
  }, [managers]);

  if (!myManager || !theirManager) {
    return (
      <Section>
        <div>Failed to create comparison. Are you logged in?</div>
      </Section>
    );
  }

  return (
    <Section>
      <p style={{ textAlign: "center" }}>
        These are the differences between your team and{" "}
        {formatName(theirManager.name)}'s team. Players that you both own and
        that earn the same points for both of you are hidden.
      </p>
      <Container>
        <Column>
          <strong>
            <ManagerCell manager={myManager} currentEventId={currentEventId} />
          </strong>
          <div>{calculatePoints(myPicks)}</div>
          <Spacer height={4} />
          {renderPicks(myPicks)}
        </Column>
        <Column>
          <strong>
            <ManagerCell
              manager={theirManager}
              currentEventId={currentEventId}
            />
          </strong>
          <div>{calculatePoints(theirPicks)}</div>
          <Spacer height={4} />
          {renderPicks(theirPicks)}
        </Column>
      </Container>
    </Section>
  );
};

export default Compare;
