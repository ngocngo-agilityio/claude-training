import type { ThemeColors } from "@/types/theme";

/**
 * Color tokens for the mobile app, taken from the RestoAI mobile design
 * (Home, Login and Splash artboards). React Native does not support oklch or
 * CSS variables, so every value is a hex or rgba string.
 *
 * Light uses the warm stone neutrals of the design. Dark keeps the blue-slate
 * ground the app already shipped with, which the design's dark artboards use.
 */
export const lightColors: ThemeColors = {
  background: "#f7f5f2",
  foreground: "#1c1917",
  card: "#ffffff",
  cardForeground: "#1c1917",
  primary: "#1c1917",
  primaryForeground: "#fafaf9",
  secondary: "#f5f5f4",
  secondaryForeground: "#1c1917",
  muted: "#f5f5f4",
  mutedForeground: "#57534e",
  subtle: "#78716c",
  accent: "#f5f5f4",
  accentForeground: "#1c1917",
  destructive: "#be123c",
  dangerMuted: "#fff1f2",
  dangerBorder: "#fecdd3",
  border: "#e7e5e4",
  input: "#e7e5e4",
  ring: "#a8a29e",
  brand: "#c2410c",
  brandForeground: "#ffffff",
  brandRing: "rgba(194, 65, 12, 0.14)",
  brandMuted: "#ffedd5",
  brandBorder: "#fed7aa",
  brandGradient: ["#c2410c", "#e11d48"],
  success: "#047857",
  successMuted: "#ecfdf5",
  successBorder: "#a7f3d0",
  rating: "#fbbf24",
  shadow: "0px 8px 24px rgba(28, 25, 23, 0.08)",
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
  subtle: "#8793a3",
  accent: "#1e2a3e",
  accentForeground: "#f8fafc",
  destructive: "#ff6467",
  dangerMuted: "rgba(255, 100, 103, 0.12)",
  dangerBorder: "rgba(255, 100, 103, 0.35)",
  border: "rgba(174, 184, 198, 0.18)",
  input: "rgba(174, 184, 198, 0.22)",
  ring: "#ff7716",
  brand: "#ff7c25",
  brandForeground: "#fdf9f7",
  brandRing: "rgba(249, 115, 22, 0.14)",
  brandMuted: "rgba(249, 115, 22, 0.14)",
  brandBorder: "rgba(249, 115, 22, 0.35)",
  brandGradient: ["#f97316", "#f43f5e"],
  success: "#34d399",
  successMuted: "rgba(16, 185, 129, 0.12)",
  successBorder: "rgba(52, 211, 153, 0.35)",
  rating: "#fbbf24",
  shadow: "0px 8px 24px rgba(0, 0, 0, 0.4)",
};
