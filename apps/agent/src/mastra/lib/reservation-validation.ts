import { ERROR_MESSAGES } from "@repo/shared/constants/errors";
import {
  formatOpeningHours,
  isTimeInPast,
  isTimeWithinOpeningHours,
  normalizeTime,
} from "@repo/shared/utils/time";
import { getRestaurant } from "@repo/shared/services/restaurant-service";
import type { ToolResult } from "@repo/shared/types/tool";
import type { ReserveRestaurantData } from "@repo/shared/schemas/restaurant";

// Users can book from today up to 13 days later.
const RESERVATION_BOOKING_WINDOW_DAYS = 14;

/** Creates a new list of available dates each time this runs. */
export const getAvailableReservationDates = (today: string) => {
  return Array.from({ length: RESERVATION_BOOKING_WINDOW_DAYS }, (_, index) => {
    // Use UTC only for calendar arithmetic on the user's local date, so server
    // timezone and daylight-saving changes cannot shift the available days.
    const date = new Date(`${today}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + index);

    return date.toISOString().slice(0, 10);
  });
};

export type ValidateReservationDetailsInput = {
  restaurantId?: string;
  restaurantName?: string;
  guests?: number;
  date?: string;
  time?: string;
  /** Today's date and current time, used to check the date is not too far
   * away and the time has not already passed. */
  now: { date: string; time: string };
};

/**
 * Checks whether the restaurant, date, time, and guest count are all valid.
 * Only checks the details — does not create a reservation.
 */
export const validateReservationDetails = async ({
  restaurantId,
  restaurantName,
  guests,
  date,
  time,
  now,
}: ValidateReservationDetailsInput): Promise<
  ToolResult<ReserveRestaurantData>
> => {
  try {
    // A restaurant ID or name is required.
    if (!restaurantId && !restaurantName)
      return {
        success: false,
        error: ERROR_MESSAGES.RESTAURANT_REQUIRED,
      } satisfies ToolResult<ReserveRestaurantData>;

    // Find the restaurant by its ID or name.
    const restaurant = await getRestaurant({ restaurantId, restaurantName });

    // Stop if the restaurant does not exist.
    if (!restaurant)
      return {
        success: false,
        error: ERROR_MESSAGES.RESTAURANT_DETAILS_NOT_FOUND,
      } satisfies ToolResult<ReserveRestaurantData>;

    // Get the dates that the user can choose.
    const availableDates = getAvailableReservationDates(now.date);

    // Change a time such as "7 pm" to "7:00 PM".
    const normalizedTime = time ? normalizeTime(time) : undefined;

    // Create readable opening hours for error messages.
    const openingHours = formatOpeningHours(
      restaurant.opensAt,
      restaurant.closesAt,
    );

    // If a date was provided, check that it is available.
    if (date && !availableDates.includes(date))
      return {
        success: false,
        error: ERROR_MESSAGES.RESERVATION_DATE_UNAVAILABLE(
          availableDates[0],
          availableDates[availableDates.length - 1],
        ),
      } satisfies ToolResult<ReserveRestaurantData>;

    // Today's booking time must not have already passed in the caller's timezone.
    if (
      date === now.date &&
      normalizedTime &&
      isTimeInPast(normalizedTime, now.time)
    )
      return {
        success: false,
        error: ERROR_MESSAGES.RESERVATION_TIME_IN_PAST,
      } satisfies ToolResult<ReserveRestaurantData>;

    // Validate the time only after the user provides one. A missing time is
    // returned as an incomplete detail so the agent can ask for it.
    if (
      time &&
      (!normalizedTime ||
        !isTimeWithinOpeningHours(
          normalizedTime,
          restaurant.opensAt,
          restaurant.closesAt,
        ))
    )
      return {
        success: false,
        error: ERROR_MESSAGES.RESERVATION_TIME_UNAVAILABLE(
          openingHours ?? `${restaurant.opensAt} – ${restaurant.closesAt}`,
        ),
      } satisfies ToolResult<ReserveRestaurantData>;

    // If the number of guests was provided, check the restaurant's limit.
    if (guests && guests > restaurant.maximumReservationGuests)
      return {
        success: false,
        error: ERROR_MESSAGES.RESERVATION_GUEST_LIMIT_EXCEEDED(
          restaurant.name,
          restaurant.maximumReservationGuests,
        ),
      } satisfies ToolResult<ReserveRestaurantData>;

    // Return all checked details and booking rules.
    return {
      success: true,
      data: {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        guests,
        date,
        time: normalizedTime,
        availableDates,
        opensAt: normalizeTime(restaurant.opensAt) ?? restaurant.opensAt,
        closesAt: normalizeTime(restaurant.closesAt) ?? restaurant.closesAt,
        maximumGuests: restaurant.maximumReservationGuests,
      },
    } satisfies ToolResult<ReserveRestaurantData>;
  } catch (error) {
    // Return a clear error if the service request fails.
    const message =
      error instanceof Error
        ? error.message
        : ERROR_MESSAGES.LOAD_RESTAURANTS_UNEXPECTED;

    return {
      success: false,
      error: `${ERROR_MESSAGES.RESERVE_RESTAURANT_FAILED}: ${message}`,
    } satisfies ToolResult<ReserveRestaurantData>;
  }
};
