import type {
  AgentRunnerConnectRequest,
  AgentRunnerIsRunningRequest,
  AgentRunnerRunRequest,
  AgentRunnerStopRequest,
} from "@copilotkit/runtime/v2";
import {
  AgentRunner,
  InMemoryAgentRunner,
} from "@copilotkit/runtime/v2";

/**
 * CopilotKit stores its event history separately and replays it after a reload.
 * This class separates that history into internal generations. Mastra still
 * receives the original thread ID, so reset does not change the database, URL,
 * or sidebar thread ID.
 */
class ResettableInMemoryAgentRunner extends AgentRunner {
  // This shared runner stores and replays CopilotKit AG-UI events.
  private readonly runner = new InMemoryAgentRunner();

  // Each thread's generation increases every time that thread is reset.
  private readonly generations = new Map<string, number>();

  /**
   * Before reset, the replay ID is the original thread ID.
   * After reset, it becomes "threadId::reset-N". CopilotKit can no longer find
   * the old events, but the app keeps the same logical thread ID.
   */
  private getReplayThreadId(threadId: string) {
    const generation = this.generations.get(threadId) ?? 0;
    return generation === 0 ? threadId : `${threadId}::reset-${generation}`;
  }

  run(request: AgentRunnerRunRequest) {
    return this.runner.run({
      ...request,
      // Only the runtime replay key changes. Mastra still receives the original
      // ID in request.input.threadId and saves messages to the same thread.
      threadId: this.getReplayThreadId(request.threadId),
    });
  }

  connect(request: AgentRunnerConnectRequest) {
    return this.runner.connect({
      ...request,
      threadId: this.getReplayThreadId(request.threadId),
    });
  }

  isRunning(request: AgentRunnerIsRunningRequest) {
    return this.runner.isRunning({
      threadId: this.getReplayThreadId(request.threadId),
    });
  }

  stop(request: AgentRunnerStopRequest) {
    return this.runner.stop({
      threadId: this.getReplayThreadId(request.threadId),
    });
  }

  /** Clears one thread's replay history without changing its logical ID. */
  async resetThread(threadId: string) {
    const replayThreadId = this.getReplayThreadId(threadId);

    // Stop the active stream before moving to a new generation.
    await this.runner.stop({ threadId: replayThreadId });

    // The next connection uses a new replay ID that has no events yet.
    this.generations.set(threadId, (this.generations.get(threadId) ?? 0) + 1);
  }
}

export const copilotKitRunner = new ResettableInMemoryAgentRunner();
