import type { REVIEW_STATE_PHASE } from "../constants/reservation-review.ts";
import type { ConfirmReservationInput } from "../schemas/restaurant.ts";

/** Where the review card is at in starting the reservation-booking workflow. */
export type ReviewState =
  | { phase: typeof REVIEW_STATE_PHASE.STARTING }
  | {
      phase: typeof REVIEW_STATE_PHASE.READY;
      runId: string;
      reservation: ConfirmReservationInput;
    }
  | { phase: typeof REVIEW_STATE_PHASE.FAILED; message: string };
