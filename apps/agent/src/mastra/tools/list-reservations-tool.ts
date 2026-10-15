import { createTool } from "@mastra/core/tools";
import { ERROR_MESSAGES } from "@repo/shared/constants/errors";
import { TOOL_IDS } from "@repo/shared/constants/tools";
import { toRenderedToolModelOutput } from "@repo/shared/utils/tool";
import { getAuthenticatedAccessToken } from "@/mastra/auth/authentication-middleware";
import { getCurrentUserReservations } from "@repo/shared/services/restaurant-service";
import type { ToolResult } from "@repo/shared/types/tool";
import { RESTAURANT_TOOL_RESPONSE_PROMPTS } from "../prompts/restaurant-tools";
import {
  listReservationsInputSchema,
  listReservationsOutputSchema,
  type ListReservationsData,
} from "@repo/shared/schemas/restaurant";

/**
 * Reservation-list flow:
 * 1. Read the token propagated by the authentication middleware.
 * 2. Forward the token to the service and return only that user's reservations.
 */
export const listReservationsTool = createTool({
  id: TOOL_IDS.LIST_RESERVATIONS,
  description:
    "Show the authenticated user's existing reservations only when they explicitly ask to see their bookings or booking history. Do not call this to book or reserve a table, start a new reservation, collect booking details, or check for duplicates before booking. For new booking requests, call reserve_restaurant instead.",
  inputSchema: listReservationsInputSchema,
  outputSchema: listReservationsOutputSchema,
  // The UI receives the full result. The model only needs the total count,
  // which avoids sending the same reservation details back to the model.
  toModelOutput: (output) =>
    toRenderedToolModelOutput(
      output,
      ({ total }) => ({ total }),
      RESTAURANT_TOOL_RESPONSE_PROMPTS.listReservations,
    ),
  execute: async (_, context) => {
    try {
      // Preserve the caller's identity when requesting their private bookings.
      const accessToken = getAuthenticatedAccessToken(context?.requestContext);

      const reservations = await getCurrentUserReservations(accessToken);

      // An empty array is still successful: the user simply has no reservations.
      return {
        success: true,
        data: { reservations, total: reservations.length },
      } satisfies ToolResult<ListReservationsData>;
    } catch (error) {
      // Keep API failures inside ToolResult instead of throwing to the agent runtime.
      const message =
        error instanceof Error
          ? error.message
          : ERROR_MESSAGES.LOAD_RESTAURANTS_UNEXPECTED;

      return {
        success: false,
        error: `${ERROR_MESSAGES.LIST_RESERVATIONS_FAILED}: ${message}`,
      } satisfies ToolResult<ListReservationsData>;
    }
  },
});
