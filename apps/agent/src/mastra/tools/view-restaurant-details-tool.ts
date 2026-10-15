import { createTool } from "@mastra/core/tools";
import { ERROR_MESSAGES } from "@repo/shared/constants/errors";
import { TOOL_IDS } from "@repo/shared/constants/tools";
import { mapRestaurantRecordToDetail } from "@/lib/utils/restaurant";
import { toRenderedToolModelOutput } from "@repo/shared/utils/tool";
import { getRestaurant } from "@repo/shared/services/restaurant-service";
import type { ToolResult } from "@repo/shared/types/tool";
import { RESTAURANT_TOOL_RESPONSE_PROMPTS } from "../prompts/restaurant-tools";
import {
  viewRestaurantDetailsInputSchema,
  viewRestaurantDetailsOutputSchema,
  type ViewRestaurantDetailsData,
} from "@repo/shared/schemas/restaurant";

/**
 * Restaurant-detail flow:
 * 1. Require either a catalog ID or an exact restaurant name.
 * 2. Ask the service layer to find that restaurant.
 * 3. Map the API record into the detail shape expected by the UI.
 * 4. Return a clear error when the restaurant is missing or the request fails.
 */
export const viewRestaurantDetailsTool = createTool({
  id: TOOL_IDS.VIEW_RESTAURANT_DETAILS,
  description:
    "Show detailed information for a restaurant previously recommended or named by the user. Provide its catalog ID when available; otherwise provide its exact name.",
  inputSchema: viewRestaurantDetailsInputSchema,
  outputSchema: viewRestaurantDetailsOutputSchema,

  // The UI renders all details, while the model only keeps the restaurant's
  // identity for a possible menu or reservation request afterward.
  toModelOutput: (output) =>
    toRenderedToolModelOutput(
      output,
      ({ restaurant: { id, name } }) => ({ restaurant: { id, name } }),
      RESTAURANT_TOOL_RESPONSE_PROMPTS.viewRestaurantDetails,
    ),
  execute: async ({ restaurantId, restaurantName }) => {
    try {
      // Without either identifier, the service does not know what to search for.
      if (!restaurantId && !restaurantName)
        return {
          success: false,
          error: ERROR_MESSAGES.RESTAURANT_REQUIRED,
        } satisfies ToolResult<ViewRestaurantDetailsData>;

      const restaurant = await getRestaurant({ restaurantId, restaurantName });

      if (!restaurant)
        return {
          success: false,
          error: ERROR_MESSAGES.RESTAURANT_DETAILS_NOT_FOUND,
        } satisfies ToolResult<ViewRestaurantDetailsData>;

      return {
        success: true,
        // Convert the API record into the shape expected by the detail component.
        data: { restaurant: mapRestaurantRecordToDetail(restaurant) },
      } satisfies ToolResult<ViewRestaurantDetailsData>;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : ERROR_MESSAGES.LOAD_RESTAURANTS_UNEXPECTED;
      return {
        success: false,
        error: `${ERROR_MESSAGES.VIEW_RESTAURANT_DETAILS_FAILED}: ${message}`,
      } satisfies ToolResult<ViewRestaurantDetailsData>;
    }
  },
});
