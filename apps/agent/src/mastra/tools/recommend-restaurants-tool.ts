import { createTool } from "@mastra/core/tools";
import { ERROR_MESSAGES } from "@repo/shared/constants/errors";
import { TOOL_IDS } from "@repo/shared/constants/tools";
import {
  mapRestaurantToCard,
  MAX_RECOMMENDATIONS,
} from "@/lib/utils/restaurant";
import { toRenderedToolModelOutput } from "@repo/shared/utils/tool";
import { getRestaurants } from "@repo/shared/services/restaurant-service";
import type { ToolResult } from "@repo/shared/types/tool";
import { RESTAURANT_TOOL_RESPONSE_PROMPTS } from "../prompts/restaurant-tools";
import {
  recommendRestaurantsInputSchema,
  recommendRestaurantsOutputSchema,
  type RecommendRestaurantsData,
} from "@repo/shared/schemas/restaurant";

/**
 * Recommendation flow:
 * 1. Receive optional filters selected by the AI from the user's message.
 * 2. Fetch matching restaurants through the service layer.
 * 3. Limit and map the results into data that the UI can render as cards.
 * 4. Return a ToolResult so both success and failure have a predictable shape.
 */
export const recommendRestaurantsTool = createTool({
  id: TOOL_IDS.RECOMMEND_RESTAURANTS,
  description:
    "Find and recommend restaurants from the catalog based on cuisine, maximum budget per person in USD, occasion, and location. Call this whenever the user asks to find, discover, or recommend restaurants.",
  inputSchema: recommendRestaurantsInputSchema,
  outputSchema: recommendRestaurantsOutputSchema,
  // Restaurant cards go to the UI. The model receives only IDs and names because
  // that is enough to choose a restaurant for the next tool call.
  toModelOutput: (output) =>
    toRenderedToolModelOutput(
      output,
      ({ restaurants, total }) => ({
        restaurants: restaurants.map(({ id, name }) => ({ id, name })),
        total,
      }),
      RESTAURANT_TOOL_RESPONSE_PROMPTS.recommendRestaurants,
    ),
  execute: async ({ cuisine, maximumBudget, occasion, location }) => {
    try {
      // All filters are optional. Only preferences extracted from the user's
      // message are forwarded, so missing preferences are never invented.
      const data = await getRestaurants({
        cuisine,
        maximumBudget,
        occasion,
        location,
      });

      // Limit API results and map them to the shape used by restaurant cards.
      const restaurants = data
        .slice(0, MAX_RECOMMENDATIONS)
        .map(mapRestaurantToCard);

      // This total is the number of displayed cards, after applying the limit.
      return {
        success: true,
        data: { restaurants, total: restaurants.length },
      } satisfies ToolResult<RecommendRestaurantsData>;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : ERROR_MESSAGES.LOAD_RESTAURANTS_UNEXPECTED;

      return {
        success: false,
        error: `${ERROR_MESSAGES.RECOMMEND_RESTAURANTS_FAILED}: ${message}`,
      } satisfies ToolResult<RecommendRestaurantsData>;
    }
  },
});
