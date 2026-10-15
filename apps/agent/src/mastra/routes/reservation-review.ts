import type { ApiRoute, ContextWithMastra } from "@mastra/core/server";
import { randomUUID } from "node:crypto";
import { API_PATHS } from "@repo/shared/constants/api";
import { ERROR_MESSAGES } from "@repo/shared/constants/errors";
import { HTTP_STATUS_CODES, HttpMethod } from "@repo/shared/constants/http";
import {
  RESERVATION_WORKFLOW_ERROR_CODES,
  WORKFLOW_STEP_IDS,
} from "@repo/shared/constants/workflows";
import {
  getAuthenticatedAccessToken,
  getAuthenticatedUserId,
} from "@/mastra/auth/authentication-middleware";
import {
  resumeReservationReviewRequestSchema,
  startReservationReviewRequestSchema,
} from "@repo/shared/schemas/restaurant";
import { reservationBookingWorkflow } from "@/mastra/workflows/reservation-booking-workflow";
import type { ReservationBookingWorkflowOutput } from "@repo/shared/types/restaurant";

/** Return 200 for booking or decline, 409 for conflicts, otherwise 400. */
const resolveOutcomeStatus = (result: ReservationBookingWorkflowOutput) => {
  if (
    result.success ||
    result.code === RESERVATION_WORKFLOW_ERROR_CODES.DECLINED
  ) {
    return HTTP_STATUS_CODES.OK;
  }

  return result.code === RESERVATION_WORKFLOW_ERROR_CODES.CONFLICT
    ? HTTP_STATUS_CODES.CONFLICT
    : HTTP_STATUS_CODES.BAD_REQUEST;
};

/** Start the workflow and pause for the user to review the booking. */
export const startReservationReviewRoute: ApiRoute = {
  path: API_PATHS.RESERVATIONS_REVIEW,
  method: HttpMethod.POST,
  handler: async (context: ContextWithMastra) => {
    // Use the signed-in user's identity and token.
    const requestContext = context.get("requestContext");
    const userId = getAuthenticatedUserId(requestContext);
    const accessToken = getAuthenticatedAccessToken(requestContext);

    // Invalid JSON also goes through input validation.
    const body = await context.req.json().catch(() => null);
    const parsedInput = startReservationReviewRequestSchema.safeParse(body);

    // Reject invalid booking details.
    if (!parsedInput.success) {
      return context.json(
        {
          success: false,
          code: RESERVATION_WORKFLOW_ERROR_CODES.VALIDATION_FAILED,
          error:
            "A restaurant, date, time, guest count, and timezone are required.",
        },
        HTTP_STATUS_CODES.BAD_REQUEST,
      );
    }

    // Save the owner and runId so this run can be resumed later.
    const runId = randomUUID();
    const run = await reservationBookingWorkflow.createRun({
      runId,
      resourceId: userId,
    });

    // Start with validated details and trusted credentials.
    const result = await run.start({
      inputData: { ...parsedInput.data, accessToken, userId },
    });

    // Waiting for approval: return the runId and review details.
    if (result.status === "suspended") {
      return context.json(
        {
          status: "pending",
          runId,
          reservation: result.suspendPayload[WORKFLOW_STEP_IDS.AWAIT_APPROVAL],
        },
        HTTP_STATUS_CODES.OK,
      );
    }

    // Execution finished before approval; return the failed booking check.
    if (result.status === "success") {
      return context.json(
        { status: "failed", ...result.result },
        resolveOutcomeStatus(result.result),
      );
    }

    // Unexpected workflow status: return a server error.
    return context.json(
      {
        status: "failed",
        success: false,
        code: RESERVATION_WORKFLOW_ERROR_CODES.INTERNAL_ERROR,
        error: ERROR_MESSAGES.CONFIRM_RESERVATION_FAILED,
      },
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    );
  },
};

/** Resume the paused workflow with the user's approval or decline. */
export const resumeReservationReviewRoute: ApiRoute = {
  path: API_PATHS.RESERVATIONS_RESUME,
  method: HttpMethod.POST,
  handler: async (context: ContextWithMastra) => {
    const requestContext = context.get("requestContext");
    const userId = getAuthenticatedUserId(requestContext);
    const accessToken = getAuthenticatedAccessToken(requestContext);

    // Invalid JSON also goes through input validation.
    const body = await context.req.json().catch(() => null);
    const parsedInput = resumeReservationReviewRequestSchema.safeParse(body);

    // Require a runId and a true/false decision.
    if (!parsedInput.success) {
      return context.json(
        {
          success: false,
          code: RESERVATION_WORKFLOW_ERROR_CODES.VALIDATION_FAILED,
          error: "A runId and an approved flag are required.",
        },
        HTTP_STATUS_CODES.BAD_REQUEST,
      );
    }

    // Load the saved run to check who owns it.
    const savedRun = await reservationBookingWorkflow.getWorkflowRunById(
      parsedInput.data.runId,
      { fields: [] },
    );

    // Only the owner can resume; hide other users' runs with a 404.
    if (!savedRun || savedRun.resourceId !== userId) {
      return context.json(
        {
          success: false,
          code: RESERVATION_WORKFLOW_ERROR_CODES.VALIDATION_FAILED,
          error: "The reservation review could not be found.",
        },
        HTTP_STATUS_CODES.NOT_FOUND,
      );
    }

    // Reconnect to the same run using its runId.
    const run = await reservationBookingWorkflow.createRun({
      runId: parsedInput.data.runId,
      resourceId: userId,
    });

    // Continue the approval step with the decision and current token.
    const result = await run.resume({
      step: WORKFLOW_STEP_IDS.AWAIT_APPROVAL,
      resumeData: {
        approved: parsedInput.data.approved,
        accessToken,
        userId,
      },
    });

    // Workflow completion can mean booked, declined, or a failed check.
    if (result.status === "success") {
      return context.json(result.result, resolveOutcomeStatus(result.result));
    }

    // Unexpected workflow status: return a server error.
    return context.json(
      {
        success: false,
        code: RESERVATION_WORKFLOW_ERROR_CODES.INTERNAL_ERROR,
        error: ERROR_MESSAGES.CONFIRM_RESERVATION_FAILED,
      },
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    );
  },
};
