---
name: add-agent-tool
description: Add a new backend tool to the Mastra restaurant agent end to end (shared schema and constants, tool file, agent registration, response prompt, web renderer). Use when the user asks to add, create or expose a new agent tool or capability.
---

# Add a tool to the restaurant agent

A backend tool touches three packages: `packages/shared`, `apps/agent` and
`apps/web`. Follow every step below so none is missed.

Use `view_restaurant_menu` as the reference implementation. Read its files
before writing a new tool instead of working from memory:

- `apps/agent/src/mastra/tools/view-restaurant-menu-tool.ts`
- `viewRestaurantMenu*` in `packages/shared/src/schemas/restaurant.ts`
- the `TOOL_IDS.VIEW_RESTAURANT_MENU` case in
  `apps/web/src/components/chat/RestaurantToolCallRenderer.tsx`

## 1. Clarify first

If the request does not say, ask before writing code:

- What the tool does and when the agent should call it
- Which data it needs, and whether the API already provides it
- Whether the result is shown as a card in the chat, or only drives the reply

## 2. Shared package (`packages/shared/src`)

1. `constants/tools.ts`: add the ID to `TOOL_IDS` (snake_case value), plus
   entries in `TOOL_LOADING_MESSAGES` and `TOOL_COMPLETED_MESSAGES`.
2. `schemas/restaurant.ts`: add `<name>InputSchema` (describe each field with
   `.describe()`), a data schema, its `<Name>Data` type, and
   `<name>OutputSchema` with the `{ success, data?, error? }` shape.
3. `constants/errors.ts`: add a `<NAME>_FAILED` message and any specific errors.
   For a short UI label, also add it to `constants/tool-status.ts` and map it in
   `utils/tool-status.ts` (`getToolFailureStatus`).
4. New endpoint? Add the call to `services/*-service.ts` through the existing
   `http-client.ts`, and seed `apps/mock-api/db.json` if the mock API needs data.

Inside `packages/shared`, use relative imports with the `.ts` extension. Keep
it free of React, DOM and environment variables.

## 3. Agent (`apps/agent/src/mastra`)

1. `tools/<kebab-name>-tool.ts`: create the tool with `createTool`:
   - `id: TOOL_IDS.<NAME>` and a `description` written for the model
   - `toModelOutput` via `toRenderedToolModelOutput`, passing only the fields
     the model needs (set `resultIsRendered: false` when there is no card)
   - every return in `execute` uses `satisfies ToolResult<<Name>Data>`
   - wrap the work in try/catch and return `success: false` with an
     `ERROR_MESSAGES` text; never throw to the model
2. `prompts/restaurant-tools.ts`: add the reply instruction to
   `RESTAURANT_TOOL_RESPONSE_PROMPTS`.
3. `agents/restaurant.ts`: import the tool and register it in `tools` under
   `[TOOL_IDS.<NAME>]`.
4. Lookup-only tool (reads data, changes nothing)? Add its ID to
   `FILTERED_TOOL_HISTORY` in `processors/restaurant-tool-history.ts`.
5. If the agent needs to know when to call it, update
   `prompts/restaurant-agent.ts`.

## 4. Web (`apps/web/src`)

If the result is shown in the chat, add a `case TOOL_IDS.<NAME>` to
`components/chat/RestaurantToolCallRenderer.tsx`: `safeParse` with the output
schema, render the component on success, otherwise set `errorMessage` with
`getToolFailureStatus`. Put a new card component under `components/` and
reusable pieces under `components/ui`.

The CopilotKit wildcard renderer already routes every backend tool there, so
no registration is needed elsewhere.

## 5. Verify

Run these from the repository root and fix every error:

```bash
pnpm run typecheck
pnpm run lint
pnpm run test
```

Then tell the user how to try it: `pnpm run dev`, sign in, and send a chat
message that should trigger the tool.
