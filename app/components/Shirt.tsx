import React from "react";
import styled from "styled-components";

const srcBase = `https://fantasy.premierleague.com/dist/img/shirts/standard/`;

const ShirtImg = styled.img`
  height: 20px;
  width: auto;
`;

export interface ShirtProps {
  teamCode: number;
  isGoalkeeper?: boolean;
  size?: number;
}
const Shirt: React.FC<ShirtProps> = (props) => {
  const { teamCode, isGoalkeeper, size: number } = props;

  const posCode = isGoalkeeper ? `_1` : ``;
  const src = `${srcBase}shirt_${teamCode}${posCode}-66.png`;

  return <ShirtImg src={src} />;
};

export default Shirt;
