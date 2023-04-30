import React from "react";
import styled from "styled-components";
import FlexRow from "~/components/FlexRow";
import {
  PickType,
  Player,
  PlayerPosition,
  PitchPick,
  positionIndexes,
} from "~/services/api";
import { normalizeButton } from "~/style/mixins";
import { sortBy } from "~/util/sortBy";
import { Maybe } from "~/util/utilityTypes";
import FlexCenter from "./FlexCenter";
import Shirt from "./Shirt";
import Spacer from "./Spacer";

const Pitch = styled.div``;

const PickRow = styled(FlexRow)`
  justify-content: center;
  padding: 0.5em 0;
`;

const PlayerBlockWrapper = styled(FlexCenter)`
  width: 20%;
  max-width: 70px;
`;

const PlayerBlockContainer = styled(FlexCenter).attrs({ as: "button" })`
  ${normalizeButton};
  cursor: default;
  max-width: 70px;
  padding: 0 3px;
`;

const PlayerName = styled.div`
  width: 100%;
  min-width: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-weight: bold;
  font-size: 9px;
  text-transform: uppercase;
`;

const PickValue = styled.div`
  font-weight: bold;
  font-size: 10px;
`;

export interface PlayerBlockProps {
  pick: PitchPick;
}

export const PlayerBlock: React.FC<PlayerBlockProps> = (props) => {
  const { pick } = props;
  const calculatedPoints = () => {
    const { value, multiplier } = pick;
    if (value !== undefined && multiplier !== 0 && multiplier !== undefined) {
      return (value as number) * multiplier;
    }
    return value;
  };
  return (
    <PlayerBlockContainer
      style={pick.pickType === "BENCHED" ? { opacity: 0.5 } : undefined}
    >
      <Shirt
        teamCode={pick.player.teamCode}
        isGoalkeeper={pick.player.position === "GKP"}
      />
      <Spacer height={4} />
      <PlayerName>
        {pick.player.webName} {pick.multiplier === (2 || 3) ? "(C)" : ""}
      </PlayerName>
      {pick.value !== undefined ? (
        <PickValue>{calculatedPoints()}</PickValue>
      ) : null}
    </PlayerBlockContainer>
  );
};

export interface PicksPitchProps {
  picks: Array<PitchPick>;
  isManagerPage?: boolean;
}
const PicksPitch: React.FC<PicksPitchProps> = (props) => {
  const { picks } = props;
  const rows = React.useMemo(() => {
    const rows = new Array(5).fill(0).map(() => [] as PitchPick[]);
    picks.forEach((pick) => {
      const { player, pickType, position } = pick;
      if (pickType === "BENCHED") {
        rows[4].push(pick);
      } else {
        const rowIndex = positionIndexes[player.position];
        if (rowIndex !== null) {
          rows[rowIndex].push(pick);
        }
      }
    });
    return rows.map((row) => {
      return sortBy(row, "position");
    });
  }, [picks]);

  return (
    <Pitch>
      {rows.map((row, index) => {
        return (
          <PickRow key={index}>
            {row.map((pick) => {
              return (
                <PlayerBlockWrapper>
                  <PlayerBlock pick={pick} key={pick.player.id} />
                </PlayerBlockWrapper>
              );
            })}
          </PickRow>
        );
      })}
    </Pitch>
  );
};

export default PicksPitch;
