import { ItemsOf } from "./utilityTypes";

export function recordFromArray<A extends Readonly<string[]>, Values>(
  arr: A,
  mapper: (key: ItemsOf<A>) => Values
) {
  return arr.reduce((acc, key) => {
    return { ...acc, [key]: mapper(key) };
  }, {} as Record<ItemsOf<A>, Values>);
}
