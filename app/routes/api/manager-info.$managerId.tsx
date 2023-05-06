import { LoaderFunction } from "remix";
import {
  EventStatusRT,
  ManagerInfoRT,
  apiEndpointConfig,
} from "~/services/api/requests";
import { runtypeFetch } from "~/util/runtypeFetch";
import appConfig from "~/appConfig";
import { remoteCacheFn } from "~/services/redis.server";

export const loader: LoaderFunction = async ({ params }) => {
  const url = `${appConfig.BASE_URL}/entry/${params.managerId}/`;
  const config = apiEndpointConfig.managerInfo;

  return remoteCacheFn({
    rt: config.rt,
    expireAt: config.getExpireAt(),
    key: config.getKey({ managerId: Number(params.managerId) }),
    fn: () => runtypeFetch(config.rt, url),
  });
};
