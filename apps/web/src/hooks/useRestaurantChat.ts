import { useEffect, useRef, useState } from "react";
import { useConfigureSuggestions } from "@copilotkit/react-core/v2";
import { useNavigate, useParams } from "react-router";
import { AGENT_IDS } from "@repo/shared/constants/agents";
import { ERROR_MESSAGES } from "@repo/shared/constants/errors";
import { getConversationRoute } from "@/constants/routes";
import { RESTAURANT_CHAT_SUGGESTIONS } from "@repo/shared/constants/suggestions";
import { useRestaurantAgentActions } from "@/hooks/useRestaurantAgentActions";
import { resetConversation } from "@repo/shared/services/chat-service";
import { useAuthStore } from "@/stores/auth-store";
import { useConversationStore } from "@/stores/conversation-store";

/**
 * Provides the chat state and actions used by RestaurantChat.
 */
export const useRestaurantChat = (threadId: string) => {
  const [resetVersion, setResetVersion] = useState(0);
  const navigate = useNavigate();
  const { threadId: routeThreadId } = useParams<{ threadId: string }>();
  const loadConversations = useConversationStore(
    (state) => state.loadConversations,
  );

  const accessToken = useAuthStore((state) => state.accessToken);

  // Reuse the same agent connection as the tool-call renderer.
  const { agent, copilotkit, isAgentRunning } = useRestaurantAgentActions();
  const previousThreadId = useRef(threadId);
  const hasSeenEmptyChat = useRef(agent.messages.length === 0);

  // A new chat starts at /chat without a thread ID.
  // After the first message, add the ID so refresh can reopen the same chat.
  useEffect(() => {
    if (previousThreadId.current !== threadId) {
      previousThreadId.current = threadId;
      hasSeenEmptyChat.current = agent.messages.length === 0;
      return;
    }

    if (agent.messages.length === 0) {
      hasSeenEmptyChat.current = true;
      return;
    }

    if (!routeThreadId && hasSeenEmptyChat.current) {
      navigate(getConversationRoute(threadId), { replace: true });
    }
  }, [agent.messages.length, navigate, routeThreadId, threadId]);

  // Reload the sidebar after the agent finishes so its title and time are fresh.
  useEffect(() => {
    if (!isAgentRunning && agent.messages.length > 0) {
      loadConversations(accessToken);
    }
  }, [accessToken, isAgentRunning, agent.messages.length, loadConversations]);

  // Show starter suggestions only when the conversation is empty.
  useConfigureSuggestions({
    available: "before-first-message",
    consumerAgentId: AGENT_IDS.RESTAURANT_RESERVATION,
    suggestions: RESTAURANT_CHAT_SUGGESTIONS,
  });

  /** Stops the current AI response immediately. */
  const stopAgent = () => {
    // Stop the response stream and clear the active run from the UI.
    copilotkit.stopAgent({ agent });
    agent.detachActiveRun();
  };

  /** Clears the current conversation in both the backend and the UI. */
  const resetActiveConversation = async () => {
    if (isAgentRunning || !accessToken) {
      throw new Error(ERROR_MESSAGES.RESET_CONVERSATION_UNAVAILABLE);
    }

    // The backend clears both sources that could restore old messages:
    // 1. Messages saved in Mastra memory.
    // 2. AG-UI events replayed by CopilotKit after a page reload.
    await resetConversation(accessToken, threadId);

    // Clear visible messages so the welcome screen appears immediately.
    agent.setMessages([]);

    // Change the key so React recreates CopilotChat and clears its internal UI
    // state. The current thread ID stays unchanged.
    setResetVersion((version) => version + 1);
  };

  // Return only the values and actions that RestaurantChat needs.
  return {
    accessToken,
    hasMessages: agent.messages.length > 0,
    isAgentRunning,
    resetActiveConversation,
    resetVersion,
    stopAgent,
    threadId,
  };
};
