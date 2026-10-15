import { useEffect, useRef, useState } from "react";
import { ToolCallStatus } from "@copilotkit/react-core/v2";
import { ERROR_MESSAGES } from "@repo/shared/constants/errors";
import { REVIEW_STATE_PHASE } from "@repo/shared/constants/reservation-review";
import {
  confirmReservationInputSchema,
  type ConfirmReservationInput,
} from "@repo/shared/schemas/restaurant";
import { startReservationReview } from "@repo/shared/services/reservation-service";
import type { ReviewState } from "@repo/shared/types/reservation-review";

type UseReservationReviewOptions = {
  accessToken: string;
  status: ToolCallStatus;
  respond?: (result: { approved: boolean; reason: string }) => Promise<unknown>;
  // Fields may be incomplete while CopilotKit streams the tool arguments.
  reservation: Partial<ConfirmReservationInput>;
};

/** Prepare a booking for review and track its ready or failed state. */
export const useReservationReview = ({
  accessToken,
  status,
  reservation,
  respond,
}: UseReservationReviewOptions): ReviewState => {
  const [reviewState, setReviewState] = useState<ReviewState>({
    phase: REVIEW_STATE_PHASE.STARTING,
  });
  const hasStartedReviewRef = useRef(false);

  useEffect(() => {
    // Wait for complete arguments, then start once per hook instance.
    if (status !== ToolCallStatus.Executing) return;
    if (hasStartedReviewRef.current) return;
    hasStartedReviewRef.current = true;

    // Cleanup marks this request's result as outdated.
    let cancelled = false;

    const startReview = async () => {
      try {
        // Validate streamed arguments before sending them to the server.
        const details = confirmReservationInputSchema.parse({
          restaurantId: reservation.restaurantId,
          restaurantName: reservation.restaurantName,
          guests: reservation.guests,
          date: reservation.date,
          time: reservation.time,
        });

        const pending = await startReservationReview(accessToken, {
          ...details,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });

        // Ignore outdated results or responses that are not waiting for review.
        if (cancelled || pending.status !== "pending") return;

        // Show the review and keep the runId for approval or cancellation.
        setReviewState({
          phase: REVIEW_STATE_PHASE.READY,
          runId: pending.runId,
          reservation: pending.reservation,
        });
      } catch (error) {
        // Ignore errors after cleanup, just like successful results.
        if (cancelled) return;

        const message =
          error instanceof Error
            ? error.message
            : ERROR_MESSAGES.CONFIRM_RESERVATION_FAILED;

        // Preparation failed; show the error instead of the review.
        setReviewState({
          phase: REVIEW_STATE_PHASE.FAILED,
          message,
        });

        // Tell the AI why preparation failed so it can explain the error.
        await respond?.({
          approved: false,
          reason: `The booking could not be prepared for review. Explain this reason to the user and ask them to choose another date or time when appropriate: ${message}`,
        });
      }
    };

    void startReview();

    // Ignore late results on unmount or dependency changes; the request continues.
    return () => {
      cancelled = true;
    };
    // Track field values because CopilotKit recreates the args object each render.
  }, [
    status,
    accessToken,
    reservation.restaurantId,
    reservation.restaurantName,
    reservation.guests,
    reservation.date,
    reservation.time,
    respond,
  ]);

  return reviewState;
};
