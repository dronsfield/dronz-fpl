import React from "react";
import styled from "styled-components";
import FlexRow from "~/components/FlexRow";
import { PickType, Player, PlayerPosition } from "~/services/api";
import { normalizeButton } from "~/style/mixins";
import { sortBy } from "~/util/sortBy";
import { Maybe } from "~/util/utilityTypes";
import FlexCenter from "./FlexCenter";
import Shirt from "./Shirt";
import Spacer from "./Spacer";

const positionRows: Record<PlayerPosition, number | null> = {
  GKP: 0,
  DEF: 1,
  MID: 2,
  FWD: 3,
  "???": null,
};

interface Pick {
  player: Player;
  pickType: PickType;
  position?: number;
  value?: Maybe<string | number | boolean>;
  multiplier?: number;
}

const Pitch = styled.div``;

const PickRow = styled(FlexRow)`
  justify-content: center;
  padding: 0.5em 0;
`;

const PlayerBlockContainer = styled(FlexCenter).attrs({ as: "button" })`
  ${normalizeButton};
  cursor: default;
  width: 20%;
  max-width: 70px;
  padding: 0 0.2em;
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
  pick: Pick;
}
const PlayerBlock: React.FC<PlayerBlockProps> = (props) => {
  const { pick } = props;
  return (
    <PlayerBlockContainer>
      <Shirt
        teamCode={pick.player.teamCode}
        isGoalkeeper={pick.player.position === "GKP"}
      />
      <Spacer height={4} />
      <PlayerName>
        {pick.player.webName} {pick.multiplier === (2 || 3) ? "(C)" : ""}
      </PlayerName>
      {pick.value !== undefined && pick.multiplier !== undefined ? (
        <PickValue>{pick.value}</PickValue>
      ) : null}
    </PlayerBlockContainer>
  );
};

export interface PicksPitchProps {
  picks: Array<Pick>;
  isManagerPage?: boolean;
}
const PicksPitch: React.FC<PicksPitchProps> = (props) => {
  const { picks } = props;
  const rows = React.useMemo(() => {
    const rows = new Array(5).fill(0).map(() => [] as Pick[]);
    picks.forEach((pick) => {
      const { player, pickType, position } = pick;
      if (pickType === "BENCHED") {
        rows[4].push(pick);
      } else {
        const rowIndex = positionRows[player.position];
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
          <PickRow key={index} style={{ opacity: index === 4 ? 0.5 : 1 }}>
            {row.map((pick) => {
              return <PlayerBlock pick={pick} key={pick.player.id} />;
            })}
          </PickRow>
        );
      })}
    </Pitch>
  );
};

export default PicksPitch;
