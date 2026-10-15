import {
  UseAgentUpdate,
  useAgent,
  useCopilotKit,
} from "@copilotkit/react-core/v2";
import { RESTAURANT_AGENT_MESSAGES } from "@repo/shared/constants/agent-messages";
import { AGENT_IDS } from "@repo/shared/constants/agents";
import type { Restaurant } from "@repo/shared/types/restaurant";

/** Provides the restaurant actions that send a user message and run the agent. */
export const useRestaurantAgentActions = () => {
  // Get the restaurant agent and update this hook when its running state changes.
  const { agent } = useAgent({
    agentId: AGENT_IDS.RESTAURANT_RESERVATION,
    updates: [UseAgentUpdate.OnRunStatusChanged],
  });
  const { copilotkit } = useCopilotKit();

  // Every restaurant action follows the same pattern: add a user message, then
  // ask CopilotKit to run the agent with that new message.
  const runAgentWithUserMessage = (content: string) => {
    if (agent.isRunning) {
      return false;
    }

    agent.addMessage({
      id: crypto.randomUUID(),
      role: "user",
      content,
    });
    void copilotkit.runAgent({ agent });

    return true;
  };

  const viewDetails = ({ name }: Restaurant) =>
    runAgentWithUserMessage(RESTAURANT_AGENT_MESSAGES.viewDetails(name));

  const viewMenu = (restaurantName: string) =>
    runAgentWithUserMessage(RESTAURANT_AGENT_MESSAGES.viewMenu(restaurantName));

  const reserve = (restaurantName: string) =>
    runAgentWithUserMessage(
      RESTAURANT_AGENT_MESSAGES.reserveTable(restaurantName),
    );

  return {
    agent,
    copilotkit,
    isAgentRunning: agent.isRunning,
    reserve,
    viewDetails,
    viewMenu,
  };
};
