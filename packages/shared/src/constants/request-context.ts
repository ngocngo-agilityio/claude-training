/** Names used to save and read values from Mastra RequestContext. */
export const REQUEST_CONTEXT_KEYS = {
  TIMEZONE: "timezone",
  CURRENT_DATE: "currentDate",
  CURRENT_TIME: "currentTime",
} as const;

export const REQUEST_CONTEXT_HEADERS = {
  TIMEZONE: "x-user-timezone",
} as const;

export const DEFAULT_REQUEST_CONTEXT = {
  TIMEZONE: "UTC",
} as const;
