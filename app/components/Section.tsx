import styled from "styled-components";

const SectionOuter = styled.div`
  padding: 16px 12px;
  flex: 1;
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

const Section: React.FC<{ className?: string }> = (props) => {
  const { className, children } = props;
  return (
    <SectionOuter className={className}>
      <SectionInner>{children}</SectionInner>
    </SectionOuter>
  );
};

export default Section;
