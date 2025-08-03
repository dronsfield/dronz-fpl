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
import { randomizeManagerStandingsWithBuyIn } from "~/util/randomizeManagerStandings";
import { Params } from "react-router";

const buyInsByName: { [id: string]: number } = {};
managersData.forEach((manager) => {
  buyInsByName[String(manager.name).toLowerCase()] = manager.buyIn || 0;
});

export interface LeagueLoaderData {
  id: number;
  name: string;
  managers: ManagerWithPrize[];
  prizeCalculation: PrizeCalculation;
  stale: boolean;
}

export const leagueLoader = async ({ params }: { params: Params }) => {
  console.log("exec loader: league");
  const id = Number(params.id);
  invariant(id, "expected params.id");

  let stale = false;

  const duration = logDuration(`leagueLoader`);
  const currentEventIdResponse = await getCurrentEventId();
  const currentEventId = currentEventIdResponse.data;
  if (currentEventIdResponse.stale) stale = true;
  const leagueData = await getLeague(id, currentEventId);

  const buyInManagers: BuyInManager[] = leagueData.managers.map((manager) => {
    const buyIn =
      leagueData.id === appConfig.LEAGUE_ID
        ? buyInsByName[String(manager.name).toLowerCase()] || 0
        : 0;
    return { ...manager, buyIn };
  });

  // Randomize manager standings if currentEventId is 0 and it's the main league
  let finalManagers = buyInManagers;
  if (currentEventId === 0 && leagueData.id === appConfig.LEAGUE_ID) {
    finalManagers = randomizeManagerStandingsWithBuyIn(buyInManagers);
  }

  const prizeCalculation = calculatePrizes(finalManagers);

  const data: LeagueLoaderData = {
    ...leagueData,
    managers: prizeCalculation.managers,
    prizeCalculation,
  };
  duration.end();
  return data;
};
