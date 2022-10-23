import {LoaderFunction} from "remix";
import {EventStatusRT, ManagerInfoRT} from "~/services/api/requests";
import {runtypeFetch} from "~/util/runtypeFetch";
import appConfig from "~/appConfig";

export const loader: LoaderFunction = async ({params}) => {
  const url = `${appConfig.BASE_URL}/entry/${params.id}/`;
  const rt = ManagerInfoRT;
  return runtypeFetch(rt, url)
}