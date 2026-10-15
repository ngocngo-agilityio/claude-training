import { TripWire } from "@mastra/core/agent";
import {
  TokenLimiter,
  type ProcessInputStepArgs,
} from "@mastra/core/processors";
import { ERROR_MESSAGES } from "@repo/shared/constants/errors";

// Validate the required setting before creating the processor.
const parseContextTokenLimit = (
  configuredLimit: string | undefined,
): number => {
  const value = configuredLimit?.trim();

  if (!value) {
    throw new Error(ERROR_MESSAGES.CONTEXT_TOKEN_LIMIT_REQUIRED);
  }

  const limit = Number(value);

  // Reject invalid limits before the agent starts.
  if (!Number.isSafeInteger(limit) || limit <= 0) {
    throw new Error(ERROR_MESSAGES.CONTEXT_TOKEN_LIMIT_INVALID);
  }

  return limit;
};

/** Pick a clear chat message for why the request was blocked. */
const getBlockedMessage = (error: TripWire, stepNumber: number): string => {
  const metadata = error.options.metadata as
    | { remainingBudget?: number }
    | undefined;

  // No remaining budget means the instructions alone are too big.
  // Users cannot fix this, so ask them to try later.
  if (metadata?.remainingBudget === undefined)
    return ERROR_MESSAGES.ASSISTANT_UNAVAILABLE;

  // Step 0 checks the user's new message. Later steps check tool results.
  return stepNumber === 0
    ? ERROR_MESSAGES.REQUEST_TOO_LONG
    : ERROR_MESSAGES.REQUEST_TOO_LARGE;
};

/**
 * Token limiter that shows a clear message when it blocks a request.
 * The chat displays the block reason to users, so replace the technical one.
 */
class RestaurantContextLimiter extends TokenLimiter {
  async processInputStep(args: ProcessInputStepArgs) {
    try {
      return await super.processInputStep(args);
    } catch (error) {
      // Rethrow other errors unchanged.
      if (!(error instanceof TripWire)) throw error;

      throw new TripWire(
        getBlockedMessage(error, args.stepNumber),
        {
          ...error.options,
          // Keep the technical reason for logs and traces.
          metadata: {
            ...(error.options.metadata ?? {}),
            technicalReason: error.message,
          },
        },
        error.processorId,
      );
    }
  }
}

// Create a context limiter for the agent's inputProcessors.
export const createRestaurantContextLimiter = (
  configuredLimit: string | undefined = process.env
    .RESTAURANT_CONTEXT_TOKEN_LIMIT,
): TokenLimiter => {
  return new RestaurantContextLimiter({
    limit: parseContextTokenLimit(configuredLimit),
    // Drop older history when needed, keeping recent messages together.
    // Keep or drop each tool call together with its result.
    // Only shorten the model's prompt; saved history stays unchanged.
    trimMode: "contiguous",
  });
};
