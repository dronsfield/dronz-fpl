import { createCachedFnFactory } from "~/services/cacheFn";

export let localServerCache: { [key: string]: string } = {};

export const localServerCacheFn = createCachedFnFactory({
  getItem: (key: string) => localServerCache[key] || null,
  setItem: (key: string, value: string) => {
    localServerCache[key] = value;
  },
  logLabel: "bootstrap-local-cache",
});
