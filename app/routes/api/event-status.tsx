import {LoaderFunction} from "remix";
import {EventStatusRT} from "~/services/api/requests";
import {runtypeFetch} from "~/util/runtypeFetch";
import appConfig from "~/appConfig";

export const loader: LoaderFunction = async () => {
  const url = `${appConfig.BASE_URL}/event-status/`;
  const rt = EventStatusRT;
  return runtypeFetch(rt, url)
}