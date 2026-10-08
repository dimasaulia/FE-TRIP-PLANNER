import { describe, expect, it } from "vitest";
import { normalizeMarkdown, roundTripMarkdown, wouldLoseContent } from "./markdown-guard";

describe("markdown round trip", () => {
  it("keeps supported blocks", () => {
    const source = [
      "# Hari pertama",
      "",
      "Sarapan di **pasar** lalu ke [pantai](https://example.com).",
      "",
      "- [ ] tiket",
      "- [x] hotel",
      "",
      "1. satu",
      "2. dua",
      "",
      "> catatan",
      "",
      "![](/api/v1/files/t/abc.png)",
    ].join("\n");
    expect(wouldLoseContent(source)).toBe(false);
    expect(roundTripMarkdown(source)).toContain("- [x] hotel");
  });

  it("flags constructs the editor cannot hold", () => {
    const table = "| a | b |\n| - | - |\n| 1 | 2 |";
    expect(wouldLoseContent(table)).toBe(true);
  });

  it("ignores pure formatting differences", () => {
    expect(normalizeMarkdown("* a\n*  b  \n\n\n\ntext")).toBe("- a\n- b\n\ntext");
  });
});
