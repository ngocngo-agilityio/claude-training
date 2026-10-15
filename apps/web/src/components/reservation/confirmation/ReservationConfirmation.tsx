import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import {
  ToolCallStatus,
  type ReactHumanInTheLoop,
} from "@copilotkit/react-core/v2";
import { ReservationReviewCard } from "@/components/reservation/confirmation/ReservationReviewCard";
import { ReservationSuccessCard } from "@/components/reservation/confirmation/ReservationSuccessCard";
import { ToolStatus } from "@/components/ui/ToolStatus";
import { ERROR_MESSAGES } from "@repo/shared/constants/errors";
import { getToolFailureStatus } from "@repo/shared/utils/tool-status";
import { REVIEW_STATE_PHASE } from "@repo/shared/constants/reservation-review";
import {
  TOOL_COMPLETED_MESSAGES,
  TOOL_CANCELLED_MESSAGES,
  TOOL_FAILED_MESSAGES,
  TOOL_IDS,
  TOOL_LOADING_MESSAGES,
} from "@repo/shared/constants/tools";
import { useReservationReview } from "@/hooks/useReservationReview";
import { parseToolResult } from "@repo/shared/utils/tool";
import type { ConfirmReservationInput } from "@repo/shared/schemas/restaurant";
import { resumeReservationReview } from "@repo/shared/services/reservation-service";
import { ReservationConflictError } from "@repo/shared/services/restaurant-service";
import { useAuthStore } from "@/stores/auth-store";
import { useComposerLockStore } from "@/stores/composer-lock-store";

type ReservationConfirmationProps = ComponentProps<
  ReactHumanInTheLoop<ConfirmReservationInput>["render"]
>;

type SubmissionError = {
  message: string;
  kind: "conflict" | "general";
};

type ConfirmationContentProps = {
  children: ReactNode;
};

/** Add spacing above the confirmation content. */
const ConfirmationContent = ({ children }: ConfirmationContentProps) => (
  <div className="pt-3">{children}</div>
);

/** A friendly note in the assistant's own bubble style, asking the user to
 * resolve the review card above instead of leaving them to guess why the
 * composer is disabled. Rendered inline in the chat, not as a toast. */
const AwaitingDecisionNote = () => (
  <p className="mt-3 w-fit max-w-[92%] rounded-3xl rounded-tl-md border border-orange-200/60 bg-orange-50/70 px-5 py-4 text-sm leading-6 text-foreground shadow-sm dark:border-border/80 dark:bg-card">
    Please confirm or decline the reservation above — I&apos;ll pick things back
    up as soon as you do.
  </p>
);

/** Show loading while arguments stream or the workflow starts. */
const PreparingBookingStatus = () => (
  <ToolStatus
    variant="loading"
    message={
      TOOL_LOADING_MESSAGES[TOOL_IDS.CONFIRM_RESERVATION] ??
      "Preparing booking confirmation..."
    }
  />
);

// Read the approval flag from the completed tool result.
const wasReservationApproved = (result: string) => {
  const parsedResult = parseToolResult(result);

  return (
    typeof parsedResult === "object" &&
    parsedResult !== null &&
    "approved" in parsedResult &&
    parsedResult.approved === true
  );
};

/** Show booking progress and handle the user's decision. */
export const ReservationConfirmation = ({
  args,
  status,
  respond,
  result,
  toolCallId,
}: ReservationConfirmationProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [submissionError, setSubmissionError] = useState<SubmissionError>();

  const accessToken = useAuthStore((state) => state.accessToken);

  // Wait for complete AI arguments, then start the workflow with the user's token.
  // The workflow checks the details and pauses before booking for user approval.
  // reviewState controls loading, review, or error UI; respond reports setup failures to the AI.
  const reviewState = useReservationReview({
    accessToken,
    status,
    reservation: args,
    respond,
  });

  const lockComposer = useComposerLockStore((state) => state.lockComposer);
  const unlockComposer = useComposerLockStore((state) => state.unlockComposer);

  // Keep chat locked until the tool completes; each toolCallId owns a lock.
  useEffect(() => {
    if (status === ToolCallStatus.Complete) {
      unlockComposer(toolCallId);
      return;
    }

    lockComposer(
      toolCallId,
      "Please confirm or decline the reservation above before continuing.",
    );
  }, [status, toolCallId, lockComposer, unlockComposer]);

  // Release the lock on unmount so chat does not stay locked.
  useEffect(() => {
    return () => unlockComposer(toolCallId);
  }, [toolCallId, unlockComposer]);

  // Wait for CopilotKit to finish streaming the booking details.
  if (status === ToolCallStatus.InProgress) {
    return (
      <ConfirmationContent>
        <PreparingBookingStatus />
      </ConfirmationContent>
    );
  }

  // Show the final outcome: confirmed, preparation failed, or cancelled.
  if (status === ToolCallStatus.Complete) {
    return (
      <ConfirmationContent>
        {wasReservationApproved(result) ? (
          <ToolStatus
            variant="completed"
            message={
              TOOL_COMPLETED_MESSAGES[TOOL_IDS.CONFIRM_RESERVATION] ??
              "Reservation confirmed"
            }
          >
            <ReservationSuccessCard reservation={args} />
          </ToolStatus>
        ) : reviewState.phase === REVIEW_STATE_PHASE.FAILED ? (
          <ToolStatus
            variant="failed"
            message={getToolFailureStatus(
              reviewState.message,
              TOOL_FAILED_MESSAGES[TOOL_IDS.CONFIRM_RESERVATION],
            )}
          />
        ) : (
          <ToolStatus
            variant="cancelled"
            message={TOOL_CANCELLED_MESSAGES[TOOL_IDS.CONFIRM_RESERVATION]}
          />
        )}
      </ConfirmationContent>
    );
  }

  // Resume with approval to recheck availability and book the table.
  const handleConfirm = async () => {
    // A ready review provides the runId needed to resume.
    if (reviewState.phase !== REVIEW_STATE_PHASE.READY) return;

    setIsProcessing(true);
    setSubmissionError(undefined);

    try {
      await resumeReservationReview(accessToken, reviewState.runId, true);

      await respond({
        approved: true,
        // Ask the AI to follow up without repeating the success card.
        instruction:
          "Booked; the card shows date, time and guests. In 2 sentences, name the restaurant warmly and offer one next step not yet done (e.g. its menu) or say you are happy to help with anything else. Never reply with only a generic closing.",
      });
    } catch (error) {
      // Separate slot conflicts from other errors for the review card.
      setSubmissionError({
        kind:
          error instanceof ReservationConflictError ? "conflict" : "general",
        message:
          error instanceof Error
            ? error.message
            : ERROR_MESSAGES.CONFIRM_RESERVATION_FAILED,
      });
      setIsProcessing(false);
    }
  };

  // Resume with a decline, then tell the AI the request was cancelled.
  const handleDecline = async () => {
    setIsProcessing(true);
    setSubmissionError(undefined);

    try {
      if (reviewState.phase === REVIEW_STATE_PHASE.READY) {
        await resumeReservationReview(accessToken, reviewState.runId, false);
      }

      await respond?.({
        approved: false,
        reason:
          'The user chose not to submit this booking request. Reply like: "No problem, I\'ve stopped this booking request. Would you like to pick another time or try a different restaurant?" Do not say "no reservation was created at <restaurant>"; it sounds like an error.',
      });
    } catch {
      setSubmissionError({
        kind: "general",
        message: ERROR_MESSAGES.DECLINE_RESERVATION_FAILED,
      });
      setIsProcessing(false);
    }
  };

  // Preparation failed, so there is no booking to review.
  if (reviewState.phase === REVIEW_STATE_PHASE.FAILED) {
    return (
      <ConfirmationContent>
        <ToolStatus
          variant="failed"
          message={getToolFailureStatus(
            reviewState.message,
            TOOL_FAILED_MESSAGES[TOOL_IDS.CONFIRM_RESERVATION],
          )}
        />
      </ConfirmationContent>
    );
  }

  // Wait until the workflow is ready for the user's decision.
  if (reviewState.phase === REVIEW_STATE_PHASE.STARTING) {
    return (
      <ConfirmationContent>
        <PreparingBookingStatus />
      </ConfirmationContent>
    );
  }

  // Show the booking details, actions, and any submission error.
  return (
    <ConfirmationContent>
      <ReservationReviewCard
        reservation={reviewState.reservation}
        hasReservationConflict={submissionError?.kind === "conflict"}
        isProcessing={isProcessing}
        errorMessage={submissionError?.message}
        onCancel={handleDecline}
        onConfirm={handleConfirm}
      />
      <AwaitingDecisionNote />
    </ConfirmationContent>
  );
};
