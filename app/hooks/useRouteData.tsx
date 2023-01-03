import React from "react";
import { useMatches, useParams } from "remix";
import { leagueLoader, LeagueLoaderData } from "~/loaders/leagueLoader";
import { rootLoader, RootLoaderData } from "~/loaders/rootLoader";
import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import { useUser } from "~/hooks/useUser";
import dayjs from "dayjs";

const logQuery = (query: QueryObserverResult, label: string) => {
  if (false) {
    console.log(
      `${label}\n` +
        JSON.stringify(
          {
            hasData: !!query.data,
            updatedAt: query.dataUpdatedAt
              ? dayjs(query.dataUpdatedAt).fromNow()
              : null,
            isFetching: query.isFetching,
          },
          null,
          2
        )
    );
  }
};

export function useRootLoaderQuery(triggerFetch = false) {
  const user = useUser();
  const query = useQuery({
    queryKey: ["root", user?.userId],
    queryFn: () => rootLoader(user),
    enabled: triggerFetch,
  });
  logQuery(query, "rootQuery");

  return query;
}

export function useLeagueLoaderQuery(triggerFetch = false) {
  const { id = "" } = useParams();
  const query = useQuery({
    queryKey: ["league", id],
    queryFn: () => leagueLoader({ params: { id } }),
    enabled: triggerFetch,
  });
  logQuery(query, "leagueQuery");

  return query;
}

export function useLeagueData(triggerFetch = false) {
  const leagueQuery = useLeagueLoaderQuery(triggerFetch);

  const rootQuery = useRootLoaderQuery();
  if (!leagueQuery.data || !rootQuery.data)
    throw new Error("expected league data!");
  return { ...rootQuery.data.bootstrap, ...leagueQuery.data };
}

export function useProfileData(triggerFetch = false) {
  const rootQuery = useRootLoaderQuery(triggerFetch);
  return rootQuery.data?.profile || null;
}
