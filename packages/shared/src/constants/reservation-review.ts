/** Phases the review card moves through while starting the
 * reservation-booking workflow. "ready" is reached once the workflow has
 * paused, waiting for the user. */
export const REVIEW_STATE_PHASE = {
  STARTING: "starting",
  READY: "ready",
  FAILED: "failed",
} as const;
