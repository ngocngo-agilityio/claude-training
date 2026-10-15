import { forwardRef, type ComponentProps } from "react";
import {
  CopilotChatInput,
  type CopilotChatInputProps,
} from "@copilotkit/react-core/v2";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  selectComposerLockReason,
  useComposerLockStore,
} from "@/stores/composer-lock-store";

const DEFAULT_PLACEHOLDER = "Ask anything about restaurants...";
const TEXTAREA_CLASSNAME =
  "!min-h-10 w-full resize-none border-0 bg-transparent px-1 py-2 text-sm leading-6 shadow-none outline-none ring-0 placeholder:text-muted-foreground focus:ring-0";

const SendButton = ({
  className,
  children,
  disabled,
  ...props
}: ComponentProps<typeof CopilotChatInput.SendButton>) => {
  // Block sending while locked and preserve CopilotKit's disabled state.
  const isComposerLocked = useComposerLockStore(
    (state) => selectComposerLockReason(state) !== null,
  );

  return (
    <Button
      {...props}
      className={className}
      disabled={disabled || isComposerLocked}
      size="icon-xl"
      type="button"
      variant="primary"
    >
      {children ?? <Send className="size-5" />}
      <span className="sr-only">Send message</span>
    </Button>
  );
};

// Disable typing; the confirmation card explains why the user must wait.
const ChatTextArea = forwardRef<
  HTMLTextAreaElement,
  ComponentProps<typeof CopilotChatInput.TextArea>
>((props, ref) => {
  const isComposerLocked = useComposerLockStore(
    (state) => selectComposerLockReason(state) !== null,
  );

  return (
    <CopilotChatInput.TextArea
      {...props}
      ref={ref}
      className={TEXTAREA_CLASSNAME}
      disabled={isComposerLocked}
      placeholder={DEFAULT_PLACEHOLDER}
    />
  );
});
ChatTextArea.displayName = "ChatTextArea";

const Disclaimer = () => {
  return (
    <p className="py-2 text-center text-[11px] text-muted-foreground">
      AI can make mistakes. Please verify important details.
    </p>
  );
};

const InputLayout: NonNullable<CopilotChatInputProps["children"]> = ({
  textArea,
  sendButton,
  disclaimer,
}) => (
  <div className="pointer-events-auto mx-auto w-full cpk:px-4 cpk:@3xl:px-0">
    <div className="flex min-h-16 items-center gap-2 rounded-2xl border bg-background px-3 py-2 shadow-sm dark:bg-card">
      <div className="flex min-w-0 flex-1 items-center">{textArea}</div>
      <div className="flex shrink-0 items-center">{sendButton}</div>
    </div>
    {disclaimer}
  </div>
);

export const chatInput = {
  className: "w-full bg-transparent",
  textArea: ChatTextArea,
  sendButton: SendButton,
  disclaimer: Disclaimer,
  children: InputLayout,
};
