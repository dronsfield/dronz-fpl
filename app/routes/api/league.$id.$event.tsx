import { LoaderFunction } from "remix";
import invariant from "tiny-invariant";
import appConfig from "~/appConfig";
import managersData from "~/data/managers.json";
import { getCurrentEventId, getLeague } from "~/services/api";
import {
  BuyInManager,
  calculatePrizes,
  ManagerWithPrize,
  PrizeCalculation,
} from "~/util/calculatePrizes";
import { logDuration } from "~/util/logDuration";
import {runtypeFetch} from "~/util/runtypeFetch";
import {Array} from "runtypes";
import {GameweekRT, HistoryRT, LeagueRT, ManagersRT, TransferRT} from "~/services/api/requests";

const buyInsByName: { [id: string]: number } = {};
managersData.forEach((manager) => {
  buyInsByName[String(manager.name).toLowerCase()] = manager.buyIn || 0;
});

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
  const results = league.standings.results;

  const managers: ManagersRT = {};
  await Promise.all(
      results.slice(0, appConfig.MAX_MANAGERS).map(async (result) => {
        const managerId = result.entry;
        const [gw, transfers, history] = await Promise.all([
          runtypeFetch(
              GameweekRT,
              `${appConfig.BASE_URL}/entry/${managerId}/event/${params.event}/picks/`
          ),
          runtypeFetch(
              Array(TransferRT),
              `${appConfig.BASE_URL}/entry/${managerId}/transfers/`
          ),
          runtypeFetch(HistoryRT, `${appConfig.BASE_URL}/entry/${managerId}/history/`),
        ]);
        managers[managerId] = { gw, transfers, history };
      })
  );
  return { ...league, managers };
};