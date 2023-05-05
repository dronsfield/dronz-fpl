import { LoaderFunction } from "remix";
import { EventStatusRT, FixtureRT, LiveRT } from "~/services/api/requests";
import { runtypeFetch } from "~/util/runtypeFetch";
import appConfig from "~/appConfig";
import { Array } from "runtypes";

export const loader: LoaderFunction = async ({ params }) => {
  const url = `${appConfig.BASE_URL}/event/${params.event}/live/`;
  const rt = LiveRT;
  // throw new Error("deliberate 500 lfng");
  return runtypeFetch(rt, url);
};
