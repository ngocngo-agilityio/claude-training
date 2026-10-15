import assert from "node:assert/strict";
import test from "node:test";
import { dropSavedClientHistory } from "../src/mastra/lib/client-tool-messages.ts";

const toolCall = (id, name) => ({
  id,
  type: "function",
  function: { name, arguments: "{}" },
});
const user = (id) => ({ id, role: "user", content: id });
const text = (id) => ({ id, role: "assistant", content: id });
const calls = (id, ...toolCalls) => ({ id, role: "assistant", toolCalls });
const result = (id, toolCallId) => ({
  id,
  role: "tool",
  toolCallId,
  content: "{}",
});

const createInput = (messages) => ({
  threadId: "thread-1",
  runId: "run-1",
  state: {},
  context: [],
  forwardedProps: {},
  // The client only lists the tools it executes itself.
  tools: ["confirm_reservation", "show_reservation_guide", "change_theme"].map(
    (name) => ({ name, description: "", parameters: {} }),
  ),
  messages,
});

const keptIds = (messages) =>
  dropSavedClientHistory(createInput(messages)).messages.map(({ id }) => id);

test("user run: sends only the new user message", () => {
  assert.deepEqual(
    keptIds([
      user("u1"),
      calls("a1", toolCall("c1", "recommend_restaurants")),
      result("t1", "c1"),
      text("a1-text"),
      user("u2"),
    ]),
    ["u2"],
  );
});

test("user run: drops earlier frontend tool turns that already had a follow-up", () => {
  assert.deepEqual(
    keptIds([
      user("u1"),
      calls("a1", toolCall("c1", "change_theme")),
      result("t1", "c1"),
      text("a1-text"),
      user("u2"),
      calls(
        "a2",
        toolCall("c2", "reserve_restaurant"),
        toolCall("c3", "confirm_reservation"),
      ),
      result("t2", "c2"),
      result("t3", "c3"),
      text("a2-text"),
      user("u3"),
    ]),
    ["u3"],
  );
});

test("user run: includes a frontend tool result that never got a follow-up", () => {
  assert.deepEqual(
    keptIds([
      user("u1"),
      text("a1"),
      user("u2"),
      calls("a2", toolCall("c1", "show_reservation_guide")),
      result("t1", "c1"),
      user("u3"),
    ]),
    ["u2", "a2", "t1", "u3"],
  );
});

test("tool run: sends the current turn with the frontend tool result", () => {
  assert.deepEqual(
    keptIds([
      user("u1"),
      calls("a1", toolCall("c1", "change_theme")),
      result("t1", "c1"),
      text("a1-text"),
      user("u2"),
      calls(
        "a2",
        toolCall("c2", "reserve_restaurant"),
        toolCall("c3", "confirm_reservation"),
      ),
      result("t2", "c2"),
      result("t3", "c3"),
    ]),
    ["u2", "a2", "t2", "t3"],
  );
});

test("tool run: drops a backend-only call made earlier in the same turn", () => {
  assert.deepEqual(
    keptIds([
      user("u1"),
      calls("a1", toolCall("c1", "reserve_restaurant")),
      result("t1", "c1"),
      calls("a2", toolCall("c2", "confirm_reservation")),
      result("t2", "c2"),
    ]),
    ["u1", "a2", "t2"],
  );
});

test("keeps the text of an assistant message while dropping its backend call", () => {
  const { messages } = dropSavedClientHistory(
    createInput([
      user("u1"),
      {
        id: "a1",
        role: "assistant",
        content: "Looking that up.",
        toolCalls: [toolCall("c1", "view_restaurant_menu")],
      },
      result("t1", "c1"),
      calls("a2", toolCall("c2", "confirm_reservation")),
      result("t2", "c2"),
    ]),
  );

  assert.equal(messages[1].content, "Looking that up.");
  assert.equal(messages[1].toolCalls, undefined);
});

test("keeps instruction messages from any position", () => {
  assert.deepEqual(
    keptIds([
      { id: "d1", role: "developer", content: "context" },
      user("u1"),
      text("a1"),
      user("u2"),
    ]),
    ["d1", "u2"],
  );
});

test("keeps everything when there is no user message", () => {
  assert.deepEqual(
    keptIds([
      calls("a1", toolCall("c1", "confirm_reservation")),
      result("t1", "c1"),
    ]),
    ["a1", "t1"],
  );
});
