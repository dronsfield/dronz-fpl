import Redis from "ioredis";
import { createCachedFnFactory } from "./cacheFn";
import kv from "@vercel/kv";

const remoteCacheFn = createCachedFnFactory({
  getItem: kv.get,
  setItem: kv.set,
  logLabel: "kv",
});

export { remoteCacheFn };
