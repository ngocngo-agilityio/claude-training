import type { ApiRoute, ContextWithMastra } from "@mastra/core/server";
import { API_PATHS } from "@repo/shared/constants/api";
import { HTTP_STATUS_CODES, HttpMethod } from "@repo/shared/constants/http";
import { restaurantReservationAgent } from "@/mastra/agents/restaurant";
import { getAuthenticatedUserId } from "@/mastra/auth/authentication-middleware";
import { copilotKitRunner } from "@/mastra/copilotkit-runner";

/**
 * Deletes all messages in a conversation but keeps the thread.
 */
export const resetConversationRoute: ApiRoute = {
  path: API_PATHS.RESET_CONVERSATION,
  method: HttpMethod.POST,
  handler: async (context: ContextWithMastra) => {
    // Scope the reset operation to the authenticated owner's conversation.
    const userId = getAuthenticatedUserId(context.get("requestContext"));

    // Read the thread ID from the request body.
    const body = await context.req.json().catch(() => null);
    const threadId = body?.threadId;

    // A thread ID is required to find the conversation.
    if (typeof threadId !== "string" || !threadId.trim()) {
      return context.json(
        {
          code: "INVALID_REQUEST",
          error: "A thread ID is required.",
        },
        HTTP_STATUS_CODES.BAD_REQUEST,
      );
    }

    // Find the thread in Mastra memory.
    const memory = await restaurantReservationAgent.getMemory();
    const thread = await memory?.getThreadById({ threadId });

    // Only reset a thread that belongs to the current user.
    if (memory && thread?.resourceId === userId) {
      const { messages } = await memory.recall({
        threadId,
        resourceId: userId,
        // Load every message, not only the first page.
        perPage: false,
      });

      if (messages.length > 0) {
        // Delete only the messages so the thread remains in the sidebar.
        await memory.deleteMessages(messages.map((message) => message.id));
      }

      // CopilotKit has a separate event history that is replayed after reload.
      // Move this thread to a new generation with an empty replay history.
      await copilotKitRunner.resetThread(threadId);
    }

    // If the thread is missing or belongs to another user, do nothing.
    // Returning the same result keeps other users' thread data private.
    // Return success with no response body.
    return context.body(null, HTTP_STATUS_CODES.NO_CONTENT);
  },
};
