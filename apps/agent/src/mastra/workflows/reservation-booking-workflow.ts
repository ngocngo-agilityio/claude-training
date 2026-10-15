import type { ReservationWorkflowEnvelope } from "@repo/shared/types/restaurant";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { ERROR_MESSAGES } from "@repo/shared/constants/errors";
import {
  RESERVATION_BOOKING_WORKFLOW_ID,
  RESERVATION_WORKFLOW_ERROR_CODES,
  WORKFLOW_STEP_IDS,
} from "@repo/shared/constants/workflows";
import { getCurrentDateTime } from "@/lib/utils/request-context";
import {
  createRestaurantReservation,
  getReservationTimeSlotConflict,
  ReservationConflictError,
} from "@repo/shared/services/restaurant-service";
import { validateReservationDetails } from "../lib/reservation-validation";
import {
  reservationBookingWorkflowInputSchema,
  reservationBookingWorkflowOutputSchema,
  reservationWorkflowEnvelopeSchema,
  reservationWorkflowResumeSchema,
  reservationWorkflowSuspendPayloadSchema,
} from "@repo/shared/schemas/restaurant";

/**
 * Step 1 — check the booking details.
 *
 * Everything was already checked while chatting (see reserve_restaurant),
 * but this workflow re-checks it once more before asking the user to
 * approve, in case something changed between messages.
 */
export const validateReservationDetailsStep = createStep({
  id: WORKFLOW_STEP_IDS.VALIDATE_RESERVATION_DETAILS,
  inputSchema: reservationBookingWorkflowInputSchema,
  outputSchema: reservationWorkflowEnvelopeSchema,
  execute: async ({ inputData }): Promise<ReservationWorkflowEnvelope> => {
    const {
      restaurantId,
      restaurantName,
      guests,
      date,
      time,
      timezone,
      accessToken,
      userId,
    } = inputData;

    // Today's date/time, used to check the booking isn't in the past.
    const now = getCurrentDateTime(timezone);

    // Same checks as the reserve_restaurant tool, run one more time.
    const result = await validateReservationDetails({
      restaurantId,
      restaurantName,
      guests,
      date,
      time,
      now,
    });

    // Something is missing or no longer valid — stop here with why.
    if (
      !result.success ||
      !result.data?.date ||
      !result.data?.time ||
      !result.data?.guests
    ) {
      return {
        success: false,
        code: RESERVATION_WORKFLOW_ERROR_CODES.VALIDATION_FAILED,
        error: result.error ?? ERROR_MESSAGES.RESERVE_RESTAURANT_FAILED,
        accessToken,
        userId,
      };
    }

    // All good — hand the checked details to the next step.
    return {
      success: true,
      restaurantId: result.data.restaurantId,
      restaurantName: result.data.restaurantName,
      guests: result.data.guests,
      date: result.data.date,
      time: result.data.time,
      accessToken,
      userId,
    };
  },
});

/**
 * Step 3 — pause here and wait for the user to approve or decline.
 *
 * This is a real Mastra pause: the workflow run stops and is saved to
 * storage. It only continues once /reservations/resume calls run.resume()
 * with the user's answer — even if that happens minutes later, in a
 * completely different request.
 */
export const awaitApprovalStep = createStep({
  id: WORKFLOW_STEP_IDS.AWAIT_APPROVAL,
  inputSchema: reservationWorkflowEnvelopeSchema,
  outputSchema: reservationWorkflowEnvelopeSchema,
  resumeSchema: reservationWorkflowResumeSchema,
  suspendSchema: reservationWorkflowSuspendPayloadSchema,
  execute: async ({ inputData, resumeData, suspend }) => {
    // An earlier step already failed — nothing to ask approval for.
    if (!inputData.success) return inputData;

    const { restaurantId, restaurantName, guests, date, time } = inputData;

    // No answer yet: pause here and show the details for review.
    if (!resumeData) {
      return await suspend({
        restaurantId,
        restaurantName,
        guests,
        date,
        time,
      });
    }

    // The run has resumed — the user has now answered.
    if (!resumeData.approved) {
      return {
        success: false,
        code: RESERVATION_WORKFLOW_ERROR_CODES.DECLINED,
        error: ERROR_MESSAGES.CONFIRM_RESERVATION_FAILED,
        accessToken: resumeData.accessToken,
        userId: resumeData.userId,
      } satisfies ReservationWorkflowEnvelope;
    }

    // Approved — carry the details forward to the next check.
    return {
      success: true,
      restaurantId,
      restaurantName,
      guests,
      date,
      time,
      accessToken: resumeData.accessToken,
      userId: resumeData.userId,
    } satisfies ReservationWorkflowEnvelope;
  },
});

/**
 * Step 2 — check if the time slot is already booked.
 * Runs right after validating, before asking for approval — no point making
 * the user confirm a booking that is already unavailable.
 */
export const checkTimeSlotAvailabilityStep = createStep({
  id: WORKFLOW_STEP_IDS.CHECK_TIME_SLOT_AVAILABILITY,
  inputSchema: reservationWorkflowEnvelopeSchema,
  outputSchema: reservationWorkflowEnvelopeSchema,
  execute: async ({ inputData }): Promise<ReservationWorkflowEnvelope> => {
    // Validation already failed — pass that along.
    if (!inputData.success) return inputData;

    const {
      restaurantId,
      restaurantName,
      guests,
      date,
      time,
      accessToken,
      userId,
    } = inputData;

    // Look up whether this exact time slot is already taken.
    const conflict = await getReservationTimeSlotConflict(accessToken, {
      date,
      time,
    });

    // Someone else already booked it — the user needs to pick another time.
    if (conflict) {
      return {
        success: false,
        code: RESERVATION_WORKFLOW_ERROR_CODES.CONFLICT,
        error: ERROR_MESSAGES.RESERVATION_TIME_SLOT_CONFLICT(
          conflict.restaurant,
        ),
        accessToken,
        userId,
      };
    }

    // Slot is free — move on to actually saving the reservation.
    return {
      success: true,
      restaurantId,
      restaurantName,
      guests,
      date,
      time,
      accessToken,
      userId,
    };
  },
});

/**
 * Step 4 — save the reservation.
 * createRestaurantReservation checks the same time slot one more time right
 * before saving, in case someone else booked it in the last few seconds.
 */
export const createReservationStep = createStep({
  id: WORKFLOW_STEP_IDS.CREATE_RESERVATION,
  inputSchema: reservationWorkflowEnvelopeSchema,
  outputSchema: reservationBookingWorkflowOutputSchema,
  execute: async ({ inputData }) => {
    // An earlier step already failed — nothing to save, just forward why.
    if (!inputData.success) {
      return {
        success: false,
        code: inputData.code,
        error: inputData.error,
      };
    }

    const {
      restaurantId,
      restaurantName,
      guests,
      date,
      time,
      accessToken,
      userId,
    } = inputData;

    try {
      // Save it for real. This checks the time slot one more time first,
      // in case someone else booked it in the last few seconds.
      const reservation = await createRestaurantReservation(
        accessToken,
        userId,
        {
          restaurantId,
          restaurant: restaurantName,
          guests,
          date,
          time,
          status: "Confirmed",
        },
      );

      // Return only what the review card needs to show a success message.
      return {
        success: true,
        reservation: {
          id: reservation.id,
          restaurantId: reservation.restaurantId,
          restaurant: reservation.restaurant,
          date: reservation.date,
          guests: reservation.guests,
          time: reservation.time,
          status: reservation.status,
        },
      };
    } catch (error) {
      // Tell "someone else booked it first" apart from any other failure.
      const isConflict = error instanceof ReservationConflictError;
      const message =
        error instanceof Error
          ? error.message
          : ERROR_MESSAGES.CONFIRM_RESERVATION_FAILED;

      return {
        success: false,
        code: isConflict
          ? RESERVATION_WORKFLOW_ERROR_CODES.CONFLICT
          : RESERVATION_WORKFLOW_ERROR_CODES.INTERNAL_ERROR,
        error: message,
      };
    }
  },
});

/**
 * Checks the booking, checks the time slot, pauses for the user's approval,
 * then saves the reservation. The time slot is checked before asking for
 * approval so the review card never asks the user to confirm something
 * already unavailable; createReservationStep still checks it once more
 * right before saving, in case the slot was taken during the pause.
 */
export const reservationBookingWorkflow = createWorkflow({
  id: RESERVATION_BOOKING_WORKFLOW_ID,
  inputSchema: reservationBookingWorkflowInputSchema,
  outputSchema: reservationBookingWorkflowOutputSchema,
})
  .then(validateReservationDetailsStep)
  .then(checkTimeSlotAvailabilityStep)
  .then(awaitApprovalStep)
  .then(createReservationStep)
  .commit();
