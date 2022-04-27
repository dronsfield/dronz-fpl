import Redis from "ioredis";
import { Runtype } from "runtypes";
import { logDuration } from "~/util/logDuration";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
console.log({ REDIS_URL });

const redis = new Redis(REDIS_URL);
export default redis;

const __cacheCounter: any = {};
function cacheLog(type: "HIT" | "MISSED" | "PASSED", url: string) {
  // console.log(`${type}: ${url}`);
  // __cacheCounter[type] = (__cacheCounter[type] || 0) + 1;
  // console.log(JSON.stringify(__cacheCounter));
}

export async function cacheFn<R>(opts: {
  key: string;
  rt: Runtype<R>;
  fn: () => Promise<R>;
  expireAt: number | null;
}): Promise<R> {
  try {
    const { key, rt, fn, expireAt } = opts;

    try {
      if (!expireAt) throw new Error("no expireAt");
      const cacheDuration = logDuration(`${key} - redis.get`);
      const result = await redis.get(key);
      cacheDuration.end();
      if (result) {
        const parsed = JSON.parse(result);
        const checked = rt.check(parsed);
        cacheLog(`HIT`, key);
        return checked;
      } else {
        throw new Error("not cached");
      }
    } catch (err) {
      const fnDuration = logDuration(`${key} - fn()`);
      const result = await fn();
      fnDuration.end();
      try {
        if (expireAt) {
          await redis.set(key, JSON.stringify(result));
          await redis.expireat(key, expireAt);
          cacheLog(`MISSED`, key);
        } else {
          cacheLog(`PASSED`, key);
        }
      } catch (err) {
        // in case of redis errors
        console.log("UNEXPECTED REDIS ERROR", err);
      }
      return result;
    }
  } catch (err) {
    console.log("UNEXPECTED CACHEFETCH ERROR", err);
    throw err;
  }
}
