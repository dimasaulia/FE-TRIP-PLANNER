import { describe, expect, it } from "vitest";
import { tokens } from "@/styles/tokens";
import { assignHues, nextFreeHue, normalizeCategory } from "./category-color.service";

describe("category colours", () => {
  it("normalises labels", () => {
    expect(normalizeCategory("  Kuliner   Malam ")).toBe("kuliner malam");
  });

  it("keeps hues unique per trip and stable for known labels", () => {
    const first = assignHues({}, ["Kuliner", "Pantai", "kuliner "]);
    expect(Object.keys(first)).toEqual(["kuliner", "pantai"]);
    expect(first.kuliner).not.toBe(first.pantai);
    expect(assignHues(first, ["Pantai"])).toBe(first);
  });

  it("falls back to golden-angle hues once the palette is used up", () => {
    const used = [...tokens.note.paletteHues];
    const hue = nextFreeHue(used);
    expect(used).not.toContain(hue);
  });
});
