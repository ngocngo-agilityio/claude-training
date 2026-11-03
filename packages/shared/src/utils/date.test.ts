import { describe, expect, it } from "vitest";
import { formatLocalDate } from "./date.ts";

describe("formatLocalDate", () => {
  it("pads single-digit month and day", () => {
    expect(formatLocalDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("formats the last day of the year", () => {
    expect(formatLocalDate(new Date(2026, 11, 31))).toBe("2026-12-31");
  });
});
