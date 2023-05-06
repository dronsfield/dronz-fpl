import { LoaderFunction } from "remix";
import {
  EventStatusRT,
  FixtureRT,
  LiveRT,
  apiEndpointConfig,
} from "~/services/api/requests";
import { runtypeFetch } from "~/util/runtypeFetch";
import appConfig from "~/appConfig";
import { Array } from "runtypes";
import { remoteCacheFn } from "~/services/redis.server";

export const loader: LoaderFunction = async ({ params }) => {
  const url = `${appConfig.BASE_URL}/event/${params.eventId}/live/`;
  const config = apiEndpointConfig.live;

  return remoteCacheFn({
    rt: config.rt,
    expireAt: config.getExpireAt(),
    key: config.getKey({ eventId: Number(params.eventId) }),
    fn: () => runtypeFetch(config.rt, url),
  });
};
