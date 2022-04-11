import React from "react";
import { useMatches } from "remix";
import { LeagueData } from "~/routes/league/$id";
import { ManagerProfile } from "~/services/api";

export function useRouteData<Data>(id: string) {
  const matches = useMatches();
  const data = React.useMemo(() => {
    for (let ii = 0; ii < matches.length; ii++) {
      const match = matches[ii];
      if (match.id === id) return match.data as Data;
    }
  }, [matches]);
  if (data === undefined) throw new Error(`No data for route "${id}"`);
  return data;
}

export function useLeagueData() {
  return useRouteData<LeagueData>("routes/league/$id");
}

export function useProfileData() {
  return useRouteData<ManagerProfile | null>("root");
}
