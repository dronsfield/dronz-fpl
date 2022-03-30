import styled from "styled-components";

const Background = styled.div`
  position: fixed;
  z-index: -1;
  inset: 0;
  background-image: linear-gradient(
    30deg,
    hsl(295deg 100% 12%) 0%,
    hsl(278deg 67% 24%) 11%,
    hsl(273deg 65% 31%) 22%,
    hsl(271deg 63% 37%) 33%,
    hsl(270deg 63% 42%) 44%,
    hsl(269deg 63% 47%) 56%,
    hsl(269deg 65% 51%) 67%,
    hsl(268deg 75% 55%) 78%,
    hsl(268deg 87% 58%) 89%,
    hsl(268deg 100% 62%) 100%
  );
`;

export default Background;
