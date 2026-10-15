import { ToolCallFilter } from "@mastra/core/processors";
import { TOOL_IDS } from "@repo/shared/constants/tools";

// Lookup tools whose old calls can be shortened.
// Booking, confirmation, reservation list, and memory tools are kept as is.
export const FILTERED_TOOL_HISTORY = [
  TOOL_IDS.RECOMMEND_RESTAURANTS,
  TOOL_IDS.VIEW_RESTAURANT_DETAILS,
  TOOL_IDS.VIEW_RESTAURANT_MENU,
] as const;

/**
 * Shorten old lookup tool calls in the prompt sent to the model.
 * - Only earlier turns are filtered. Results from the current run are kept.
 * - Saved history and the UI are not changed.
 */
export const createRestaurantToolHistoryFilter = () =>
  new ToolCallFilter({
    exclude: [...FILTERED_TOOL_HISTORY],
    // Keep each result as short text, so restaurant IDs and names stay
    // available for follow-up questions like "book the second one".
    preserveModelOutput: true,
  });
