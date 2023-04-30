import { describe, expect, it } from "@jest/globals";
import { sortBy } from "./sortBy";

const list = [
  { id: 1, foo: "d", bar: 0 },
  { id: 9, foo: "a", bar: 1 },
  { id: 3, foo: "d", bar: 0 },
  { id: 4, foo: "b", bar: 1 },
  { id: 2, foo: "c", bar: 0 },
  { id: 8, foo: "d", bar: 1 },
  { id: 7, foo: "d", bar: 0 },
  { id: 5, foo: "d", bar: 1 },
  { id: 6, foo: "c", bar: 0 },
];

describe("sortBy", () => {
  it("sorts", () => {
    expect(
      sortBy(list, "id")
        .map((x) => x.id)
        .join("")
    ).toEqual("123456789");
    expect(
      sortBy(list, ["foo", "id"], undefined)
        .map((x) => x.id)
        .join("")
    ).toEqual("942613578");
    expect(
      sortBy(list, ["foo", "bar"], undefined)
        .map((x) => x.id)
        .join("")
    ).toEqual("942613785");
  });
});
