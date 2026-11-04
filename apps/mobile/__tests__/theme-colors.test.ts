import { darkColors, lightColors } from "@/theme/colors";
import { fontFamily } from "@/theme/typography";

describe("theme tokens", () => {
  it("light palette uses the RestoAI design values", () => {
    expect(lightColors.background).toBe("#f7f5f2");
    expect(lightColors.foreground).toBe("#1c1917");
    expect(lightColors.brand).toBe("#c2410c");
    expect(lightColors.brandMuted).toBe("#ffedd5");
    expect(lightColors.subtle).toBe("#78716c");
  });

  it("light and dark define the same token keys", () => {
    expect(Object.keys(darkColors).sort()).toEqual(
      Object.keys(lightColors).sort(),
    );
  });

  it("font family keys match the names loaded in the root layout", () => {
    expect(fontFamily.medium).toBe("PlusJakartaSans_500Medium");
    expect(fontFamily.extrabold).toBe("PlusJakartaSans_800ExtraBold");
  });
});
