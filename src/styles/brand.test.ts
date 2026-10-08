import { describe, expect, it } from "vitest";
import { brand, brandHues } from "./brand";

describe("brand colours", () => {
  it("derives hex colours from the tokens", () => {
    for (const value of [brand.accent, brand.accentDeep, brand.note(brandHues.sun)]) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});
