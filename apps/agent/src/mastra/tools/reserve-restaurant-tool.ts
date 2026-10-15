import { createTool } from "@mastra/core/tools";
import { REQUEST_CONTEXT_KEYS } from "@repo/shared/constants/request-context";
import { TOOL_IDS } from "@repo/shared/constants/tools";
import {
  getCurrentDateTime,
  normalizeTimezone,
} from "@/lib/utils/request-context";
import { toRenderedToolModelOutput } from "@repo/shared/utils/tool";
import { validateReservationDetails } from "../lib/reservation-validation";
import { RESTAURANT_TOOL_RESPONSE_PROMPTS } from "../prompts/restaurant-tools";
import {
  reserveRestaurantInputSchema,
  reserveRestaurantOutputSchema,
} from "@repo/shared/schemas/restaurant";

/**
 * Checks the restaurant, date, time, and number of guests. Only checks
 * them — does not create a reservation.
 */
export const reserveRestaurantTool = createTool({
  id: TOOL_IDS.RESERVE_RESTAURANT,
  description:
    "Validate a restaurant and every table-booking detail supplied during the conversation. You must call this tool again whenever the user provides or changes a date, guest count, or time. Do not acknowledge a value or ask for the next missing value until this tool validates all known details. When all details are valid, call confirm_reservation.",
  inputSchema: reserveRestaurantInputSchema,
  outputSchema: reserveRestaurantOutputSchema,
  toModelOutput: (output) =>
    toRenderedToolModelOutput(
      output,
      ({
        restaurantId,
        restaurantName,
        guests,
        date,
        time,
        availableDates,
        opensAt,
        closesAt,
        maximumGuests,
      }) => ({
        restaurantId,
        restaurantName,
        guests,
        date,
        time,
        availableDates,
        opensAt,
        closesAt,
        maximumGuests,
      }),
      RESTAURANT_TOOL_RESPONSE_PROMPTS.reserveRestaurant,
      { resultIsRendered: false },
    ),

  // Check all booking details that the user has provided so far.
  execute: async (
    { restaurantId, restaurantName, guests, date, time },
    context,
  ) => {
    const userTimezone = context?.requestContext?.get(
      REQUEST_CONTEXT_KEYS.TIMEZONE,
    );
    const timezone = normalizeTimezone(
      typeof userTimezone === "string" ? userTimezone : undefined,
    );
    const now = getCurrentDateTime(timezone);

    return validateReservationDetails({
      restaurantId,
      restaurantName,
      guests,
      date,
      time,
      now,
    });
  },
});
