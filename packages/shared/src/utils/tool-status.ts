import { ERROR_MESSAGES } from "../constants/errors.ts";
import {
  TOOL_FAILURE_STATUS_MESSAGES,
  TOOL_FAILURE_REASON_PATTERNS,
} from "../constants/tool-status.ts";

/** Short UI labels only; the original error remains available to the agent. */
export const getToolFailureStatus = (
  reason: string | undefined,
  fallback: string,
) => {
  const message = reason?.trim();
  if (!message) return fallback;

  if (message === ERROR_MESSAGES.RESERVATION_TIME_IN_PAST)
    return TOOL_FAILURE_STATUS_MESSAGES.TIME_IN_PAST;
  if (message.startsWith(TOOL_FAILURE_REASON_PATTERNS.TIME_UNAVAILABLE))
    return TOOL_FAILURE_STATUS_MESSAGES.TIME_UNAVAILABLE;
  if (message.startsWith(TOOL_FAILURE_REASON_PATTERNS.DATE_UNAVAILABLE))
    return TOOL_FAILURE_STATUS_MESSAGES.DATE_UNAVAILABLE;
  if (TOOL_FAILURE_REASON_PATTERNS.GUEST_LIMIT_EXCEEDED.test(message))
    return TOOL_FAILURE_STATUS_MESSAGES.GUEST_LIMIT_EXCEEDED;
  if (message.startsWith(TOOL_FAILURE_REASON_PATTERNS.TIME_SLOT_CONFLICT))
    return TOOL_FAILURE_STATUS_MESSAGES.TIME_SLOT_CONFLICT;
  if (message === ERROR_MESSAGES.RESTAURANT_REQUIRED)
    return TOOL_FAILURE_STATUS_MESSAGES.RESTAURANT_REQUIRED;
  if (message === ERROR_MESSAGES.RESTAURANT_DETAILS_NOT_FOUND)
    return TOOL_FAILURE_STATUS_MESSAGES.RESTAURANT_NOT_FOUND;
  if (message === ERROR_MESSAGES.RESTAURANT_MENU_NOT_FOUND)
    return TOOL_FAILURE_STATUS_MESSAGES.MENU_NOT_FOUND;
  if (message.includes(ERROR_MESSAGES.AUTHENTICATION_REQUIRED))
    return TOOL_FAILURE_STATUS_MESSAGES.AUTHENTICATION_REQUIRED;
  if (message === TOOL_FAILURE_REASON_PATTERNS.REVIEW_NOT_FOUND)
    return TOOL_FAILURE_STATUS_MESSAGES.REVIEW_NOT_FOUND;
  if (message === TOOL_FAILURE_REASON_PATTERNS.DETAILS_INVALID)
    return TOOL_FAILURE_STATUS_MESSAGES.DETAILS_INVALID;

  // Unknown service errors should not expose technical details in the status.
  return fallback;
};
