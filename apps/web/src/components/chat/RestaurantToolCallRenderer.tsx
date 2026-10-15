import type { ReactNode } from "react";
import { ToolCallStatus } from "@copilotkit/react-core/v2";
import { ReservationListCard } from "@/components/reservation/list/ReservationListCard";
import { ReservationListEmptyState } from "@/components/reservation/list/ReservationListEmptyState";
import { RestaurantCardDetail } from "@/components/restaurant/RestaurantCardDetail";
import { RestaurantCarousel } from "@/components/restaurant/RestaurantCarousel";
import { RestaurantMenu } from "@/components/restaurant/RestaurantMenu";
import { ToolStatus } from "@/components/ui/ToolStatus";
import { ERROR_MESSAGES } from "@repo/shared/constants/errors";
import { getToolFailureStatus } from "@repo/shared/utils/tool-status";
import {
  TOOL_COMPLETED_MESSAGES,
  TOOL_FAILED_MESSAGES,
  TOOL_IDS,
  TOOL_LOADING_MESSAGES,
} from "@repo/shared/constants/tools";
import { useRestaurantAgentActions } from "@/hooks/useRestaurantAgentActions";
import { parseToolResult } from "@repo/shared/utils/tool";
import {
  listReservationsOutputSchema,
  recommendRestaurantsOutputSchema,
  reserveRestaurantOutputSchema,
  viewRestaurantDetailsOutputSchema,
  viewRestaurantMenuOutputSchema,
} from "@repo/shared/schemas/restaurant";

type RestaurantToolCallRendererProps = {
  name: string;
  toolCallId: string;
  args: unknown;
  status: ToolCallStatus;
  result?: string;
};

/** Renders every backend restaurant tool from one CopilotKit renderer. */
export const RestaurantToolCallRenderer = ({
  name,
  status,
  result,
}: RestaurantToolCallRendererProps) => {
  // Access CopilotKit actions directly, so this renderer needs no React Context.
  const { reserve, viewDetails, viewMenu } = useRestaurantAgentActions();

  // A tool can be preparing or executing before its final result is available.
  if (
    status === ToolCallStatus.InProgress ||
    status === ToolCallStatus.Executing
  ) {
    return (
      <ToolStatus
        variant="loading"
        message={TOOL_LOADING_MESSAGES[name] ?? "Working on your request..."}
      />
    );
  }

  // Mastra returns the tool result as a string. Convert it back to data once,
  // then let the matching Zod schema validate its exact structure below.
  const parsedResult = parseToolResult(result ?? "");

  let content: ReactNode | undefined;
  // Set only when the tool result fails validation or reports a business
  // error, so a failed call renders FailedTool instead of an empty
  // "completed" pill.
  let errorMessage: string | undefined;

  switch (name) {
    case TOOL_IDS.RECOMMEND_RESTAURANTS: {
      const parsed = recommendRestaurantsOutputSchema.safeParse(parsedResult);

      // There are two failure types: an invalid response shape, or a valid
      // ToolResult that reports a business/API error. Either way, show an
      // explicit error pill instead of leaving the user to guess.
      if (parsed.success && parsed.data.success && parsed.data.data) {
        const restaurants = parsed.data.data.restaurants;

        content = (
          <RestaurantCarousel
            onViewDetails={(restaurantId) => {
              const restaurant = restaurants.find(
                ({ id }) => id === restaurantId,
              );

              if (restaurant) viewDetails(restaurant);
            }}
            restaurants={restaurants}
          />
        );
      } else {
        errorMessage = getToolFailureStatus(
          parsed.success ? parsed.data.error : undefined,
          ERROR_MESSAGES.RECOMMEND_RESTAURANTS_FAILED,
        );
      }

      break;
    }

    case TOOL_IDS.VIEW_RESTAURANT_DETAILS: {
      // Validate and render the full information for one selected restaurant.
      const parsed = viewRestaurantDetailsOutputSchema.safeParse(parsedResult);

      if (parsed.success && parsed.data.success && parsed.data.data) {
        const restaurant = parsed.data.data.restaurant;

        content = (
          <RestaurantCardDetail
            {...restaurant}
            onReserve={() => reserve(restaurant.name)}
            onViewMenu={() => viewMenu(restaurant.name)}
          />
        );
      } else {
        errorMessage = getToolFailureStatus(
          parsed.success ? parsed.data.error : undefined,
          ERROR_MESSAGES.VIEW_RESTAURANT_DETAILS_FAILED,
        );
      }

      break;
    }

    case TOOL_IDS.VIEW_RESTAURANT_MENU: {
      // Menu data is already grouped into categories expected by RestaurantMenu.
      const parsed = viewRestaurantMenuOutputSchema.safeParse(parsedResult);

      if (parsed.success && parsed.data.success && parsed.data.data) {
        content = <RestaurantMenu categories={parsed.data.data.categories} />;
      } else {
        errorMessage = getToolFailureStatus(
          parsed.success ? parsed.data.error : undefined,
          ERROR_MESSAGES.VIEW_RESTAURANT_MENU_FAILED,
        );
      }

      break;
    }

    case TOOL_IDS.LIST_RESERVATIONS: {
      // Use a dedicated empty state when the API succeeds with zero bookings.
      const parsed = listReservationsOutputSchema.safeParse(parsedResult);

      if (parsed.success && parsed.data.success && parsed.data.data) {
        content =
          parsed.data.data.total === 0 ? (
            <ReservationListEmptyState />
          ) : (
            <ReservationListCard data={parsed.data.data} />
          );
      } else {
        errorMessage = getToolFailureStatus(
          parsed.success ? parsed.data.error : undefined,
          ERROR_MESSAGES.LIST_RESERVATIONS_FAILED,
        );
      }

      break;
    }

    case TOOL_IDS.RESERVE_RESTAURANT: {
      // Reservation validation is internal. The assistant turns both successful
      // constraints and business errors into a natural conversational response.
      const parsed = reserveRestaurantOutputSchema.safeParse(parsedResult);

      if (parsed.success && parsed.data.success) {
        // This marks tool completion, not confirmation of a booking, so
        // there is no card to show below the pill.
        content = null;
      } else {
        errorMessage = getToolFailureStatus(
          parsed.success ? parsed.data.error : undefined,
          TOOL_FAILED_MESSAGES[TOOL_IDS.RESERVE_RESTAURANT],
        );
      }

      break;
    }

    default:
      break;
  }

  if (errorMessage)
    return <ToolStatus variant="failed" message={errorMessage} />;

  return (
    <ToolStatus
      variant="completed"
      message={TOOL_COMPLETED_MESSAGES[name] ?? "Request completed"}
    >
      {content}
    </ToolStatus>
  );
};
