import { z } from "zod";

/**
 * Stable guest facts shared across one user's conversations.
 * Schema-based working memory merges partial updates, so the model only sends
 * the changed fields instead of rewriting the whole profile.
 */
export const guestProfileSchema = z.object({
  preferredName: z
    .string()
    .optional()
    .describe("How the guest wants to be addressed"),
  dietaryRestrictions: z
    .array(z.string())
    .optional()
    .describe("Dietary restrictions or allergies"),
  cuisinePreferences: z
    .array(z.string())
    .optional()
    .describe("Cuisines the guest says they like"),
  seatingPreference: z
    .string()
    .optional()
    .describe("Preferred seating or ambiance"),
  favoriteRestaurants: z
    .array(z.string())
    .optional()
    .describe("Restaurants the guest says they like"),
});
