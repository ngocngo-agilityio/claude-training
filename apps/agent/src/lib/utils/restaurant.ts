import type {
  RestaurantDetail,
  RestaurantRecord,
} from "@repo/shared/types/restaurant";
import { formatOpeningHours } from "@repo/shared/utils/time";

export const MAX_RECOMMENDATIONS = 6;

/** Maps an internal restaurant record to the card shape returned by the tool. */
export const mapRestaurantToCard = (
  restaurant: RestaurantRecord,
  index: number,
) => ({
  id: restaurant.id,
  name: restaurant.name,
  imageUrl: restaurant.imageUrl,
  rating: restaurant.rating,
  reviewCount: restaurant.reviewCount,
  cuisine: restaurant.cuisines.join(" · "),
  location: restaurant.location,
  distance: restaurant.distance,
  priceRange: `$${restaurant.pricePerPerson} per person`,
  // Array indexes start at zero, while displayed ranking starts at one.
  rank: index + 1,
});

/** Builds the detail view model from the restaurant recommendation data. */
export const mapRestaurantRecordToDetail = (
  restaurant: RestaurantRecord,
): RestaurantDetail => ({
  id: restaurant.id,
  name: restaurant.name,
  imageUrl: restaurant.imageUrl,
  rating: restaurant.rating,
  reviewCount: restaurant.reviewCount,
  restaurantType: restaurant.cuisines[0] ?? "Restaurant",
  cuisine: restaurant.cuisines.join(" · "),
  location: restaurant.location,
  distance: restaurant.distance,
  priceRange: `$${restaurant.pricePerPerson} per person`,
  description: restaurant.description,
  openingHours:
    formatOpeningHours(restaurant.opensAt, restaurant.closesAt) ??
    "Hours unavailable",
  ambience: restaurant.ambience,
  galleryImageUrls: restaurant.galleryImageUrls,
  totalPhotoCount: restaurant.totalPhotoCount,
});
