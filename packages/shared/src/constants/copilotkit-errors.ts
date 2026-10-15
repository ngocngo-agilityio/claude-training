/** Friendly message per CopilotKitCoreErrorCode, used by
 * RestaurantCopilotProvider's onError instead of a raw technical error. */
export const COPILOTKIT_ERROR_MESSAGES: Partial<Record<string, string>> = {
  runtime_info_fetch_failed:
    "Couldn't connect to the assistant. Please check your connection and reload.",
  agent_connect_failed:
    "Couldn't start the conversation. Please reload the page.",
  agent_run_failed:
    "Something went wrong while processing your request. Please try again.",
  agent_run_failed_event:
    "Something went wrong while processing your request. Please try again.",
  agent_run_error_event:
    "Something went wrong while processing your request. Please try again.",
  agent_thread_locked:
    "The assistant is still working on your last request. Please wait a moment and try again.",
  tool_argument_parse_failed:
    "The assistant sent an invalid request. Please try again.",
  tool_handler_failed:
    "Something went wrong while completing that action. Please try again.",
};

/** Shown when the error code isn't one of the cases above. */
export const DEFAULT_COPILOTKIT_ERROR_MESSAGE =
  "Something went wrong. Please try again.";
