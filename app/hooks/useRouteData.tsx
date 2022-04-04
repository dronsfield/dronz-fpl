import React from "react";
import { useMatches } from "remix";

export function useRouteData<Data>(id: string) {
  const matches = useMatches();
  const data = React.useMemo(() => {
    for (let ii = 0; ii < matches.length; ii++) {
      const match = matches[ii];
      if (match.id === id) return match.data as Data;
    }
  }, [matches]);
  if (!data) throw new Error(`No data for route "${id}"`);
  return data;
}
