import { LoaderFunction } from "remix";
import {
  BootstrapRT,
  EventStatusRT,
  apiEndpointConfig,
} from "~/services/api/requests";
import { runtypeFetch } from "~/util/runtypeFetch";
import appConfig from "~/appConfig";
import betterFetch from "~/util/betterFetch";
import { remoteCacheFn } from "~/services/redis.server";
import { createCachedFnFactory } from "~/services/cacheFn";
import { parseCurrentEventIdFromBootstrap } from "~/services/api";
import { localServerCache, localServerCacheFn } from "~/services/serverCache";

export const loader = async () => {
  const url = `${appConfig.BASE_URL}/bootstrap-static/`;
  const config = apiEndpointConfig.bootstrap;

  const fetchBootstrap = async () =>
    betterFetch<any>(url).then((resp) => {
      const trimmed = {
        events: resp.events.map((event: any) => {
          const { id, finished, is_current, deadline_time_epoch } = event;
          return {
            id,
            finished,
            is_current,
            deadline_time_epoch: deadline_time_epoch || null,
          };
        }),
        elements: resp.elements.map((element: any) => {
          const {
            id,
            first_name,
            second_name,
            web_name,
            team,
            team_code,
            selected_by_percent,
            element_type,
            now_cost,
          } = element;
          return {
            id,
            first_name,
            second_name,
            web_name,
            team,
            team_code,
            selected_by_percent,
            element_type,
            now_cost,
          };
        }),
        teams: resp.teams.map((team: any) => {
          const { code, id, name, short_name } = team;
          return {
            code,
            id,
            name,
            short_name,
          };
        }),
      };
      return config.rt.check(trimmed);
    });

  const cacheFnOpts = {
    rt: config.rt,
    expireAt: config.getExpireAt(),
    key: config.getKey(),
    fn: fetchBootstrap,
  };

  try {
    // console.log({ localServerCache });
    const localResult = await localServerCacheFn(cacheFnOpts);
    if (localResult.stale) throw new Error("local result is stale");
    if (!localResult.fromCache)
      throw new Error(
        "remote cache needs to be updated too, so run remoteCacheFn"
      );
    return localResult;
  } catch (err) {
    console.error(err);
    return remoteCacheFn(cacheFnOpts);
  }
};
