import React from "react";
import {useMatches, useParams} from "remix";
import {leagueLoader, LeagueLoaderData} from "~/loaders/leagueLoader";
import {rootLoader, RootLoaderData} from "~/loaders/rootLoader";
import {QueryObserverResult, useQuery} from "@tanstack/react-query";
import {useUser} from "~/hooks/useUser";
import dayjs from "dayjs";

const logQuery = (query: QueryObserverResult, label: string) => {

  console.log(`${label}\n` + JSON.stringify({
    hasData: !!query.data,
    updatedAt: query.dataUpdatedAt ? dayjs(query.dataUpdatedAt).fromNow() : null,
    isFetching: query.isFetching,

  }, null, 2))

}

export function useRootLoaderQuery() {
  const user = useUser()
  const query = useQuery({
    queryKey: ["root", user?.userId],
    queryFn: () => rootLoader(user)
  })
  logQuery(query, "rootQuery")

  return query
}

export function useLeagueLoaderQuery() {
  const { id = "" } = useParams()
  const query = useQuery({
    queryKey: ["league", id],
    queryFn: () => leagueLoader({ params: { id }})
  })
  logQuery(query, "leagueQuery")

  return query
}

export function useLeagueData() {
  const leagueQuery = useLeagueLoaderQuery()

  const rootQuery = useRootLoaderQuery()
  if (!leagueQuery.data || !rootQuery.data) throw new Error("expected league data!")
  return {...rootQuery.data.bootstrap, ...leagueQuery.data}
}

export function useProfileData() {
  const rootQuery = useRootLoaderQuery()
  return rootQuery.data?.profile || null

}