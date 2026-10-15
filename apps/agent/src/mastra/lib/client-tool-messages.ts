import type { Message, RunAgentInput } from "@ag-ui/client";

const isInstruction = ({ role }: Message) =>
  role === "developer" || role === "system";

/**
 * Finds where the part of the client history that the server has not saved
 * yet begins.
 * - Run started by a frontend tool result: the turn after the last user
 *   message.
 * - Run started by a user message: that message only, unless the previous turn
 *   ended with a frontend tool result that never got a follow-up run (for
 *   example the reservation guide). That turn is then included once.
 */
const findUnsavedStartIndex = (messages: Message[]) => {
  const roles = messages.map(({ role }) => role);
  const lastUserIndex = roles.lastIndexOf("user");

  if (lastUserIndex === -1) return 0;

  const isUserRun = lastUserIndex === messages.length - 1;
  const endsWithToolResult = roles[lastUserIndex - 1] === "tool";

  if (!isUserRun || !endsWithToolResult) return lastUserIndex;

  return Math.max(roles.lastIndexOf("user", lastUserIndex - 1), 0);
};

/**
 * Keeps only the client messages that Mastra memory does not have yet: the new
 * user message, or the frontend tool results that start this run.
 *
 * The client sends its whole history on every run. Mastra memory already holds
 * every earlier turn, but the AG-UI adapter gives each tool result a random
 * message ID, so it can never match them to the saved ones. It treats them as
 * new and re-sends them with the assistant messages that made the calls
 * (ag-ui-protocol/ag-ui#2054, "Keep tool-result pairs"). Those copies replace
 * the saved messages and pile up at the end of the prompt, so the model either
 * loses an earlier answer and repeats the request, or treats old tool results
 * (a past theme change or booking) as if they just happened.
 *
 * Remove this once @ag-ui/mastra stops re-sending saved tool results.
 */
export const dropSavedClientHistory = (input: RunAgentInput): RunAgentInput => {
  const unsavedStartIndex = findUnsavedStartIndex(input.messages);
  const unsavedMessages = input.messages.filter(
    (message, index) => index >= unsavedStartIndex || isInstruction(message),
  );

  // The client lists the tools it runs itself (confirmation, guide, theme).
  const clientToolNames = new Set(input.tools.map(({ name }) => name));
  const backendToolCallIds = new Set<string>();

  for (const message of unsavedMessages) {
    if (message.role !== "assistant" || !message.toolCalls?.length) continue;

    // Leave a message untouched when it also calls a frontend tool: the
    // adapter needs it to pair that call with the result from the client.
    const callsClientTool = message.toolCalls.some(({ function: { name } }) =>
      clientToolNames.has(name),
    );
    if (callsClientTool) continue;

    for (const { id } of message.toolCalls) backendToolCallIds.add(id);
  }

  const messages: Message[] = [];

  // Backend tool calls are saved together with their results, so drop both.
  for (const message of unsavedMessages) {
    if (message.role === "tool") {
      if (!backendToolCallIds.has(message.toolCallId)) messages.push(message);
      continue;
    }

    if (
      message.role !== "assistant" ||
      !message.toolCalls?.some(({ id }) => backendToolCallIds.has(id))
    ) {
      messages.push(message);
      continue;
    }

    // Drop the calls too, so a call is never sent without its result.
    if (message.content) messages.push({ ...message, toolCalls: undefined });
  }

  return { ...input, messages };
};
