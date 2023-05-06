import { LoaderFunction } from "remix";
import {
  EventStatusRT,
  FixtureRT,
  apiEndpointConfig,
} from "~/services/api/requests";
import { runtypeFetch } from "~/util/runtypeFetch";
import appConfig from "~/appConfig";
import { Array } from "runtypes";
import { randomKey } from "~/util/randomKey";
import { remoteCacheFn } from "~/services/redis.server";

export const loader: LoaderFunction = async ({ params }) => {
  const url = `${appConfig.BASE_URL}/fixtures/?event=${params.eventId}`;
  const config = apiEndpointConfig.fixtures;

  return remoteCacheFn({
    rt: config.rt,
    expireAt: config.getExpireAt(),
    key: config.getKey({ eventId: Number(params.eventId) }),
    fn: () => runtypeFetch(config.rt, url),
  });
};
