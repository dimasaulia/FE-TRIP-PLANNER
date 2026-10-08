import { describe, expect, it } from "vitest";
import { en } from "./dictionaries/en";
import { id } from "./dictionaries/id";

describe("dictionaries", () => {
  it("have exactly the same keys", () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(id).sort());
  });

  it("keep the same placeholders in both languages", () => {
    const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort().join();
    for (const key of Object.keys(id) as Array<keyof typeof id>) {
      expect(placeholders(en[key]), key).toBe(placeholders(id[key]));
    }
  });
});
