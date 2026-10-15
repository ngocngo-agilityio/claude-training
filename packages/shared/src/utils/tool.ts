import type { ToolResult } from "../types/tool.ts";

const TOOL_RESULT_ALREADY_RENDERED_INSTRUCTION =
  "The complete result is already displayed by the frontend tool renderer. Do not repeat or summarize it.";

/**
 * Prepares a tool result for the model.
 *
 * By default, the model is told that the frontend already shows the result, so
 * it does not repeat the same content in chat. Set resultIsRendered to false
 * when the tool has no visible UI result, such as reserve_restaurant.
 */
export const toRenderedToolModelOutput = <TData, TModelData>(
  output: ToolResult<TData>,
  selectModelData: (data: TData) => TModelData,
  responseInstruction: string,
  options: { resultIsRendered?: boolean } = {},
) => {
  if (!output.success || !output.data) {
    return { type: "json" as const, value: output };
  }

  return {
    type: "json" as const,
    value: {
      success: true,
      data: selectModelData(output.data),
      // Add the "already displayed" instruction only when the frontend really
      // renders a card or message for this tool result.
      instruction:
        (options.resultIsRendered ?? true)
          ? `${TOOL_RESULT_ALREADY_RENDERED_INSTRUCTION} ${responseInstruction}`
          : responseInstruction,
    },
  };
};

/** Parses a serialized tool result and preserves non-JSON values unchanged. */
export const parseToolResult = (result: string): unknown => {
  try {
    return JSON.parse(result);
  } catch {
    return result;
  }
};

/** Checks whether a tool result explicitly reports a failure. */
export const didToolFail = (result: unknown) => {
  const parsedResult =
    typeof result === "string" ? parseToolResult(result) : result;

  return (
    typeof parsedResult === "object" &&
    parsedResult !== null &&
    "success" in parsedResult &&
    parsedResult.success === false
  );
};

/** Converts an internal tool identifier into a user-facing label. */
export const formatToolName = (name: string) =>
  name.replace(/^workflow-/, "").replaceAll("_", " ");
