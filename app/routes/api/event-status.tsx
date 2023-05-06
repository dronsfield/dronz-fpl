import { LoaderFunction } from "remix";
import { EventStatusRT, apiEndpointConfig } from "~/services/api/requests";
import { runtypeFetch } from "~/util/runtypeFetch";
import appConfig from "~/appConfig";
import { remoteCacheFn } from "~/services/redis.server";

export const loader: LoaderFunction = async () => {
  const url = `${appConfig.BASE_URL}/event-status/`;
  const config = apiEndpointConfig.eventStatus;

  return remoteCacheFn({
    rt: config.rt,
    expireAt: config.getExpireAt(),
    key: config.getKey(),
    fn: () => runtypeFetch(config.rt, url),
  });
};
