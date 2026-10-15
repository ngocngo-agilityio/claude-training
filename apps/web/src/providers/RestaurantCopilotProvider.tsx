import "@copilotkit/react-core/v2/styles.css";
import {
  CopilotKit,
  type CopilotKitCoreReactSubscriber,
  defineToolCallRenderer,
  useCopilotKit,
} from "@copilotkit/react-core/v2";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useParams } from "react-router";
import { RestaurantToolCallRenderer } from "@/components/chat/RestaurantToolCallRenderer";
import { CopilotErrorAlert } from "@/components/error/CopilotErrorAlert";
import { AGENT_IDS } from "@repo/shared/constants/agents";
import { getApiConfig } from "@repo/shared/config/api";
import { API_PATHS } from "@repo/shared/constants/api";
import {
  COPILOTKIT_ERROR_MESSAGES,
  DEFAULT_COPILOTKIT_ERROR_MESSAGE,
} from "@repo/shared/constants/copilotkit-errors";
import { REQUEST_CONTEXT_HEADERS } from "@repo/shared/constants/request-context";
import { useAuthStore } from "@/stores/auth-store";
import { useConversationStore } from "@/stores/conversation-store";

const RESTAURANT_TOOL_CALL_RENDERER = defineToolCallRenderer({
  // The wildcard sends every backend tool call to the shared renderer. That
  // renderer uses the actual tool name to choose the correct UI component.
  name: "*",
  render: RestaurantToolCallRenderer,
});

type RestaurantCopilotProviderProps = {
  children: ReactNode;
};

type CopilotErrorListenerProps = {
  onError: NonNullable<CopilotKitCoreReactSubscriber["onError"]>;
};

/** Registers error handling for the self-hosted CopilotKit runtime. */
const CopilotErrorListener = ({ onError }: CopilotErrorListenerProps) => {
  const { copilotkit } = useCopilotKit();

  useEffect(() => {
    const subscription = copilotkit.subscribe({ onError });
    return () => subscription.unsubscribe();
  }, [copilotkit, onError]);

  return null;
};

/** Shares the agent connection with the authenticated layout and its pages. */
export const RestaurantCopilotProvider = ({
  children,
}: RestaurantCopilotProviderProps) => {
  // Get the token of the signed-in user.
  const accessToken = useAuthStore((state) => state.accessToken);

  const storedActiveThreadId = useConversationStore(
    (state) => state.activeThreadId,
  );

  const { threadId: routeThreadId } = useParams<{ threadId: string }>();

  const activeThreadId = routeThreadId ?? storedActiveThreadId;

  // The user's local time area, for example "Asia/Ho_Chi_Minh".
  // It helps the agent understand words such as "today" and "tomorrow".
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleError: NonNullable<CopilotKitCoreReactSubscriber["onError"]> =
    useCallback(({ code }) => {
      setErrorMessage(
        COPILOTKIT_ERROR_MESSAGES[code] ?? DEFAULT_COPILOTKIT_ERROR_MESSAGE,
      );
    }, []);

  // Connect the chat UI to the Mastra backend.
  return (
    // Send the user token and conversation ID with every chat request.
    <CopilotKit
      agent={AGENT_IDS.RESTAURANT_RESERVATION}
      headers={{
        Authorization: `Bearer ${accessToken}`,
        // CopilotKit forwards this header to Mastra's setContext callback.
        [REQUEST_CONTEXT_HEADERS.TIMEZONE]: timezone,
      }}
      // CopilotKit invokes this renderer whenever the agent calls a backend tool.
      renderToolCalls={[RESTAURANT_TOOL_CALL_RENDERER]}
      runtimeUrl={`${getApiConfig().mastraBaseUrl}${API_PATHS.COPILOTKIT}`}
      threadId={activeThreadId}
    >
      <CopilotErrorListener onError={handleError} />
      {errorMessage && (
        <CopilotErrorAlert
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}
      {children}
    </CopilotKit>
  );
};
