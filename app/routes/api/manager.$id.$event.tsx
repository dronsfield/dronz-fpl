import { LoaderFunction } from "remix";
import appConfig from "~/appConfig";
import { runtypeFetch } from "~/util/runtypeFetch";
import { Array } from "runtypes";
import { GameweekRT, HistoryRT, TransferRT } from "~/services/api/requests";

export const loader: LoaderFunction = async ({ params }) => {
  const managerId = params.id;
  const [gw, transfers, history] = await Promise.all([
    runtypeFetch(
      GameweekRT,
      `${appConfig.BASE_URL}/entry/${managerId}/event/${params.event}/picks/`
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
};
