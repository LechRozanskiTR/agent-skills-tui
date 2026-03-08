import { describe, expect, it } from "vitest";

import {
  clamp,
  formatFrontmatterKey,
  formatFrontmatterValue,
  normalizeFrontmatterValue,
  truncateText,
} from "./text.js";

describe("text utils", () => {
  it("truncates long strings with an ellipsis", () => {
    expect(truncateText("abcdefgh", 5)).toBe("abcd…");
  });

  it("clamps values to the provided range", () => {
    expect(clamp(10, 0, 5)).toBe(5);
    expect(clamp(-2, 0, 5)).toBe(0);
    expect(clamp(3, 0, 5)).toBe(3);
  });

  it("formats frontmatter keys for display", () => {
    expect(formatFrontmatterKey("install-command")).toBe("Install Command");
    expect(formatFrontmatterKey("skill_name")).toBe("Skill Name");
  });

  it("formats nested frontmatter values", () => {
    expect(formatFrontmatterValue(["a", "b"])).toBe("a, b");
    expect(formatFrontmatterValue({ key: "value" })).toBe('{"key":"value"}');
    expect(normalizeFrontmatterValue("  hello  ")).toBe("hello");
  });
});
