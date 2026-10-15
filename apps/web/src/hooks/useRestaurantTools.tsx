import { useComponent, useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { ReservationConfirmation } from "@/components/reservation/confirmation/ReservationConfirmation";
import { ReservationGuideCard } from "@/components/reservation/ReservationGuideCard";
import { AGENT_IDS } from "@repo/shared/constants/agents";
import { TOOL_IDS } from "@repo/shared/constants/tools";
import { reservationGuideSchema } from "@repo/shared/schemas/reservation-guide";
import { confirmReservationInputSchema } from "@repo/shared/schemas/restaurant";

/** Registers the frontend-only visual reservation guide. */
export const useReservationGuideTool = () => {
  useComponent({
    name: TOOL_IDS.SHOW_RESERVATION_GUIDE,
    description:
      "Display a complete visual guide in the user's language. Include exactly four useful stages: discover restaurants from preferences, review details or menus, provide the restaurant/date/time/guest count, and explicitly confirm before booking. Set followUpQuestion to one short next-step question that does not repeat the guide. Use this when the user asks what the assistant can do or how restaurant booking works.",
    parameters: reservationGuideSchema,
    // The component renders the guide and CTA together. Starting another model
    // run here could cause the model to repeat the card's content.
    followUp: false,
    render: ReservationGuideCard,
  });
};

/** Pauses the agent until the user confirms or declines the reservation. */
export const useConfirmReservationTool = () => {
  useHumanInTheLoop({
    agentId: AGENT_IDS.RESTAURANT_RESERVATION,
    name: TOOL_IDS.CONFIRM_RESERVATION,
    description:
      "Ask the user to confirm or decline a new reservation. approved: true means booked; the card shows date, time and guests, so name the restaurant, then close warmly by letting the guest know you're happy to help with anything else. Do not suggest a specific next step such as viewing the menu. approved: false by the user: say you stopped this request (not an error) and offer another time or restaurant. Booking failure: apologize, explain, offer another time/date. Never imply an existing reservation was cancelled.",
    parameters: confirmReservationInputSchema,
    followUp: true,
    render: ReservationConfirmation,
  });
};
