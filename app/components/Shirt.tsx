import React, { StyleHTMLAttributes } from "react";
import styled from "styled-components";

const srcBase = `https://fantasy.premierleague.com/dist/img/shirts/standard/`;

const ShirtImg = styled.img`
  width: 33px;
  height: 43.5px;
`;

export interface ShirtProps {
  teamCode: number;
  isGoalkeeper?: boolean;
  size?: number;
  style?: React.CSSProperties;
}
const Shirt: React.FC<ShirtProps> = (props) => {
  const { teamCode, isGoalkeeper, size: number, style } = props;

  const posCode = isGoalkeeper ? `_1` : ``;
  const src = `${srcBase}shirt_${teamCode}${posCode}-66.png`;

  return <ShirtImg src={src} style={style} />;
};

export default Shirt;
