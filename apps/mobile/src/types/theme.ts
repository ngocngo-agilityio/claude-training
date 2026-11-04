import type { THEMES } from "@/constants/theme";

export type Theme = (typeof THEMES)[keyof typeof THEMES];

/** Color tokens that every theme defines. */
export type ThemeColors = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  /** Captions, helper text and placeholders: lighter than mutedForeground. */
  subtle: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  /** Soft background behind error and voice-mode surfaces. */
  dangerMuted: string;
  dangerBorder: string;
  border: string;
  input: string;
  ring: string;
  /** Main brand color: primary actions, links and highlights. */
  brand: string;
  brandForeground: string;
  /** Focus halo around brand-bordered inputs. */
  brandRing: string;
  /** Soft brand surface: user bubbles and selected rows. */
  brandMuted: string;
  brandBorder: string;
  /** Start and end colors of the brand gradient (buttons, app icon). */
  brandGradient: readonly [string, string];
  success: string;
  successMuted: string;
  successBorder: string;
  /** Star color for restaurant ratings. */
  rating: string;
  /** Elevation for floating surfaces such as the chat input pill. */
  shadow: string;
  /** Placeholder bars while content loads, such as restaurant cards. */
  skeleton: string;
  /** Dimming layer behind an open drawer or sheet. */
  scrim: string;
};

/** Value shared by ThemeProvider through the useTheme hook. */
export type ThemeProviderState = {
  theme: Theme;
  /** Color tokens of the active theme. */
  colors: ThemeColors;
  setTheme: (theme: Theme) => void;
};
