import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils/class-name";

describe("cn", () => {
  it("joins class names and skips falsy values", () => {
    expect(cn("text-sm", false, undefined, "font-bold")).toBe(
      "text-sm font-bold",
    );
  });

  it("keeps the last conflicting Tailwind class", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
