import kv from "@vercel/kv";
import { createCachedFnFactory } from "./cacheFn";

const remoteCacheFn = createCachedFnFactory({
  getItem: kv.get,
  setItem: kv.set,
});

export { remoteCacheFn };
