import type { ReactNode } from "react";
import {
  AlertCircle,
  Ban,
  Check,
  LoaderCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/class-name";

type ToolStatusVariant = "loading" | "completed" | "failed" | "cancelled";

type ToolStatusProps = {
  variant: ToolStatusVariant;
  message: ReactNode;
  children?: ReactNode;
};

const VARIANT_STYLES: Record<
  ToolStatusVariant,
  {
    icon: LucideIcon;
    pillClassName: string;
    iconClassName: string;
    role: "status" | "alert";
  }
> = {
  loading: {
    icon: LoaderCircle,
    pillClassName: "max-w-[92%] border bg-card text-muted-foreground",
    iconClassName: "animate-spin text-primary",
    role: "status",
  },
  completed: {
    icon: Check,
    pillClassName: "border bg-card text-muted-foreground",
    iconClassName: "text-emerald-500",
    role: "status",
  },
  failed: {
    icon: AlertCircle,
    pillClassName: "max-w-[92%] border bg-card text-muted-foreground",
    iconClassName: "text-amber-500 dark:text-amber-400",
    role: "alert",
  },
  cancelled: {
    icon: Ban,
    pillClassName: "max-w-[92%] border bg-card text-muted-foreground",
    iconClassName: "text-muted-foreground",
    role: "status",
  },
};

/** Shared tool status indicator, including neutral cancellation feedback. */
export const ToolStatus = ({ variant, message, children }: ToolStatusProps) => {
  const {
    icon: Icon,
    pillClassName,
    iconClassName,
    role,
  } = VARIANT_STYLES[variant];

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div
        className={cn(
          "inline-flex min-h-10 w-fit items-center gap-2 rounded-full px-3.5 py-2 text-sm shadow-sm",
          pillClassName,
        )}
        role={role}
        aria-live={role === "status" ? "polite" : undefined}
      >
        <Icon
          aria-hidden="true"
          className={cn("size-4 shrink-0", iconClassName)}
        />
        <span>{message}</span>
      </div>
      {children}
    </div>
  );
};
