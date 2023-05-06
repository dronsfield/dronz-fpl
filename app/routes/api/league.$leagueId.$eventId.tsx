import { LoaderFunction } from "remix";
import appConfig from "~/appConfig";
import { ManagerWithPrize, PrizeCalculation } from "~/util/calculatePrizes";
import { runtypeFetch } from "~/util/runtypeFetch";
import { LeagueRT, apiEndpointConfig } from "~/services/api/requests";
import { remoteCacheFn } from "~/services/redis.server";

export interface LeagueLoaderData {
  id: number;
  name: string;
  managers: ManagerWithPrize[];
  prizeCalculation: PrizeCalculation;
}

export const loader: LoaderFunction = async ({ params }) => {
  const url = `${appConfig.BASE_URL}/leagues-classic/${params.leagueId}/standings/`;
  const config = apiEndpointConfig.league;

  return remoteCacheFn({
    rt: config.rt,
    expireAt: config.getExpireAt(),
    key: config.getKey({
      leagueId: Number(params.leagueId),
      eventId: Number(params.eventId),
    }),
    fn: () => runtypeFetch(config.rt, url),
  });
};
