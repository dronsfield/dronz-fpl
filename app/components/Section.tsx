import styled from "styled-components";

const SectionOuter = styled.div<{ $allowOverflow?: boolean }>`
  padding: 16px 12px;
  flex: 1;
  ${(p) => (p.$allowOverflow ? "overflow-x: scroll;" : "")}
  &:nth-child(2n) {
    // background-color: #fafafa;
  }
`;

const SectionInner = styled.div`
  margin: 0 auto;
  max-width: 500px;

  p {
    margin-left: 9px;
    margin-right: 9px;
  }
`;

const Section: React.FC<{ className?: string; allowOverflow?: boolean }> = (
  props
) => {
  const { className, children, allowOverflow } = props;
  return (
    <SectionOuter className={className} $allowOverflow={allowOverflow}>
      <SectionInner>{children}</SectionInner>
    </SectionOuter>
  );
};

export default Section;
