import type { ThemeColors } from "@/types/theme";

/**
 * Color tokens for the mobile app.
 *
 * The neutral tokens (background, foreground, card, ...) use the same names and
 * values as the web theme in apps/web/src/index.css, converted from oklch to
 * hex because React Native does not support oklch. The brand tokens collect the
 * orange palette that the web components apply through Tailwind classes.
 */
export const lightColors: ThemeColors = {
  background: "#ffffff",
  foreground: "#020618",
  card: "#ffffff",
  cardForeground: "#020618",
  primary: "#0f172b",
  primaryForeground: "#f8fafc",
  secondary: "#f1f5f9",
  secondaryForeground: "#0f172b",
  muted: "#f1f5f9",
  mutedForeground: "#62748e",
  accent: "#f1f5f9",
  accentForeground: "#0f172b",
  destructive: "#e7000b",
  border: "#e2e8f0",
  input: "#e2e8f0",
  ring: "#90a1b9",
  brand: "#f97316",
  brandForeground: "#ffffff",
  brandMuted: "#fff7ed",
  brandBorder: "#fed7aa",
  brandGradient: ["#f97316", "#f43f5e"],
  success: "#059669",
  successMuted: "#ecfdf5",
  rating: "#fbbf24",
};

export const darkColors: ThemeColors = {
  background: "#0b121d",
  foreground: "#e6ecf3",
  card: "#121a26",
  cardForeground: "#e6ecf3",
  primary: "#ff7c25",
  primaryForeground: "#fdf9f7",
  secondary: "#1a2331",
  secondaryForeground: "#e6ecf3",
  muted: "#1a2330",
  mutedForeground: "#9ea9b7",
  accent: "#1e2a3e",
  accentForeground: "#f8fafc",
  destructive: "#ff6467",
  border: "rgba(174, 184, 198, 0.18)",
  input: "rgba(174, 184, 198, 0.22)",
  ring: "#ff7716",
  brand: "#ff7c25",
  brandForeground: "#fdf9f7",
  brandMuted: "rgba(249, 115, 22, 0.12)",
  brandBorder: "rgba(249, 115, 22, 0.35)",
  brandGradient: ["#f97316", "#f43f5e"],
  success: "#34d399",
  successMuted: "rgba(16, 185, 129, 0.12)",
  rating: "#fbbf24",
};
