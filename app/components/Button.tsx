import React from "react";
import styled from "styled-components";
import Link from "~/components/Xlink";
import { normalizeButton } from "~/style/mixins";

interface RootCompProps {
  to?: string;
  onClick?: (event: React.MouseEvent) => void;
  className?: string;
  type?: "submit" | "button";
  disabled?: boolean;
  exact?: boolean;
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

const BaseButton = styled(RootComp)`
  ${normalizeButton};
  padding: 4px 6px;
  border-radius: 4px;
  font-weight: bold;
  text-decoration: none;
`;

export interface ButtonProps extends RootCompProps {}
const Button: React.FC<ButtonProps> = (props) => {
  return <BaseButton {...props} />;
};

export default Button;
