import { AlertCircle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

type CopilotErrorAlertProps = {
  message: string;
  onDismiss: () => void;
};

/** Displays a recoverable CopilotKit error. */
export const CopilotErrorAlert = ({
  message,
  onDismiss,
}: CopilotErrorAlertProps) => {
  return (
    <div
      className="fixed inset-x-4 bottom-24 z-50 rounded-2xl border border-red-500/20 bg-card p-4 text-sm shadow-2xl sm:left-auto sm:right-6 sm:w-96"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
          <AlertCircle aria-hidden="true" className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">Connection issue</p>
          <p className="mt-1 leading-5 text-muted-foreground">{message}</p>
          <Button
            className="mt-2 h-8 gap-1.5 px-2.5 text-xs"
            onClick={() => window.location.reload()}
            size="sm"
            variant="outline"
          >
            <RefreshCw className="size-3.5" />
            Retry
          </Button>
        </div>

        <button
          aria-label="Dismiss"
          className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={onDismiss}
          type="button"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
};
