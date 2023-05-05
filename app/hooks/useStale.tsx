import React from "react";

type StaleMap = { [key: string]: boolean };
type StaleContextType = {
  isStale: boolean;
  setStale: (key: string, isStale: boolean) => void;
};

export const StaleContext = React.createContext<StaleContextType>({
  isStale: false,
  setStale: () => {},
});

export const StaleProvider: React.FC<{}> = (props) => {
  const [staleMap, setStaleMap] = React.useState<StaleMap>({});

  const { isStale, setStale } = React.useMemo(() => {
    const setStale = (key: string, isStale: boolean) => {
      setStaleMap((staleMap) => ({ ...staleMap, [key]: isStale }));
    };
    const isStale = Object.values(staleMap).some((val) => val);
    return { isStale, setStale };
  }, [staleMap]);

  return (
    <StaleContext.Provider
      value={{ isStale, setStale }}
      children={props.children}
    />
  );
};

export const useStale = () => React.useContext(StaleContext);
