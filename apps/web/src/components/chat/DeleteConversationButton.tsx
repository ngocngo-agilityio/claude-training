import { Trash2 } from "lucide-react";
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";
import { ERROR_MESSAGES } from "@repo/shared/constants/errors";

type DeleteConversationButtonProps = {
  conversationTitle: string;
  onDelete: () => Promise<void>;
};

/** Configures the shared dialog for deleting one conversation. */
export const DeleteConversationButton = ({
  conversationTitle,
  onDelete,
}: DeleteConversationButtonProps) => (
  <ConfirmActionDialog
    confirmLabel="Delete"
    description="This conversation and all its messages will be permanently deleted. This action cannot be undone."
    errorMessage={ERROR_MESSAGES.DELETE_CONVERSATION_FAILED}
    icon={Trash2}
    loadingLabel="Deleting..."
    onConfirm={onDelete}
    subject={conversationTitle}
    title="Delete conversation?"
    tone="danger"
    triggerAriaLabel={`Delete ${conversationTitle}`}
    triggerClassName="pointer-events-none h-8 w-0 shrink-0 overflow-hidden p-0 text-slate-400 opacity-0 transition-[width,opacity,color,background-color] group-hover/conversation:pointer-events-auto group-hover/conversation:w-8 group-hover/conversation:opacity-100 focus-visible:pointer-events-auto focus-visible:w-8 focus-visible:opacity-100 hover:bg-red-500/10 hover:text-red-600"
    triggerTitle="Delete conversation"
  />
);
