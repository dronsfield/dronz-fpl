import React from "react";
import { useParams } from "remix";
import styled from "styled-components";
import { Manager } from "~/services/api";
import colors from "~/style/colors";
import { formatName } from "~/util/formatName";
import PlainLink from "./PlainLink";

// MONEY

export const ColorSpan = styled.span<{ color?: string }>`
  ${(p) => (p.color ? `color: ${p.color};` : ``)}
`;

function formatMoney(
  value: number,
  opts?: { showSign?: boolean; showColor?: boolean }
): { children: string; color?: string } {
  const { showSign, showColor } = opts || {};
  const absValue = Math.abs(value);
  const absText = Number.isInteger(absValue)
    ? absValue.toFixed(0)
    : absValue.toFixed(2);
  if (value > 0) {
    const prefix = showSign ? "+" : "";
    return {
      children: `${prefix}£${absText}`,
      color: showColor ? colors.green : undefined,
    };
  } else if (value === 0) {
    const prefix = showSign ? "±" : "";
    return { children: `${prefix}£${absText}`, color: colors.grey };
  } else {
    return { children: `-£${absText}`, color: colors.grey };
  }
}

export const MoneyCell: React.FC<{
  showSign?: boolean;
  showColor?: boolean;
  value: number;
}> = (props) => {
  const { showSign, showColor, value } = props;
  return <ColorSpan {...formatMoney(value, { showSign, showColor })} />;
};

// MANAGER

export const ManagerCell: React.FC<{
  manager: Manager;
  currentEventId: number;
}> = (props) => {
  const { manager, currentEventId } = props;
  const { id: leagueId } = useParams<{ id: string }>();
  return (
    <PlainLink
      children={formatName(manager.name)}
      to={`/league/${leagueId}/manager/${manager.id}`}
    />
  );
};

export const HitsCell: React.FC<{ manager: Manager }> = (props) => {
  const { manager } = props;
  const cost = manager.transfers.cost;
  const hitsText = cost === null ? "?" : Math.round(0.25 * cost);
  return (
    <ColorSpan color={cost ? "currentColor" : colors.grey}>
      {hitsText}
    </ColorSpan>
  );
};
