import { LoaderFunction } from "remix";
import { EventStatusRT, apiEndpointConfig } from "~/services/api/requests";
import { runtypeFetch } from "~/util/runtypeFetch";
import appConfig from "~/appConfig";
import { remoteCacheFn } from "~/services/redis.server";
import { getUserId } from "~/services/session.server";
import { track } from "~/services/tracking";

export const loader: LoaderFunction = async ({ request }) => {
  const url = `${appConfig.BASE_URL}/event-status/`;
  const config = apiEndpointConfig.eventStatus;

  const trackProps = {
    distinct_id: await getUserId(request),
    route: "eventStatus",
    url: request.url,
  };

  try {
    const result = await remoteCacheFn({
      rt: config.rt,
      expireAt: config.getExpireAt(),
      key: config.getKey(),
      fn: () => runtypeFetch(config.rt, url),
    });
    track("api", {
      ...trackProps,
      from_redis: result.fromCache,
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
};
