/**
 * Type scale. Sizes and line heights follow the Tailwind scale the web app
 * uses (text-xs ... text-3xl), plus the sizes the RestoAI design uses that
 * Tailwind does not name (caption, body, title, display).
 */
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  /** Helper and error text. */
  caption: 13,
  /** Tagline and secondary body text. */
  body: 15,
  /** Screen headings in the design (e.g. the greeting title). */
  title: 28,
  /** Splash and login brand title. */
  display: 32,
} as const;

export const lineHeight = {
  xs: 16,
  sm: 20,
  base: 24,
  lg: 28,
  xl: 28,
  "2xl": 32,
  "3xl": 36,
  caption: 18,
  body: 22,
  title: 34,
  display: 40,
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
} as const;

/**
 * Plus Jakarta Sans, loaded in src/app/_layout.tsx with useFonts. The keys are
 * the names the font is registered under, so use them as `fontFamily` values.
 */
export const fontFamily = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extrabold: "PlusJakartaSans_800ExtraBold",
} as const;
