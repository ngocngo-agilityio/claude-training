/** Spacing scale in points, based on a 4-point grid. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
} as const;

/**
 * Corner radius scale. `sm` to `xl` match the web scale, which derives from
 * `--radius: 0.625rem` (10 points) in apps/web/src/index.css.
 */
export const radius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 14,
  "2xl": 16,
  "3xl": 24,
  full: 9999,
} as const;
