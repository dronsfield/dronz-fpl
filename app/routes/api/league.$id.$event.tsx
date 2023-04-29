import { LoaderFunction } from "remix";
import appConfig from "~/appConfig";
import { ManagerWithPrize, PrizeCalculation } from "~/util/calculatePrizes";
import { runtypeFetch } from "~/util/runtypeFetch";
import { LeagueRT } from "~/services/api/requests";

export interface LeagueLoaderData {
  id: number;
  name: string;
  managers: ManagerWithPrize[];
  prizeCalculation: PrizeCalculation;
}

export const loader: LoaderFunction = async ({ params }) => {
  const url = `${appConfig.BASE_URL}/leagues-classic/${params.id}/standings/`;
  const rt = LeagueRT;

  const league = await runtypeFetch(rt, url);
  return league;
};
