import { DEFAULT_REQUEST_CONTEXT } from "@repo/shared/constants/request-context";

/**
 * Check the timezone received from the browser.
 * A valid value such as "Asia/Ho_Chi_Minh" is returned in a standard form.
 * A missing or invalid value such as "invalid-zone" falls back to "UTC".
 */
export const normalizeTimezone = (timezone: string | undefined) => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone ?? "",
    }).resolvedOptions().timeZone;
  } catch {
    return DEFAULT_REQUEST_CONTEXT.TIMEZONE;
  }
};

/**
 * Build the current date and time in the user's timezone.
 * Example for Asia/Ho_Chi_Minh:
 * { date: "2026-08-25", time: "08:30:00" }
 */
export const getCurrentDateTime = (timezone: string) => {
  // formatToParts gives separate year, month, day, hour, minute, and second
  // values, so the code does not need to split a language-specific date string.
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}:${values.second}`,
  };
};
