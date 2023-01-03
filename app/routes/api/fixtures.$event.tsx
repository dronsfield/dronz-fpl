import { LoaderFunction } from "remix";
import { EventStatusRT, FixtureRT } from "~/services/api/requests";
import { runtypeFetch } from "~/util/runtypeFetch";
import appConfig from "~/appConfig";
import { Array } from "runtypes";
import { randomKey } from "~/util/randomKey";

export const loader: LoaderFunction = async ({ params }) => {
  const url = `${appConfig.BASE_URL}/fixtures/?event=${params.event}`;
  const rt = Array(FixtureRT);
  const fixtures = await runtypeFetch(rt, url);
  // fixtures.forEach(x => {
  //   x.team_h_score = Math.floor(Math.random()*100)
  // })
  return fixtures;
};
