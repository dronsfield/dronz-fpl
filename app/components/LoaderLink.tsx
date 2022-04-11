import React, { ComponentProps } from "react";
import { useTransition } from "remix";
import FlexRow from "./FlexRow";
import { Loader } from "./Loader";
import PlainLink from "./PlainLink";
import Spacer from "./Spacer";

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
    <FlexRow>
      <PlainLink {...{ to, as, className, children, ref }} />
      {isLoading ? (
        <>
          <Spacer width={8} />
          <Loader size={14} />
        </>
      ) : null}
    </FlexRow>
  );
});

export default LoaderLink;
