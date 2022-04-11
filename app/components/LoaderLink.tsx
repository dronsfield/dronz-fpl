import React, { ComponentProps } from "react";
import { useTransition } from "remix";
import styled from "styled-components";
import FlexRow from "./FlexRow";
import { Loader } from "./Loader";
import PlainLink from "./PlainLink";

const LinkContainer = styled(FlexRow)``;

const SpinnerContainer = styled.div`
  width: 0;
  transform: translateX(8px);
`;

export interface LoaderLinkProps {
  to: string;
  as?: ComponentProps<typeof PlainLink>["as"];
  className?: string;
  onLoadEnd?: () => void;
}
const LoaderLink = React.forwardRef<
  any,
  React.PropsWithChildren<LoaderLinkProps>
>((props, ref) => {
  const { to, as, className, onLoadEnd, children } = props;
  const [isLoading, setIsLoading] = React.useState(false);

  const transition = useTransition();

  React.useEffect(() => {
    // janky solution to showing spinner even if the link
    // results in a redirect
    if (transition.type === "idle") {
      setIsLoading((isLoading) => {
        if (isLoading && onLoadEnd) onLoadEnd();
        return false;
      });
    } else {
      if (transition.location.pathname === to) {
        setIsLoading(true);
      }
    }
  }, [transition.type, transition.location, to]);

  return (
    <LinkContainer>
      <PlainLink {...{ to, as, className, children, ref }} />
      {isLoading || false ? (
        <SpinnerContainer>
          {/* <Spacer width={8} shrink={false} height={1} /> */}
          <Loader size={14} />
        </SpinnerContainer>
      ) : null}
    </LinkContainer>
  );
});

export default LoaderLink;
