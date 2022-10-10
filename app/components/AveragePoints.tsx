import styled from "styled-components";
import { ItemsOf } from "~/util/utilityTypes";

const Card = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 16px;
  p {
    margin: 0;
    text-transform: uppercase;
  }
`;

const contextKeys = ["league", "fpl"] as const;
type Context = ItemsOf<typeof contextKeys>;

export interface PointsProps {
  points: string;
  context?: Context;
}

export const AveragePoints: React.FC<PointsProps> = ({ context, points }) => {
  return (
    <Card>
      <p>
        <b>{context} Average</b>
      </p>
      <p>{points}</p>
    </Card>
  );
};
