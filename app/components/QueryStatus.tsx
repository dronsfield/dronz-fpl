import React from "react";
import styled from "styled-components";
import colors from "~/style/colors";
import { Loader } from "~/components/Loader";
import { useIsFetching } from "@tanstack/react-query";
import { useStale } from "~/hooks/useStale";
import { useDimensions } from "~/hooks/useDimensions";

const Container = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px 16px;
  background-color: white;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  transform: translateY(0%);
  transition: 0.2s ease-out transform;
  &[aria-hidden="true"] {
    transform: translateY(100%);
  }
`;

export interface QueryStatusProps {
  foo?: string;
}

const QueryStatus: React.FC<QueryStatusProps> = (props) => {
  const isFetching = useIsFetching();
  const isStale = useStale().isStale;
  const isHidden = !isFetching && !isStale;
  const ref = React.useRef(null);
  const { height, width } = useDimensions({ ref, deps: [isStale, isFetching] });
  return (
    <>
      <Container aria-hidden={isHidden} ref={ref}>
        {isFetching ? (
          <>
            <Loader size={16} color={colors.purple} />
            <span>Checking for new data...</span>
          </>
        ) : isStale ? (
          <span>
            Some data is stale because of a request error. Refresh to attempt to
            fix.
          </span>
        ) : null}
      </Container>
      {isHidden ? null : <div style={{ height, width }} />}
    </>
  );
};

export default QueryStatus;
