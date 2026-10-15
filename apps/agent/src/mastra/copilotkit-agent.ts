import type { RunAgentInput } from "@ag-ui/client";
import { MastraAgent, type MastraAgentConfig } from "@ag-ui/mastra";
import { dropSavedClientHistory } from "./lib/client-tool-messages";

/**
 * Mastra adapter that ignores the history re-sent by the client.
 * Mastra memory is the source of truth for earlier turns.
 */
export class RestaurantMastraAgent extends MastraAgent {
  private readonly agentConfig: MastraAgentConfig;

  constructor(agentConfig: MastraAgentConfig) {
    super(agentConfig);
    this.agentConfig = agentConfig;
  }

  // CopilotKit clones the agent for every run. The base clone() returns a plain
  // MastraAgent, which would lose the run() override below.
  clone() {
    const clonedAgent = new RestaurantMastraAgent(this.agentConfig);

    if (this.headers) clonedAgent.headers = { ...this.headers };

    return clonedAgent;
  }

  run(input: RunAgentInput) {
    return super.run(dropSavedClientHistory(input));
  }
}
