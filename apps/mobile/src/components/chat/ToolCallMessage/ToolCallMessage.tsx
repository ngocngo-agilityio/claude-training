import { TOOL_IDS, TOOL_LOADING_MESSAGES } from "@repo/shared/constants/tools";
import { AgentSearchingMessage } from "@/components/chat/AgentSearchingMessage/AgentSearchingMessage";
import { RecommendationResult } from "@/components/chat/RecommendationResult/RecommendationResult";
import { SearchingChip } from "@/components/chat/SearchingChip/SearchingChip";

type ToolCallMessageProps = {
  /** Tool name the agent called, such as recommend_restaurants. */
  name: string;
  /** Serialized result. Undefined until the tool has finished. */
  result?: string;
  /** True while the agent is still running this turn. */
  isRunning: boolean;
  onViewDetails?: (restaurantId: string) => void;
};

/**
 * A tool call in the chat. While it runs it shows progress; once it finishes
 * the restaurant tool shows its results and other tools show nothing.
 */
export const ToolCallMessage = ({
  name,
  result,
  isRunning,
  onViewDetails,
}: ToolCallMessageProps) => {
  const loadingLabel =
    TOOL_LOADING_MESSAGES[name] ?? "Working on your request...";

  if (name === TOOL_IDS.RECOMMEND_RESTAURANTS) {
    if (result !== undefined) {
      return (
        <RecommendationResult onViewDetails={onViewDetails} result={result} />
      );
    }

    return isRunning ? (
      <AgentSearchingMessage searchingLabel="Searching restaurants…" />
    ) : null;
  }

  return result === undefined && isRunning ? (
    <SearchingChip label={loadingLabel} />
  ) : null;
};
