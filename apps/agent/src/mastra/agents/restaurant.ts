import { Agent } from "@mastra/core/agent";
import type { RequestContext } from "@mastra/core/request-context";
import { Memory } from "@mastra/memory";
import { AGENT_IDS } from "@repo/shared/constants/agents";
import {
  DEFAULT_REQUEST_CONTEXT,
  REQUEST_CONTEXT_KEYS,
} from "@repo/shared/constants/request-context";
import {
  MISTRAL_MODEL,
  OPENAI_MODEL,
  OPENROUTER_MODEL,
} from "@/constants/models";
import { TOOL_IDS } from "@repo/shared/constants/tools";
import { createRestaurantContextLimiter } from "@/mastra/processors/restaurant-context-limit";
import { restaurantInputNormalizer } from "@/mastra/processors/restaurant-input-normalizer";
import { createRestaurantToolHistoryFilter } from "@/mastra/processors/restaurant-tool-history";
import {
  getCurrentDateTime,
  normalizeTimezone,
} from "@/lib/utils/request-context";
import { createRestaurantAgentPrompt } from "../prompts/restaurant-agent";
import { guestProfileSchema } from "../schemas/guest-profile";
import { getStorage } from "../storage";
import { listReservationsTool } from "../tools/list-reservations-tool";
import { recommendRestaurantsTool } from "../tools/recommend-restaurants-tool";
import { reserveRestaurantTool } from "../tools/reserve-restaurant-tool";
import { viewRestaurantDetailsTool } from "../tools/view-restaurant-details-tool";
import { viewRestaurantMenuTool } from "../tools/view-restaurant-menu-tool";

const getContextString = (
  requestContext: RequestContext,
  key: string,
  fallback: string,
) => {
  const value = requestContext.get(key);
  return typeof value === "string" ? value : fallback;
};

/** Build agent instructions with values from the current request. */
const createRestaurantInstructions = (requestContext: RequestContext) => {
  const timezone = normalizeTimezone(
    getContextString(
      requestContext,
      REQUEST_CONTEXT_KEYS.TIMEZONE,
      DEFAULT_REQUEST_CONTEXT.TIMEZONE,
    ),
  );
  const { date: currentDate, time: currentTime } = getCurrentDateTime(timezone);

  return createRestaurantAgentPrompt({ timezone, currentDate, currentTime });
};

/**
 * Powers the restaurant assistant.
 * It understands the user's preferences and calls the recommendation tool.
 */
export const restaurantReservationAgent = new Agent({
  id: AGENT_IDS.RESTAURANT_RESERVATION,
  name: AGENT_IDS.RESTAURANT_RESERVATION,
  // Mastra creates these instructions again for every request.
  instructions: ({ requestContext }) =>
    createRestaurantInstructions(requestContext),
  model: [
    { model: OPENAI_MODEL, maxRetries: 2 },
    { model: MISTRAL_MODEL, maxRetries: 1 },
    { model: OPENROUTER_MODEL, maxRetries: 1 },
  ],
  // 1. Clean user text. 2. Shorten old lookup tool calls.
  // 3. Limit the context that is left.
  inputProcessors: [
    restaurantInputNormalizer,
    createRestaurantToolHistoryFilter(),
    createRestaurantContextLimiter(),
  ],
  defaultOptions: {
    providerOptions: {
      openai: {
        reasoningEffort: "low",
      },
    },
    // Execute tools sequentially so they cannot race on shared state.
    toolCallConcurrency: 1,
  },
  tools: {
    [TOOL_IDS.RECOMMEND_RESTAURANTS]: recommendRestaurantsTool,
    [TOOL_IDS.LIST_RESERVATIONS]: listReservationsTool,
    [TOOL_IDS.RESERVE_RESTAURANT]: reserveRestaurantTool,
    [TOOL_IDS.VIEW_RESTAURANT_DETAILS]: viewRestaurantDetailsTool,
    [TOOL_IDS.VIEW_RESTAURANT_MENU]: viewRestaurantMenuTool,
  },
  memory: new Memory({
    // Store chat history and guest profiles in the database.
    storage: getStorage(),
    options: {
      // Short-term: remember the last 10 messages in the current conversation.
      lastMessages: 10,

      // Do not retrieve messages from previous conversations.
      semanticRecall: false,

      // Long-term: share stable guest facts across the same user's conversations.
      workingMemory: {
        enabled: true,
        scope: "resource",
        // Schema-based memory merges partial updates: the model only sends
        // changed fields instead of rewriting the whole profile.
        schema: guestProfileSchema,
      },
    },
  }),
});
