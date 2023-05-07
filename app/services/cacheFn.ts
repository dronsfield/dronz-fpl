import { Runtype, ValidationError } from "runtypes";
import { logDuration } from "~/util/logDuration";
import dayjs from "dayjs";
import wait from "~/util/wait";
import { BetterFetchError } from "~/util/betterFetch";

const DISABLE_CACHE = false;

const CACHE_SPLITTER = "|c/A|c/H|e|";

export interface CacheFetchResult<R> {
  data: R;
  stale: boolean;
}

function isCacheFetchResult<R>(
  input: R | CacheFetchResult<R>
): input is CacheFetchResult<R> {
  let test: any = input;
  return test?.data !== undefined && test?.stale !== undefined;
}

function parseRemoteData<R>(
  remoteData: R | CacheFetchResult<R>
): CacheFetchResult<R> {
  if (isCacheFetchResult(remoteData)) {
    return { data: remoteData.data, stale: remoteData.stale };
  } else {
    return { data: remoteData, stale: false };
  }
}

export function createCachedFnFactory(factoryOpts: {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => any;
  logLabel?: string;
}) {
  const { getItem: _getItem, setItem: _setItem, logLabel } = factoryOpts;
  return async <R>(opts: {
    key: string;
    rt: Runtype<R>;
    fn: () => Promise<R> | Promise<CacheFetchResult<R>>;
    expireAt: number | null;
  }): Promise<CacheFetchResult<R>> => {
    const { key, rt, fn, expireAt } = opts;

    const log = logLabel
      ? (str: string) => console.log(`${logLabel} | ${key} | ${str} `)
      : () => {};

    if (DISABLE_CACHE) {
      const remoteData = await fn();
      return parseRemoteData(remoteData);
    }

    try {
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

      if (cached && !stale) {
        log(`returning cached data`);
        return { data: cached, stale: false };
      }

      try {
        const remoteData = await fn();
        const parsed = parseRemoteData(remoteData);
        if (!parsed.stale) {
          try {
            await _setItem(
              key,
              expireAt + CACHE_SPLITTER + JSON.stringify(parsed.data)
            );
          } catch (err) {
            log(`FAILED TO SET IN CACHE`);
            console.log(err);
          }
        }
        log(`returning remote data`);
        return parsed;
      } catch (err) {
        if (err instanceof ValidationError) {
          log(`validation error`);
          // console.log(err);
        }
        if (err instanceof BetterFetchError) {
          log(`fetch error`);
          console.log(err);
        }
        if (cached) {
          log(`failed to get from remote, returning stale cached data`);
          return { data: cached, stale: true };
        } else {
          log(`failed to get from remote or cache, throwing`);
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
