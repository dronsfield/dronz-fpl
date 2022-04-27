import React from "react";
import { useMatches } from "remix";
import { LeagueLoaderData } from "~/loaders/leagueLoader";
import { RootLoaderData } from "~/loaders/rootLoader";

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
  const leagueLoaderData = useRouteData<LeagueLoaderData>("routes/league/$id");
  const rootLoaderData = useRouteData<RootLoaderData>("root");
  return {
    ...rootLoaderData.bootstrap,
    ...leagueLoaderData,
  };
}

export function useProfileData() {
  const rootLoaderData = useRouteData<RootLoaderData>("root");
  return rootLoaderData.profile;
}
