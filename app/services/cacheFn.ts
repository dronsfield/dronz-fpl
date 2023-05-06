import { Runtype } from "runtypes";
import { logDuration } from "~/util/logDuration";
import dayjs from "dayjs";
import wait from "~/util/wait";

const DISABLE_CACHE = false;

const CACHE_SPLITTER = "|c/A|c/H|e|";

export interface CacheFetchResult<R> {
  data: R;
  stale: boolean;
}
export function createCachedFnFactory(factoryOpts: {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => any;
}) {
  const { getItem: _getItem, setItem: _setItem } = factoryOpts;
  return () =>
    async <R>(opts: {
      key: string;
      rt: Runtype<R>;
      fn: () => Promise<R>;
      expireAt: number | null;
    }): Promise<CacheFetchResult<R>> => {
      if (DISABLE_CACHE) return { data: await opts.fn(), stale: false };

      try {
        const { key, rt, fn, expireAt } = opts;

        // get from cache
        // if expired or if no cache, get from remote
        // if remote fails, return cached w/ stale notation, or throw error
        // if remote succeeds, delete old cache, set new cache, return

        const getCached = async (): Promise<[R | null, boolean]> => {
          if (!expireAt) return [null, false];

          const result = await _getItem(key);
          if (!result) return [null, false];

          try {
            // try block bc rt.check throws
            let stale = false;
            const [expiryStr, data] = result.split(CACHE_SPLITTER);
            const expiry = Number(expiryStr);
            const now = dayjs().utc().unix();
            if (!expiry || expiry < now) stale = true;
            const parsed = JSON.parse(data);
            const checked = rt.check(parsed);
            return [checked, stale];
          } catch (err) {
            return [null, false];
          }
        };

        const [cached, stale] = await getCached();

        if (cached && !stale) return { data: cached, stale: false };

        try {
          const remoteData = await fn();
          await _setItem(
            key,
            expireAt + CACHE_SPLITTER + JSON.stringify(remoteData)
          );
          return { data: remoteData, stale: false };
        } catch (err) {
          if (cached) {
            return { data: cached, stale: true };
          } else {
            throw new Error(
              "failed to fetch anything both from cache and remote"
            );
          }
        }
      } catch (err) {
        throw err;
      }
    };
}
