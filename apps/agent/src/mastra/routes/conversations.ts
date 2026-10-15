import type { ApiRoute, ContextWithMastra } from "@mastra/core/server";
import { API_PATHS } from "@repo/shared/constants/api";
import { HTTP_STATUS_CODES, HttpMethod } from "@repo/shared/constants/http";
import { restaurantReservationAgent } from "@/mastra/agents/restaurant";
import { getAuthenticatedUserId } from "@/mastra/auth/authentication-middleware";

const TITLE_MAX_LENGTH = 60;

// Read text from either a plain message or structured content parts.
const extractMessageText = (content: unknown) => {
  // Return plain text without extra parsing.
  if (typeof content === "string") return content;

  // Ignore unsupported content values.
  if (!content || typeof content !== "object") return "";

  // Structured messages store their content in parts.
  if (!("parts" in content)) return "";
  const { parts } = content;
  if (!Array.isArray(parts)) return "";

  // Join all valid text parts into one string.
  return parts
    .map((part: unknown) => {
      if (!part || typeof part !== "object") return "";
      if (!("text" in part)) return "";
      const { text } = part;
      return typeof text === "string" ? text : "";
    })
    .join(" ");
};

const createConversationTitle = (content: unknown) => {
  // Keep titles on one line and short enough for the sidebar.
  const text = extractMessageText(content).replace(/\s+/g, " ").trim();

  // Keep short titles unchanged.
  if (text.length <= TITLE_MAX_LENGTH) return text;

  // Shorten long titles and show that text was removed.
  return `${text.slice(0, TITLE_MAX_LENGTH).trimEnd()}…`;
};

/** Lists the signed-in user's conversations, newest first. */
export const listConversationsRoute: ApiRoute = {
  path: API_PATHS.CONVERSATIONS,
  method: HttpMethod.GET,
  handler: async (context: ContextWithMastra) => {
    // Scope all reads to the authenticated owner to prevent cross-user access.
    const userId = getAuthenticatedUserId(context.get("requestContext"));

    // Get the storage used by the restaurant agent.
    const memory = await restaurantReservationAgent.getMemory();

    // Return an error when conversation storage is not available.
    if (!memory) {
      return context.json(
        { error: "Conversation memory is unavailable." },
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      );
    }

    // Each thread stores its owner ID in resourceId.
    // Filter by userId so users see only their own conversations.
    const { threads } = await memory.listThreads({
      filter: { resourceId: userId },
      orderBy: { field: "updatedAt", direction: "DESC" },
      perPage: false,
    });

    const conversations = await Promise.all(
      threads.map(async (thread) => {
        // Load the complete conversation from oldest to newest. Using only the
        // latest messages can mistake a short follow-up such as a date or time
        // for the conversation title.
        const { messages } = await memory.recall({
          threadId: thread.id,
          resourceId: userId,
          perPage: false,
          orderBy: { field: "createdAt", direction: "ASC" },
        });

        // Use the user's actual opening request, never an assistant response or
        // a later answer collected during the booking flow.
        const firstUserMessage = messages.find(
          (message) => message.role === "user",
        );

        // Derive the sidebar title consistently even if storage contains an
        // older automatically generated title.
        const title = createConversationTitle(firstUserMessage?.content);
        return { ...thread, title: title || thread.title };
      }),
    );

    // Send the prepared list to the sidebar.
    return context.json({ threads: conversations });
  },
};

/** Permanently deletes one conversation owned by the signed-in user. */
export const deleteConversationRoute: ApiRoute = {
  path: `${API_PATHS.CONVERSATIONS}/:threadId`,
  method: HttpMethod.DELETE,
  handler: async (context: ContextWithMastra) => {
    // Scope deletion to the authenticated owner to protect other users' data.
    const userId = getAuthenticatedUserId(context.get("requestContext"));

    // Read the thread ID from the URL.
    const threadId = context.req.param("threadId");

    // A thread ID is required to find the conversation.
    if (!threadId) {
      return context.json(
        { error: "A thread ID is required." },
        HTTP_STATUS_CODES.BAD_REQUEST,
      );
    }

    // Get the storage used by the restaurant agent.
    const memory = await restaurantReservationAgent.getMemory();

    // Return an error when conversation storage is not available.
    if (!memory) {
      return context.json(
        { error: "Conversation memory is unavailable." },
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      );
    }

    // Load the thread before checking its owner.
    const thread = await memory.getThreadById({ threadId });

    // Compare the owner ID before deleting to protect other users' threads.
    if (thread?.resourceId === userId) {
      await memory.deleteThread(threadId);
    }

    return context.body(null, HTTP_STATUS_CODES.NO_CONTENT);
  },
};
