export const TOOL_FAILURE_STATUS_MESSAGES = {
  TIME_IN_PAST: "Selected time has already passed",
  TIME_UNAVAILABLE: "Selected time is outside opening hours",
  DATE_UNAVAILABLE: "Selected date is outside the booking window",
  GUEST_LIMIT_EXCEEDED: "Party size exceeds the reservation limit",
  TIME_SLOT_CONFLICT: "You already have a booking at this time",
  RESTAURANT_REQUIRED: "No restaurant selected",
  RESTAURANT_NOT_FOUND: "Restaurant not found",
  MENU_NOT_FOUND: "Menu not available",
  AUTHENTICATION_REQUIRED: "Sign-in required",
  REVIEW_NOT_FOUND: "Booking request not found",
  DETAILS_INVALID: "Booking details are missing or invalid",
} as const;

export const TOOL_FAILURE_REASON_PATTERNS = {
  TIME_UNAVAILABLE:
    "Please choose a time during the restaurant's opening hours:",
  DATE_UNAVAILABLE: "Reservations are available only from ",
  TIME_SLOT_CONFLICT: "You already have a reservation at ",
  REVIEW_NOT_FOUND: "The reservation review could not be found.",
  DETAILS_INVALID:
    "A restaurant, date, time, guest count, and timezone are required.",
  GUEST_LIMIT_EXCEEDED: / accepts online reservations for up to \d+ guests\.$/,
} as const;
