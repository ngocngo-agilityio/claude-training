import { createTool } from "@mastra/core/tools";
import { ERROR_MESSAGES } from "@repo/shared/constants/errors";
import { TOOL_IDS } from "@repo/shared/constants/tools";
import { toRenderedToolModelOutput } from "@repo/shared/utils/tool";
import {
  getRestaurant,
  getRestaurantMenu,
} from "@repo/shared/services/restaurant-service";
import type { ToolResult } from "@repo/shared/types/tool";
import { RESTAURANT_TOOL_RESPONSE_PROMPTS } from "../prompts/restaurant-tools";
import {
  viewRestaurantMenuInputSchema,
  viewRestaurantMenuOutputSchema,
  type ViewRestaurantMenuData,
} from "@repo/shared/schemas/restaurant";

/**
 * Menu flow:
 * 1. Find the restaurant by ID or exact name.
 * 2. Use the resolved restaurant ID to request its menu.
 * 3. Return menu categories for the frontend renderer.
 * Restaurant lookup and menu lookup are separate because they use separate APIs.
 */
export const viewRestaurantMenuTool = createTool({
  id: TOOL_IDS.VIEW_RESTAURANT_MENU,
  description:
    "Show the menu for a restaurant previously recommended or named by the user. Provide its catalog ID when available; otherwise provide its exact name.",
  inputSchema: viewRestaurantMenuInputSchema,
  outputSchema: viewRestaurantMenuOutputSchema,

  // Menu categories are rendered by the UI, so the model only needs the name
  // to produce a short follow-up response.
  toModelOutput: (output) =>
    toRenderedToolModelOutput(
      output,
      ({ restaurantName }) => ({ restaurantName }),
      RESTAURANT_TOOL_RESPONSE_PROMPTS.viewRestaurantMenu,
    ),
  execute: async ({ restaurantId, restaurantName }) => {
    try {
      // Resolve a restaurant first because the menu API requires its catalog ID.
      if (!restaurantId && !restaurantName)
        return {
          success: false,
          error: ERROR_MESSAGES.RESTAURANT_REQUIRED,
        } satisfies ToolResult<ViewRestaurantMenuData>;

      const restaurant = await getRestaurant({ restaurantId, restaurantName });

      if (!restaurant)
        return {
          success: false,
          error: ERROR_MESSAGES.RESTAURANT_DETAILS_NOT_FOUND,
        } satisfies ToolResult<ViewRestaurantMenuData>;

      const menu = await getRestaurantMenu(restaurant.id);

      // A restaurant may exist even when no menu record has been added for it.
      if (!menu)
        return {
          success: false,
          error: ERROR_MESSAGES.RESTAURANT_MENU_NOT_FOUND,
        } satisfies ToolResult<ViewRestaurantMenuData>;

      return {
        success: true,
        // Menu categories already match the frontend renderer's expected shape.
        data: { restaurantName: restaurant.name, categories: menu.categories },
      } satisfies ToolResult<ViewRestaurantMenuData>;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : ERROR_MESSAGES.LOAD_RESTAURANTS_UNEXPECTED;

      return {
        success: false,
        error: `${ERROR_MESSAGES.VIEW_RESTAURANT_MENU_FAILED}: ${message}`,
      } satisfies ToolResult<ViewRestaurantMenuData>;
    }
  },
});
