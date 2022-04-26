import React from "react";
import styled from "styled-components";
import Link from "~/components/Xlink";
import colors from "~/style/colors";
import { normalizeButton } from "~/style/mixins";

interface VariantConfig {
  color: string;
  background: string;
}

export const variantConfigs = {
  PRIMARY: {
    color: "white",
    background: colors.purple,
  },
};
type Variant = keyof typeof variantConfigs;
interface RootCompProps {
  to?: string;
  onClick?: (event: React.MouseEvent) => void;
  className?: string;
  type?: "submit" | "button";
  disabled?: boolean;
  replace?: boolean;
  isNav?: boolean;
}

const RootComp: React.FC<RootCompProps> = (props) => {
  const { to, onClick, children, className, type, disabled, replace, isNav } =
    props;
  const commonProps = { onClick, children, className, type };
  if (to) {
    return <Link {...{ to, replace, isNav }} {...commonProps} />;
  } else {
    return <button {...commonProps} disabled={disabled} />;
  }
};

const BaseButton = styled(RootComp)<{ $variant?: Variant }>`
  ${normalizeButton};
  display: inline-block;
  padding: 4px 6px;
  border-radius: 4px;
  font-weight: bold;
  text-decoration: none;
  ${(p) =>
    p.$variant
      ? `
  color: ${variantConfigs[p.$variant].color};
  background: ${variantConfigs[p.$variant].background};
  `
      : ``}
`;

export interface ButtonProps extends RootCompProps {
  variant?: Variant;
}
const Button: React.FC<ButtonProps> = (props) => {
  const { variant, ...rest } = props;
  return <BaseButton $variant={variant} {...rest} />;
};

export default Button;
