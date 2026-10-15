import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { MastraAgent } from "@ag-ui/mastra";

const require = createRequire(import.meta.url);
const TOOL_NAME = "view_restaurant_menu";

// Exercise the pinned adapter's event mapping without an LLM or live backend.
const createProcessor = (
  Agent,
  streamServerToolCalls = false,
  frontendTools = [],
) => {
  const adapter = Object.create(Agent.prototype);
  // Mirrors the option set by src/mastra/routes/copilotkit.ts.
  adapter.streamServerToolCalls = streamServerToolCalls;
  const events = [];
  const callbacks = Object.fromEntries(
    [
      "onToolCallStart",
      "onToolCallArgs",
      "onToolCallEnd",
      "onToolResultPart",
      "onToolSuspended",
    ].map((name) => [name, () => events.push(name)]),
  );
  const processor = adapter.createChunkProcessor(
    callbacks,
    new Set(frontendTools),
  );
  const send = (type, payload = {}) =>
    processor.handleChunk({
      type,
      payload: { toolCallId: "call-1", toolName: TOOL_NAME, ...payload },
    });
  return { events, send };
};

for (const [format, Agent] of [
  ["ESM", MastraAgent],
  ["CJS", require("@ag-ui/mastra").MastraAgent],
]) {
  test(`${format}: backend tools emit progress before results when streaming is on`, () => {
    const { events, send } = createProcessor(Agent, true);
    send("tool-call-input-streaming-start");
    assert.deepEqual(events, ["onToolCallStart"]);
    send("tool-call-delta", { argsTextDelta: "{}" });
    send("tool-call-input-streaming-end");
    send("tool-call", { args: {} });
    assert.deepEqual(events, [
      "onToolCallStart",
      "onToolCallArgs",
      "onToolCallEnd",
    ]);
    send("tool-result", { result: { success: true } });
    assert.deepEqual(events, [
      "onToolCallStart",
      "onToolCallArgs",
      "onToolCallEnd",
      "onToolResultPart",
    ]);
  });

  test(`${format}: backend tools stay buffered when streaming is off`, () => {
    const { events, send } = createProcessor(Agent);
    send("tool-call-input-streaming-start");
    send("tool-call", { args: {} });
    assert.deepEqual(events, []);
    send("tool-call-suspended", { runId: "run-1" });
    assert.deepEqual(events, ["onToolSuspended"]);
  });

  test(`${format}: frontend tools stream even when server streaming is off`, () => {
    const { events, send } = createProcessor(Agent, false, [TOOL_NAME]);
    send("tool-call-input-streaming-start");
    assert.deepEqual(events, ["onToolCallStart"]);
  });
}
