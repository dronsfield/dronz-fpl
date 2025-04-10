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
import colors from "~/style/colors";

const Pitch = styled.div``;

const PickRow = styled(FlexRow)`
  justify-content: center;
  padding: 0.5em 0;
  align-items: flex-start;
`;

const PlayerBlockWrapper = styled(FlexCenter)`
  width: 20%;
  max-width: 70px;
`;

const PlayerBlockContainer = styled(FlexCenter).attrs({ as: "button" })`
  ${normalizeButton};
  cursor: default;
  width: 62px;
  padding: 0 3px;
  position: relative;
`;

const PlayerName = styled.div`
  width: 100%;
  min-width: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-weight: bold;
  font-size: 10px;
  background-color: ${colors.darkPurple};
  color: white;
  padding: 2px 3px 2.5px;
  // text-transform: uppercase;
  border-radius: 3px 3px 0 0;
  line-height: 1;
`;

const PickValue = styled.div`
  font-weight: bold;
  font-size: 9px;
  padding: 1px 3px 1.5px;
  background-color: ${colors.playerGreen};
  color: ${colors.darkPurple};
  width: 100%;
  border-radius: 0 0 3px 3px;
  line-height: 1;
`;

const CaptainCircle = styled.div`
  background-color: ${colors.darkPurple};
  color: white;
  position: absolute;
  right: 0;
  top: 15px;
  width: 14px;
  height: 14px;
  line-height: 14px;
  text-align: center;
  font-size: 10px;
  border-radius: 50%;
  font-weight: bold;
  text-transform: uppercase;
`;

export interface PlayerBlockProps {
  pick: PitchPick;
}

export const PlayerBlock: React.FC<PlayerBlockProps> = (props) => {
  const { pick } = props;
  return (
    <PlayerBlockContainer style={{}}>
      {pick.pickType === "CAPTAIN" ? <CaptainCircle children="c" /> : null}
      {pick.pickType === "VICE" ? <CaptainCircle children="v" /> : null}
      <Shirt
        teamCode={pick.player.teamCode}
        isGoalkeeper={pick.player.position === "GKP"}
        style={pick.pickType === "BENCHED" ? { opacity: 0.33 } : undefined}
      />
      <Spacer height={4} />
      <PlayerName>{pick.player.webName}</PlayerName>
      <PickValue>{pick.value}</PickValue>
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
      if (pickType === "BENCHED" || pickType === "AM") {
        rows[4].push(pick);
      } else {
        const rowIndex = positionIndexes[player.position];
        if (rowIndex !== null) {
          rows[rowIndex].push(pick);
        }
      }
    });
    return rows.map((row) => {
      return sortBy(row, ["pickType", "position"]);
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
