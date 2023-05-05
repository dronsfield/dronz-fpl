import { Runtype } from "runtypes";
import { logDuration } from "~/util/logDuration";
import dayjs from "dayjs";
import wait from "~/util/wait";

const DISABLE_CACHE = false;

const CACHE_SPLITTER = "|c/A|c/H|e|";

const __cacheCounter: any = {};
function cacheLog(type: "HIT" | "MISSED" | "PASSED", url: string) {
  console.log(`CACHE ${type}: ${url}`);
  __cacheCounter[type] = (__cacheCounter[type] || 0) + 1;
  // console.log(JSON.stringify(__cacheCounter));
}

export interface CacheFetchResult<R> {
  data: R;
  stale: boolean;
}

export async function cacheFn<R>(opts: {
  key: string;
  rt: Runtype<R>;
  fn: () => Promise<R>;
  expireAt: number | null;
}): Promise<CacheFetchResult<R>> {
  if (DISABLE_CACHE) return { data: await opts.fn(), stale: false };

  try {
    const { key, rt, fn, expireAt } = opts;

    // get from cache
    // if expired or if no cache, get from remote
    // if remote fails, return cached w/ stale notation, or throw error
    // if remote succeeds, delete old cache, set new cache, return

    const getCached = (): [R | null, boolean] => {
      if (!expireAt) return [null, false];

      const result = localStorage.getItem(key);
      if (!result) return [null, false];

      try {
        // try block bc rt.check throws
        let stale = false;
        const [expiryStr, data] = result.split(CACHE_SPLITTER);
        const expiry = Number(expiryStr);
        const now = dayjs().utc().unix();
        console.log({ key, now, expiry });
        if (!expiry || expiry < now) stale = true;
        const parsed = JSON.parse(data);
        const checked = rt.check(parsed);
        return [checked, stale];
      } catch (err) {
        return [null, false];
      }
    };

    const [cached, stale] = getCached();

    if (cached && !stale) return { data: cached, stale: false };

    try {
      const remoteData = await fn();
      localStorage.setItem(
        key,
        expireAt + CACHE_SPLITTER + JSON.stringify(remoteData)
      );
      return { data: remoteData, stale: false };
    } catch (err) {
      if (cached) {
        return { data: cached, stale: true };
      } else {
        throw new Error("failed to fetch anything both from cache and remote");
      }
    }

    // try {
    //   if (!expireAt) throw new Error("no expireAt");
    //   // const cacheDuration = logDuration(`cacheFn - ${key} - localStorage.getItem`);
    //   const result = await localStorage.getItem(key);
    //   // cacheDuration.end();
    //   if (result) {
    //     const [expiryStr, data] = result.split(CACHE_SPLITTER);
    //     const expiry = Number(expiryStr);
    //     const now = dayjs().utc().unix();
    //     if (!expiry || expiry < now) {
    //       localStorage.removeItem(key);
    //       throw new Error("cache expired");
    //     }
    //     const parsed = JSON.parse(data);
    //     const checked = rt.check(parsed);
    //     cacheLog(`HIT`, key);
    //     return checked;
    //   } else {
    //     throw new Error("not cached");
    //   }
    // } catch (err) {
    //   // const fnDuration = logDuration(`cacheFn - ${key} - fn()`);
    //   const result = await fn();
    //   // await wait(500);
    //   // fnDuration.end();
    //   try {
    //     if (expireAt) {
    //       localStorage.setItem(
    //         key,
    //         expireAt + CACHE_SPLITTER + JSON.stringify(result)
    //       );
    //       cacheLog(`MISSED`, key);
    //     } else {
    //       cacheLog(`PASSED`, key);
    //     }
    //   } catch (err) {
    //     console.log("UNEXPECTED LOCALSTORAGE ERROR", err);
    //   }
    //   return result;
    // }
  } catch (err) {
    console.log("UNEXPECTED CACHEFETCH ERROR", err);
    throw err;
  }
}
