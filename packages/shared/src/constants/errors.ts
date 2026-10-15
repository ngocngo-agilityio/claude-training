export const ERROR_MESSAGES = {
  CONTEXT_TOKEN_LIMIT_REQUIRED:
    "Please set a context token limit before starting the restaurant assistant.",
  CONTEXT_TOKEN_LIMIT_INVALID:
    "Please enter a valid positive whole number for the context token limit.",
  // Shown in the chat when the context limit blocks a request.
  REQUEST_TOO_LONG:
    "Your message is too long for me to read. Please shorten it and send it again.",
  REQUEST_TOO_LARGE:
    "I couldn't finish this request because it needs too much information. Please try again or ask something more specific.",
  ASSISTANT_UNAVAILABLE:
    "The assistant can't handle requests right now. Please try again later.",
  FIELD_REQUIRED: (fieldName: string) => `${fieldName} is required.`,
  EMAIL_INVALID: "Email is invalid.",
  PASSWORD_MIN_LENGTH: "Password must be at least 6 characters.",
  LOGIN_FAILED: "Email or password is incorrect.",
  AUTHENTICATION_REQUIRED: "Please sign in again to continue.",
  LOAD_RESTAURANTS_UNEXPECTED:
    "An unexpected error occurred while loading restaurants",
  RECOMMEND_RESTAURANTS_FAILED: "Unable to recommend restaurants",
  RESTAURANT_REQUIRED: "Please specify a restaurant to view",
  RESTAURANT_DETAILS_NOT_FOUND: "Restaurant details could not be found",
  RESTAURANT_MENU_NOT_FOUND: "Restaurant menu could not be found",
  VIEW_RESTAURANT_DETAILS_FAILED: "Unable to load restaurant details",
  VIEW_RESTAURANT_MENU_FAILED: "Unable to load restaurant menu",
  LIST_RESERVATIONS_FAILED: "Unable to load your reservations",
  RESERVATION_TIME_UNAVAILABLE: (openingHours: string) =>
    `Please choose a time during the restaurant's opening hours: ${openingHours}.`,
  RESERVATION_TIME_IN_PAST:
    "That time has already passed today. Please choose a later time today or another date.",
  RESERVATION_DATE_UNAVAILABLE: (firstDate: string, lastDate: string) =>
    `Reservations are available only from ${firstDate} through ${lastDate}.`,
  RESERVATION_GUEST_LIMIT_EXCEEDED: (
    restaurantName: string,
    maximumGuests: number,
  ) =>
    `${restaurantName} accepts online reservations for up to ${maximumGuests} guests.`,
  RESERVE_RESTAURANT_FAILED: "Unable to prepare the reservation",
  CONFIRM_RESERVATION_FAILED:
    "The booking could not be confirmed. Please try again.",
  RESET_CONVERSATION_FAILED:
    "Could not reset this conversation. Please try again.",
  RESET_CONVERSATION_UNAVAILABLE: "Conversation reset is unavailable.",
  LOAD_CONVERSATIONS_FAILED: "Could not load conversations.",
  DELETE_CONVERSATION_FAILED:
    "Could not delete this conversation. Please try again.",
  DELETE_CONVERSATION_UNAVAILABLE: "Conversation deletion is unavailable.",
  CHECK_RESERVATION_CONFLICT_FAILED:
    "The reservation could not be checked. Please try again.",
  RESERVATION_TIME_SLOT_CONFLICT: (restaurant: string) =>
    `You already have a reservation at ${restaurant} for this date and time. Please choose a different date or time.`,
  DECLINE_RESERVATION_FAILED:
    "Your response could not be sent. Please try again.",
};
