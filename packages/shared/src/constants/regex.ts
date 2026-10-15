export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  CARRIAGE_RETURN_LINE_BREAKS: /\r\n?/g,
  CONTROL_CHARACTERS: /[\p{Cc}]/gu,
  SPACES_AND_TABS: /[\p{Zs}\t]+/gu,
};
