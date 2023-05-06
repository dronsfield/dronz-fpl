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

export const loader: LoaderFunction = async () => {
  const url = `${appConfig.BASE_URL}/bootstrap-static/`;
  const config = apiEndpointConfig.bootstrap;

  return remoteCacheFn({
    rt: config.rt,
    expireAt: config.getExpireAt(),
    key: config.getKey(),
    fn: () =>
      betterFetch<any>(url).then((resp) => {
        const trimmed = {
          events: resp.events.map((event: any) => {
            const { id, finished, is_current } = event;
            return {
              id,
              finished,
              is_current,
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
      }),
  });

  return;
};
