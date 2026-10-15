export const RESERVATION_BOOKING_WORKFLOW_ID = "reservation-booking-workflow";

export const WORKFLOW_STEP_IDS = {
  VALIDATE_RESERVATION_DETAILS: "validate-reservation-details",
  AWAIT_APPROVAL: "await-approval",
  CHECK_TIME_SLOT_AVAILABILITY: "check-time-slot-availability",
  CREATE_RESERVATION: "create-reservation",
} as const;

export const RESERVATION_WORKFLOW_ERROR_CODES = {
  VALIDATION_FAILED: "VALIDATION_FAILED",
  CONFLICT: "CONFLICT",
  DECLINED: "DECLINED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;
