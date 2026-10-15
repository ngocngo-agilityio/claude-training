import { getApiConfig } from "../config/api.ts";
import { API_PATHS } from "../constants/api.ts";
import { ERROR_MESSAGES } from "../constants/errors.ts";
import type {
  RestaurantRecord,
  RestaurantReservation,
  RestaurantReservationData,
  RestaurantReservationRecord,
} from "../types/restaurant.ts";
import type { RestaurantMenuRecord } from "../types/restaurant-menu.ts";
import { httpClient } from "./http-client.ts";

type RestaurantFilters = {
  cuisine?: string;
  maximumBudget?: number;
  occasion?: string;
  location?: string;
};

type RestaurantLookup = {
  restaurantId?: string;
  restaurantName?: string;
};

/**
 * Turns free text like "family-friendly" or "Vietnamese food" into a regex
 * that matches any keyword, because json-server `_like` filters use RegExp.
 */
const toKeywordPattern = (value: string) =>
  value
    .toLowerCase()
    .replace(/friendly|restaurants?|food|cuisine|dining/g, " ")
    .split(/[^a-z]+/)
    .filter(Boolean)
    .join("|") || value;

export const getRestaurants = async ({
  cuisine,
  maximumBudget,
  occasion,
  location,
}: RestaurantFilters = {}): Promise<RestaurantRecord[]> => {
  const params: Record<string, string | number> = {
    _sort: "rating",
    _order: "desc",
  };

  if (cuisine) {
    params.cuisineSearch_like = toKeywordPattern(cuisine);
  }

  if (maximumBudget) {
    params.pricePerPerson_lte = maximumBudget;
  }

  if (occasion) {
    params.occasionSearch_like = toKeywordPattern(occasion);
  }

  if (location) {
    params.location_like = location;
  }

  return httpClient.get<RestaurantRecord[]>(
    `${getApiConfig().restaurantsApiDomain}${API_PATHS.RESTAURANTS}`,
    { params },
  );
};

export const getRestaurant = async ({
  restaurantId,
  restaurantName,
}: RestaurantLookup): Promise<RestaurantRecord | undefined> => {
  if (!restaurantId && !restaurantName) {
    return undefined;
  }

  const params: Record<string, string> = {};

  if (restaurantId) {
    params.id = restaurantId;
  } else if (restaurantName) {
    params.name = restaurantName;
  }

  const restaurants = await httpClient.get<RestaurantRecord[]>(
    `${getApiConfig().restaurantsApiDomain}${API_PATHS.RESTAURANTS}`,
    { params },
  );

  return restaurants[0];
};

export const getRestaurantMenu = async (
  restaurantId: string,
): Promise<RestaurantMenuRecord | undefined> => {
  const menus = await httpClient.get<RestaurantMenuRecord[]>(
    `${getApiConfig().restaurantsApiDomain}${API_PATHS.RESTAURANT_MENUS}`,
    { params: { restaurantId } },
  );

  return menus[0];
};

/** Returns reservations owned by the user represented by the JWT. */
export const getCurrentUserReservations = (accessToken: string) =>
  httpClient.get<RestaurantReservationRecord[]>(
    `${getApiConfig().restaurantsApiDomain}${API_PATHS.RESERVATIONS}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        _sort: "date,time",
        _order: "desc,desc",
      },
    },
  );

export const getReservationTimeSlotConflict = async (
  accessToken: string,
  { date, time }: Pick<RestaurantReservationData, "date" | "time">,
) => {
  const reservations = await httpClient.get<RestaurantReservation[]>(
    `${getApiConfig().restaurantsApiDomain}${API_PATHS.RESERVATIONS}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        date,
        time,
        status: "Confirmed",
      },
    },
  );

  return reservations[0];
};

export const createRestaurantReservation = async (
  accessToken: string,
  userId: string,
  reservationData: RestaurantReservationData,
): Promise<RestaurantReservation & { id: string }> => {
  const reservation: RestaurantReservation = {
    ...reservationData,
    userId,
  };
  const conflict = await getReservationTimeSlotConflict(
    accessToken,
    reservationData,
  );

  if (conflict) {
    throw new ReservationConflictError(
      ERROR_MESSAGES.RESERVATION_TIME_SLOT_CONFLICT(conflict.restaurant),
    );
  }

  return httpClient.post<
    RestaurantReservation & { id: string },
    RestaurantReservation
  >(
    `${getApiConfig().restaurantsApiDomain}${API_PATHS.RESERVATIONS}`,
    reservation,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
};

/** Identifies a booking conflict so the confirmation UI can offer recovery. */
export class ReservationConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReservationConflictError";
  }
}
