import {Runtype} from "runtypes";
import {logDuration} from "~/util/logDuration";
import dayjs from "dayjs";
import wait from "~/util/wait";

const DISABLE_CACHE = false

const CACHE_SPLITTER = "|c/A|c/H|e|"

const __cacheCounter: any = {};
function cacheLog(type: "HIT" | "MISSED" | "PASSED", url: string) {
  console.log(`${type}: ${url}`);
  __cacheCounter[type] = (__cacheCounter[type] || 0) + 1;
  // console.log(JSON.stringify(__cacheCounter));
}

export async function cacheFn<R>(opts: {
  key: string;
  rt: Runtype<R>;
  fn: () => Promise<R>;
  expireAt: number | null;
}): Promise<R> {
  if (DISABLE_CACHE) return opts.fn()
  try {
    const { key, rt, fn, expireAt } = opts;

    try {
      if (!expireAt) throw new Error("no expireAt");
      // const cacheDuration = logDuration(`cacheFn - ${key} - localStorage.getItem`);
      const result = await localStorage.getItem(key);
      // cacheDuration.end();
      if (result) {
        const [expiryStr, data] = result.split(CACHE_SPLITTER)
        const expiry = Number(expiryStr);
        const now = dayjs().utc().unix();
        if (!expiry || expiry < now) {
          localStorage.removeItem(key)
          throw new Error("cache expired")
        }
        const parsed = JSON.parse(data);
        const checked = rt.check(parsed);
        cacheLog(`HIT`, key);
        return checked;
      } else {
        throw new Error("not cached");
      }
    } catch (err) {
      // const fnDuration = logDuration(`cacheFn - ${key} - fn()`);
      const result = await fn();
      await wait(1000)
      // fnDuration.end();
      try {
        if (expireAt) {
          localStorage.setItem(key, expireAt + CACHE_SPLITTER + JSON.stringify(result))
          cacheLog(`MISSED`, key);
        } else {
          cacheLog(`PASSED`, key);
        }
      } catch (err) {
        console.log("UNEXPECTED LOCALSTORAGE ERROR", err);
      }
      return result;
    }
  } catch (err) {
    console.log("UNEXPECTED CACHEFETCH ERROR", err);
    throw err;
  }

}