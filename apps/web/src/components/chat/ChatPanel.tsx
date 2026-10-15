import type { ComponentProps, CSSProperties } from "react";
import { CopilotChat } from "@copilotkit/react-core/v2";
import { cn } from "@/lib/utils/class-name";
import { chatInput } from "@/components/chat/ChatInput";
import { chatMessageView } from "@/components/chat/ChatMessage";

type ChatLayoutRenderer = NonNullable<
  ComponentProps<typeof CopilotChat>["children"]
>;

type CopilotChatPanelProps = Omit<
  ComponentProps<typeof CopilotChat>,
  "children"
> & {
  containerClassName?: string;
  containerStyle?: CSSProperties;
};

const defaultChatView: ComponentProps<typeof CopilotChat>["chatView"] = {
  // Show the welcome screen when the selected conversation has no messages.
  hasExplicitThreadId: false,
};

/** Keeps messages scrollable and prevents the input from covering them. */
const renderChatLayout: ChatLayoutRenderer = ({ input, scrollView }) => (
  <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl">
    <div className="min-h-0 flex-1 overflow-hidden">{scrollView}</div>
    <div className="relative z-20 shrink-0 pt-2">{input}</div>
  </div>
);

/**
 * The single embedded-chat shell used by CopilotKit examples.
 */
export const CopilotChatPanel = ({
  className,
  containerClassName,
  containerStyle,
  input = chatInput,
  messageView = chatMessageView,
  chatView = defaultChatView,
  ...props
}: CopilotChatPanelProps) => {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full overflow-hidden",
        containerClassName,
      )}
      style={containerStyle}
    >
      <CopilotChat
        {...props}
        chatView={chatView}
        input={input}
        messageView={messageView}
        className={cn(
          "h-full min-h-0 w-full overflow-hidden rounded-2xl",
          className,
        )}
      >
        {renderChatLayout}
      </CopilotChat>
    </div>
  );
};
