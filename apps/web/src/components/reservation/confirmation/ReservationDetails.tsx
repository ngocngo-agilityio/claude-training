import { CalendarDays, Clock3, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils/class-name";

type ReservationDetailsProps = {
  date: string;
  guests: number;
  time: string;
  variant?: "review" | "success";
};

export const ReservationDetails = ({
  date,
  guests,
  time,
  variant = "review",
}: ReservationDetailsProps) => {
  const isSuccess = variant === "success";
  const iconClassName = isSuccess ? "text-emerald-600" : "text-orange-500";

  return (
    <dl
      className={cn(
        "grid gap-3 rounded-xl p-4 sm:grid-cols-3",
        isSuccess ? "border bg-muted/35" : "bg-muted/50",
      )}
    >
      <div className="grid min-w-0 grid-cols-[1.25rem_minmax(0,1fr)] items-start gap-x-3">
        <CalendarDays className={cn("size-5 shrink-0", iconClassName)} />
        <div className="min-w-0">
          <dt className="text-xs leading-5 text-muted-foreground">Date</dt>
          <dd className="truncate text-sm font-semibold leading-5 tabular-nums">
            {date}
          </dd>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-[1.25rem_minmax(0,1fr)] items-start gap-x-3">
        <UsersRound className={cn("size-5 shrink-0", iconClassName)} />
        <div className="min-w-0">
          <dt className="text-xs leading-5 text-muted-foreground">Guests</dt>
          <dd className="truncate text-sm font-semibold leading-5 tabular-nums">
            {guests}
          </dd>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-[1.25rem_minmax(0,1fr)] items-start gap-x-3">
        <Clock3 className={cn("size-5 shrink-0", iconClassName)} />
        <div className="min-w-0">
          <dt className="text-xs leading-5 text-muted-foreground">Time</dt>
          <dd className="truncate text-sm font-semibold leading-5 tabular-nums">
            {time}
          </dd>
        </div>
      </div>
    </dl>
  );
};
