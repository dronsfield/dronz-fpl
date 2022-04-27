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

const buyInsById: { [id: string]: number } = {};
managersData.forEach((manager) => {
  buyInsById[manager.id] = manager.datePaid ? manager.buyIn : 0;
});

export interface LeagueLoaderData {
  id: number;
  name: string;
  managers: ManagerWithPrize[];
  prizeCalculation: PrizeCalculation;
}

export const leagueLoader: LoaderFunction = async ({ params }) => {
  const id = Number(params.id);
  invariant(id, "expected params.id");

  const duration = logDuration(`leagueLoader`);
  const currentEventId = await getCurrentEventId();
  const leagueData = await getLeague(id, currentEventId);

  const buyInManagers: BuyInManager[] = leagueData.managers.map((manager) => {
    const buyIn =
      leagueData.id === appConfig.LEAGUE_ID
        ? buyInsById[String(manager.id)] || 0
        : 0;
    return { ...manager, buyIn };
  });
  const prizeCalculation = calculatePrizes(buyInManagers);

  const data: LeagueLoaderData = {
    ...leagueData,
    managers: prizeCalculation.managers,
    prizeCalculation,
  };
  duration.end();
  return data;
};
