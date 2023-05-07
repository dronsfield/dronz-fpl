import React from "react";

export function useDimensions(opts: {
  ref: React.RefObject<HTMLElement>;
  deps?: Array<any>;
}) {
  const { ref, deps } = opts;

  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);

  React.useLayoutEffect(() => {
    if (ref.current) {
      setWidth(ref.current.clientWidth);
      setHeight(ref.current.clientHeight);
    }
  }, deps || []);

  React.useEffect(() => {
    function handleWindowResize() {
      if (ref.current) {
        setWidth(ref.current.clientWidth);
        setHeight(ref.current.clientHeight);
      }
    }

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  return { width, height };
}
