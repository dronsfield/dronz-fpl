import styled, { keyframes } from "styled-components";

const spin = keyframes`
  to {transform: rotate(360deg);}
`;

export const Loader = styled.div<{ size: number; color?: string }>`
  font-size: ${(p) => p.size}px;
  position: relative;
  ${(p) => `
  width: ${p.size}px;
  height: ${p.size}px;
  `}

  &:before {
    ${(p) => `
    width: ${p.size}px;
    height: ${p.size}px;
    margin-top: -${0.5 * p.size}px;
    margin-left: -${0.5 * p.size}px;
    `}
    content: "";
    box-sizing: border-box;
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 50%;
    border-top: 2px solid ${(p) => p.color || "currentColor"};
    border-right: 2px solid transparent;
    animation: ${spin} 0.8s linear infinite;
  }
`;
