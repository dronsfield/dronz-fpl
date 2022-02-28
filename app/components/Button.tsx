import React from "react";
import styled from "styled-components";
import { normalizeButton } from "~/style/mixins";

const BaseButton = styled.button`
  ${normalizeButton};
`;

export interface ButtonProps {
  type: "submit" | "button";
}

const Button: React.FC<ButtonProps> = (props) => {
  const { type, children } = props;

  return <BaseButton type={type} children={children} />;
};

export default Button;
