export function getKeys<O>(obj: O) {
  const keys = Object.keys(obj) as Array<keyof O>;
  return keys;
}
