import Redis from "ioredis";
import { Runtype } from "runtypes";
import { runtypeFetch } from "~/util/runtypeFetch";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
console.log({ REDIS_URL });

const redis = new Redis(REDIS_URL);
export default redis;

const __cacheCounter: any = {};
function cacheLog(type: "HIT" | "MISSED" | "PASSED", url: string) {
  console.log(`${type}: ${url}`);
  __cacheCounter[type] = (__cacheCounter[type] || 0) + 1;
  console.log(JSON.stringify(__cacheCounter));
}

export async function cacheFetch<R>(opts: {
  url: string;
  rt: Runtype<R>;
  expireAt: number | null;
}) {
  try {
    const { url, rt, expireAt } = opts;
    const key = `${url}`;

    try {
      if (!expireAt) throw new Error("no expireAt");
      const result = await redis.get(key);
      if (result) {
        const parsed = JSON.parse(result);
        const checked = rt.check(parsed);
        cacheLog(`HIT`, url);
        return checked;
      } else {
        throw new Error("not cached");
      }
    } catch (err) {
      const response = await runtypeFetch(rt, url);
      try {
        if (expireAt) {
          await redis.set(key, JSON.stringify(response));
          await redis.expireat(key, expireAt);
          cacheLog(`MISSED`, url);
        } else {
          cacheLog(`PASSED`, url);
        }
      } catch (err) {
        // in case of redis errors
        console.log("UNEXPECTED REDIS ERROR", err);
      }
      return response;
    }
  } catch (err) {
    console.log("UNEXPECTED CACHEFETCH ERROR", err);
    throw err;
  }
}
