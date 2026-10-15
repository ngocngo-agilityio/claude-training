import { RotateCcw } from "lucide-react";
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";
import { ERROR_MESSAGES } from "@repo/shared/constants/errors";

type ResetConversationButtonProps = {
  disabled?: boolean;
  onReset: () => Promise<void>;
};

/** Configures the shared dialog for resetting the current conversation. */
export const ResetConversationButton = ({
  disabled = false,
  onReset,
}: ResetConversationButtonProps) => (
  <ConfirmActionDialog
    confirmLabel="Reset conversation"
    description="All messages in this thread will be permanently removed. The thread itself will remain available for future conversations."
    disabled={disabled}
    errorMessage={ERROR_MESSAGES.RESET_CONVERSATION_FAILED}
    icon={RotateCcw}
    loadingLabel="Resetting..."
    onConfirm={onReset}
    title="Reset this conversation?"
    tooltip="Reset conversation"
    triggerAriaLabel="Reset conversation"
    triggerClassName="h-9 rounded-full border border-border/70 bg-background px-2.5 text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground md:px-3"
    triggerSize="sm"
    triggerText="Reset"
    triggerTextClassName="hidden md:inline"
  />
);
