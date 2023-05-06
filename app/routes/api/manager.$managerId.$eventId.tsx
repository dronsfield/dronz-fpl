import { LoaderFunction } from "remix";
import appConfig from "~/appConfig";
import { runtypeFetch } from "~/util/runtypeFetch";
import { Array } from "runtypes";
import {
  GameweekRT,
  HistoryRT,
  TransferRT,
  apiEndpointConfig,
} from "~/services/api/requests";
import { remoteCacheFn } from "~/services/redis.server";

export const loader: LoaderFunction = async ({ params }) => {
  const managerId = params.managerId;
  const eventId = params.eventId;
  const config = apiEndpointConfig.manager;

  return remoteCacheFn({
    rt: config.rt,
    expireAt: config.getExpireAt(),
    key: config.getKey({
      eventId: Number(eventId),
      managerId: Number(managerId),
    }),
    fn: async () => {
      const [gw, transfers, history] = await Promise.all([
        runtypeFetch(
          GameweekRT,
          `${appConfig.BASE_URL}/entry/${managerId}/event/${eventId}/picks/`
        ),
        runtypeFetch(
          Array(TransferRT),
          `${appConfig.BASE_URL}/entry/${managerId}/transfers/`
        ),
        runtypeFetch(
          HistoryRT,
          `${appConfig.BASE_URL}/entry/${managerId}/history/`
        ),
      ]);
      return { gw, transfers, history };
    },
  });
};
