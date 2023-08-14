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
import { getUserId } from "~/services/session.server";
import { track } from "~/services/tracking";
import fs from "fs";
import path from "path";

let localServerCache: { [key: string]: string } = {};

const localServerCacheFn = createCachedFnFactory({
  getItem: (key: string) => localServerCache[key] || null,
  setItem: (key: string, value: string) => {
    localServerCache[key] = value;
  },
  logLabel: "bootstrap-local-cache",
});

const getFolder = () => {
  return process.env.NODE_ENV === "development"
    ? path.join(process.cwd(), "tmp")
    : "/tmp";
};
const getFile = (key: string) => {
  const sanitised = key.replace(/\//g, "-");
  return path.join(getFolder(), `${sanitised}.json`);
};

const fsCacheFn = createCachedFnFactory({
  getItem: async (key: string) => {
    const file = getFile(key);
    return fs.readFileSync(file, "utf8");
  },
  setItem: async (key: string, value) => {
    const file = getFile(key);
    if (!fs.existsSync(getFolder())) {
      fs.mkdirSync(getFolder());
    }
    fs.writeFileSync(file, value, "utf8");
  },
  logLabel: "fs-cache",
});

export const loader: LoaderFunction = async ({ request }) => {
  const url = `${appConfig.BASE_URL}/bootstrap-static/`;
  const config = apiEndpointConfig.bootstrap;

  const fetchBootstrap = async () =>
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
    });

  const trackProps = {
    distinct_id: await getUserId(request),
    route: "bootstrap",
    url: request.url,
  };

  const cacheFnOpts = {
    rt: config.rt,
    expireAt: config.getExpireAt(),
    key: config.getKey(),
    fn: fetchBootstrap,
  };

  try {
    const result = await fsCacheFn(cacheFnOpts);
    track("api", {
      ...trackProps,
      from_redis: false,
      from_fs: result.fromCache,
      stale: result.stale,
      success: true,
    });
    return result;
  } catch (err) {
    track("api", {
      ...trackProps,
      success: false,
    });
    throw err;
  }

  // try {
  //   const localResult = await localServerCacheFn(cacheFnOpts);
  //   if (localResult.stale) throw new Error("local result is stale");

  //   if (localResult.fromCache) {
  //     track("api", {
  //       ...trackProps,
  //       from_redis: false,
  //       from_local: true,
  //       stale: false,
  //       success: true,
  //     });
  //     return localResult;
  //   } else {
  //     const result = await remoteCacheFn({
  //       ...cacheFnOpts,
  //       fn: async () => localResult.data,
  //     });
  //     track("api", {
  //       ...trackProps,
  //       from_redis: result.fromCache,
  //       from_local: false,
  //       stale: result.stale,
  //       success: true,
  //     });
  //   }
  // } catch (err) {
  //   console.error(err);
  //   try {
  //     const result = await remoteCacheFn(cacheFnOpts);
  //     track("api", {
  //       ...trackProps,
  //       from_redis: result.fromCache,
  //       from_local: false,
  //       stale: result.stale,
  //       success: true,
  //     });

  //     return result;
  //   } catch (err) {
  //     track("api", {
  //       ...trackProps,
  //       success: false,
  //     });
  //   }
  // }
};
