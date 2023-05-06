import { createCachedFnFactory } from "./cacheFn";

const isBrowser = typeof window !== "undefined";

const cacheFn = createCachedFnFactory({
  getItem: (...args) => (isBrowser ? localStorage.getItem(...args) : ""),
  setItem: (...args) => (isBrowser ? localStorage.setItem(...args) : null),
});

export { cacheFn };
