import React, { ButtonHTMLAttributes } from "react";
import styled from "styled-components";
import VisuallyHidden from "./VisuallyHidden";

// https://jonsuh.com/hamburgers/

interface StyleProps {
  $isActive: boolean;
}

const HamburgerButtonBase = styled.button<StyleProps>`
  color: white;

  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  overflow: hidden;

  padding: 8px 12px;
  display: inline-block;
  cursor: pointer;
  transition-property: opacity, filter;
  transition-duration: 0.15s;
  transition-timing-function: linear;
  font: inherit;
  text-transform: none;
  background-color: transparent;
  border: 0;
  margin: 0;
  overflow: visible;
`;

const HamburgerBox = styled.span`
  width: 30px;
  height: 24px;
  display: inline-block;
  position: relative;
`;

const HamburgerInner = styled.span<StyleProps>`
  background-color: currentColor;

  top: 50%;
  margin-top: -1px;
  transition-duration: 0.22s;
  transition-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
  ${(p) =>
    p.$isActive
      ? `
  transform: rotate(225deg);
  transition-delay: 0.12s;
  transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  `
      : ``}

  &, &:before, &:after {
    content: "";
    display: block;
    width: 30px;
    height: 2px;
    background-color: currentColor;
    border-radius: 1px;
    position: absolute;
    transition-property: transform;
    transition-duration: 0.15s;
    transition-timing-function: ease;
  }
  &:before {
    top: -8px;
    transition: top 0.1s 0.25s ease-in, opacity 0.1s ease-in;
    ${(p) =>
      p.$isActive
        ? `
    top: 0;
    opacity: 0;
    transition: top 0.1s ease-out, opacity 0.1s 0.12s ease-out;
  `
        : ``}
  }
  &:after {
    bottom: -8px;
    transition: bottom 0.1s 0.25s ease-in,
      transform 0.22s cubic-bezier(0.55, 0.055, 0.675, 0.19);
    ${(p) =>
      p.$isActive
        ? `
    bottom: 0;
    transform: rotate(-90deg);
    transition: bottom 0.1s ease-out, transform 0.22s 0.12s cubic-bezier(0.215, 0.61, 0.355, 1);
  `
        : ``}
  }
`;

export const HamburgerFake = styled.div`
  height: 30px;
  width: 24px;
`;

export const HamburgerButton: React.FC<
  ButtonHTMLAttributes<HTMLButtonElement> & { isActive: boolean }
> = (props) => {
  const { children, isActive } = props;
  return (
    <>
      <HamburgerButtonBase {...props} $isActive={isActive}>
        <HamburgerBox>
          <HamburgerInner $isActive={isActive} />
        </HamburgerBox>

        <VisuallyHidden>{children}</VisuallyHidden>
      </HamburgerButtonBase>
    </>
  );
};
