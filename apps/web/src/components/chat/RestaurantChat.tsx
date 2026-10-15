import { ChatWelcomeScreen } from "@/components/chat/ChatWelcomeScreen";
import { CopilotChatPanel } from "@/components/chat/ChatPanel";
import { ResetConversationButton } from "@/components/chat/ResetConversationButton";
import { AGENT_IDS } from "@repo/shared/constants/agents";
import { useRestaurantChat } from "@/hooks/useRestaurantChat";
import {
  useConfirmReservationTool,
  useReservationGuideTool,
} from "@/hooks/useRestaurantTools";
import { useThemeTool } from "@/hooks/useThemeTools";

type RestaurantChatProps = {
  threadId: string;
};

/**
 * Registers every frontend tool, displays its result components, and renders
 * the Reset button and chat panel for the selected conversation.
 */
export const RestaurantChat = ({ threadId }: RestaurantChatProps) => {
  // Get the chat state and actions from one reusable hook.
  const {
    accessToken,
    hasMessages,
    isAgentRunning,
    resetActiveConversation,
    resetVersion,
    stopAgent,
  } = useRestaurantChat(threadId);

  // Share and mutate the current application theme.
  useThemeTool();

  // Render the visual explanation of the reservation workflow.
  useReservationGuideTool();

  // Ask the user to approve or decline before creating a booking.
  useConfirmReservationTool();

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      {/* Only show Reset when the conversation contains messages. */}
      {hasMessages && (
        <div className="flex h-10 shrink-0 items-start justify-end">
          <ResetConversationButton
            disabled={isAgentRunning || !accessToken}
            onReset={resetActiveConversation}
          />
        </div>
      )}
      {/* Recreate the chat panel when the user selects another conversation. */}
      <CopilotChatPanel
        agentId={AGENT_IDS.RESTAURANT_RESERVATION}
        // Show the conversation when it has messages. Show the welcome screen
        // when the thread is new, empty, or has just been reset.
        chatView={{ hasExplicitThreadId: hasMessages }}
        containerClassName="min-h-0 flex-1 [--cpk-container-3xl:100%]"
        // Remount the chat to clear its internal state after reset.
        key={`${threadId}:${resetVersion}`}
        onStop={stopAgent}
        // Identify the current conversation.
        threadId={threadId}
        welcomeScreen={ChatWelcomeScreen}
      />
    </div>
  );
};
