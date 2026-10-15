import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { LoaderCircle, X, type LucideIcon } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/Button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils/class-name";

type ConfirmActionDialogProps = {
  confirmLabel: string;
  description: string;
  errorMessage: string;
  loadingLabel: string;
  subject?: string;
  title: string;
  disabled?: boolean;
  icon: LucideIcon;
  onConfirm: () => Promise<void>;
  tone?: "default" | "danger";
  tooltip?: string;
  triggerAriaLabel: string;
  triggerClassName?: string;
  triggerSize?: ButtonProps["size"];
  triggerText?: string;
  triggerTextClassName?: string;
  triggerTitle?: string;
};

/** Provides shared confirmation, loading, and error behavior. */
export const ConfirmActionDialog = ({
  confirmLabel,
  description,
  disabled = false,
  errorMessage,
  icon: Icon,
  loadingLabel,
  onConfirm,
  subject,
  title,
  tone = "default",
  tooltip,
  triggerAriaLabel,
  triggerClassName,
  triggerSize = "icon",
  triggerText,
  triggerTextClassName,
  triggerTitle,
}: ConfirmActionDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep the dialog open until the current request finishes.
  const handleOpenChange = (open: boolean) => {
    if (isSubmitting) return;

    setIsOpen(open);
    setError(null);
  };

  // Run the action and close the dialog only when it succeeds.
  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm();
      setIsOpen(false);
    } catch {
      // Keep the dialog open so the user can try again.
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build a consistent trigger from simple text and style options.
  const dialogTrigger = (
    <Dialog.Trigger asChild>
      <Button
        aria-label={triggerAriaLabel}
        className={triggerClassName}
        disabled={disabled}
        size={triggerSize}
        title={triggerTitle}
        variant="ghost"
      >
        <Icon className="size-4" />
        {triggerText && (
          <span className={triggerTextClassName}>{triggerText}</span>
        )}
      </Button>
    </Dialog.Trigger>
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      {/* Add a hover message only when tooltip text is provided. */}
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>{dialogTrigger}</TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={6}>
            {tooltip}
          </TooltipContent>
        </Tooltip>
      ) : (
        dialogTrigger
      )}

      {/* Render the modal above the rest of the page. */}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-background p-6 shadow-2xl outline-none dark:border-white/10">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground",
                // Use red styling for destructive actions.
                tone === "danger" && "bg-red-500/10 text-red-600",
              )}
            >
              <Icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-lg font-bold text-foreground">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">
                {/* Show an optional item name above the description. */}
                {subject && (
                  <span
                    className="block truncate font-medium text-foreground"
                    title={subject}
                  >
                    {subject}
                  </span>
                )}
                <span className={cn("block", subject && "mt-1")}>
                  {description}
                </span>
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button
                aria-label="Close"
                className="-mr-2 -mt-2 text-muted-foreground"
                disabled={isSubmitting}
                size="icon"
                variant="ghost"
              >
                <X className="size-4" />
              </Button>
            </Dialog.Close>
          </div>

          {/* Show the provided safe message when the action fails. */}
          {error && (
            <p
              className="mt-4 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {error}
            </p>
          )}

          {/* Disable both actions while the request is running. */}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Dialog.Close asChild>
              <Button disabled={isSubmitting} variant="ghost">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              className="bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500/30"
              disabled={isSubmitting}
              onClick={handleConfirm}
              variant="ghost"
            >
              {isSubmitting ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Icon className="size-4" />
              )}
              {isSubmitting ? loadingLabel : confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
