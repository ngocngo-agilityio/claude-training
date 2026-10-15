import axios from "axios";
import { getApiConfig } from "../config/api.ts";
import { API_PATHS } from "../constants/api.ts";
import { ERROR_MESSAGES } from "../constants/errors.ts";
import { RESERVATION_WORKFLOW_ERROR_CODES } from "../constants/workflows.ts";
import type { ConfirmReservationInput } from "../schemas/restaurant.ts";
import { httpClient } from "./http-client.ts";
import { ReservationConflictError } from "./restaurant-service.ts";
import type {
  ReservationBookingWorkflowOutput,
  ReservationReviewPending,
} from "../types/restaurant.ts";

type StartReservationReviewBody = ConfirmReservationInput & {
  timezone: string;
};

/** Converts API errors into errors the reservation UI can display. */
const toReservationError = (error: unknown, restaurantName?: string) => {
  // Read the error code and message returned by the reservation API.
  if (axios.isAxiosError<unknown>(error)) {
    const data = error.response?.data;
    const code =
      data && typeof data === "object" && "code" in data
        ? data.code
        : undefined;
    const message =
      data &&
      typeof data === "object" &&
      "error" in data &&
      typeof data.error === "string"
        ? data.error
        : undefined;

    // Use a specific error so the UI can show that the time slot is unavailable.
    if (code === RESERVATION_WORKFLOW_ERROR_CODES.CONFLICT) {
      return new ReservationConflictError(
        message ??
          (restaurantName
            ? ERROR_MESSAGES.RESERVATION_TIME_SLOT_CONFLICT(restaurantName)
            : ERROR_MESSAGES.CONFIRM_RESERVATION_FAILED),
      );
    }

    // Other API failures use the server message when available.
    return new Error(message ?? ERROR_MESSAGES.CONFIRM_RESERVATION_FAILED);
  }

  // Preserve normal errors and provide a safe fallback for unknown values.
  return error instanceof Error
    ? error
    : new Error(ERROR_MESSAGES.CONFIRM_RESERVATION_FAILED);
};

/** Starts the booking workflow and returns data for the review card. */
export const startReservationReview = async (
  accessToken: string,
  reservation: StartReservationReviewBody,
): Promise<ReservationReviewPending> => {
  try {
    // The server validates the details, pauses the workflow, and returns its run ID.
    return await httpClient.post<
      ReservationReviewPending,
      StartReservationReviewBody
    >(
      `${getApiConfig().mastraBaseUrl}${API_PATHS.RESERVATIONS_REVIEW}`,
      reservation,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
  } catch (error) {
    throw toReservationError(error, reservation.restaurantName);
  }
};

/** Continues the paused workflow after the user confirms or cancels. */
export const resumeReservationReview = async (
  accessToken: string,
  runId: string,
  approved: boolean,
): Promise<ReservationBookingWorkflowOutput["reservation"]> => {
  try {
    // The run ID ensures the decision resumes the correct booking workflow.
    const result = await httpClient.post<
      ReservationBookingWorkflowOutput,
      { runId: string; approved: boolean }
    >(
      `${getApiConfig().mastraBaseUrl}${API_PATHS.RESERVATIONS_RESUME}`,
      { runId, approved },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    // A confirmed booking returns a reservation; cancellation returns undefined.
    return result.reservation;
  } catch (error) {
    throw toReservationError(error);
  }
};
