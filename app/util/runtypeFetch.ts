import { Runtype, ValidationError } from "runtypes";
import betterFetch from "./betterFetch";

export async function runtypeFetch<T, R>(runtype: Runtype<R>, url: string) {
  try {
    const result = await betterFetch<T>(url, { contentType: "json" });
    const checkedResult = runtype.check(result);
    return checkedResult;
  } catch (err) {
    if (err instanceof ValidationError) {
      console.error(err, { url });
    }
    throw err;
  }
}
