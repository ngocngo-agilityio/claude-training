import dayjs, { type Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

dayjs.extend(customParseFormat);

const SUPPORTED_TIME_FORMATS = [
  "hA",
  "h A",
  "h:mmA",
  "h:mm A",
  "hhA",
  "hh A",
  "hh:mmA",
  "hh:mm A",
  "H:mm",
  "HH:mm",
];

/**
 * Parses the time formats accepted by the chatbot.
 * Strict parsing prevents values such as "25:00" from being corrected silently.
 */
const parseTime = (value: string): Dayjs | undefined => {
  // Treat "p.m." and "PM" equally before passing the value to Day.js.
  const normalizedValue = value
    .trim()
    .replaceAll(".", "")
    .replace(/\s+/g, " ")
    .toUpperCase();
  const parsedTime = dayjs(normalizedValue, SUPPORTED_TIME_FORMATS, true);

  return parsedTime.isValid() ? parsedTime : undefined;
};

/** Returns one consistent booking time format, for example "7:00 PM". */
export const normalizeTime = (value: string) =>
  parseTime(value)?.format("h:mm A");

/** Compares a booking time with the current local time in HH:mm:ss format. */
export const isTimeInPast = (value: string, currentTime: string) => {
  const requested = parseTime(value);

  return !!requested && requested.format("HH:mm:ss") < currentTime;
};

/** Builds the human-readable opening-hours label shown in the UI and chat. */
export const formatOpeningHours = (opensAt: string, closesAt: string) => {
  const openingTime = parseTime(opensAt);
  const closingTime = parseTime(closesAt);

  if (!openingTime || !closingTime) return undefined;

  return `${openingTime.format("h:mm A")} – ${closingTime.format("h:mm A")}`;
};

/** Returns true when the requested time is inside the restaurant's opening hours. */
export const isTimeWithinOpeningHours = (
  requestedTime: string,
  opensAt: string,
  closesAt: string,
) => {
  let requested = parseTime(requestedTime);
  const opening = parseTime(opensAt);
  let closing = parseTime(closesAt);

  if (!requested || !opening || !closing) return false;

  const closesAfterMidnight = closing.isBefore(opening);

  if (closesAfterMidnight) {
    // Move times after midnight to the following day. This turns a range such
    // as 6:00 PM–2:00 AM into one continuous interval that is easy to compare.
    closing = closing.add(1, "day");

    if (requested.isBefore(opening)) {
      requested = requested.add(1, "day");
    }
  }

  // Opening and closing times are inclusive, so exact boundary values are valid.
  return !requested.isBefore(opening) && !requested.isAfter(closing);
};
