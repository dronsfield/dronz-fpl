import {LoaderFunction} from "remix";
import {EventStatusRT, FixtureRT} from "~/services/api/requests";
import {runtypeFetch} from "~/util/runtypeFetch";
import appConfig from "~/appConfig";
import {Array} from "runtypes";

export const loader: LoaderFunction = async ({params}) => {
  const url = `${appConfig.BASE_URL}/fixtures/?event=${params.event}`;
  const rt = Array(FixtureRT);
  return runtypeFetch(rt, url)
}