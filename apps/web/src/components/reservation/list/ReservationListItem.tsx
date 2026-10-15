import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Hash,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { ReservationListItemData } from "@repo/shared/schemas/restaurant";

type ReservationListItemProps = ReservationListItemData;

export const ReservationListItem = ({
  id,
  restaurant,
  status,
  date,
  time,
  guests,
}: ReservationListItemProps) => {
  return (
    <li className="group relative overflow-hidden rounded-2xl border bg-card p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md dark:border-white/10 dark:bg-white/[0.025] dark:hover:border-orange-400/35 dark:hover:bg-white/[0.04] dark:hover:shadow-black/20">
      <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-orange-400 to-rose-400" />

      <div className="flex flex-wrap items-start justify-between gap-3 pl-1">
        <div className="min-w-0">
          <h4 className="truncate text-base font-bold text-foreground">
            {restaurant}
          </h4>
          <p className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            <Hash className="size-3" />
            {id}
          </p>
        </div>
        <Badge className="border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700 shadow-none hover:bg-emerald-50 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-300 dark:hover:bg-emerald-400/10">
          <CheckCircle2 className="size-3.5" />
          {status}
        </Badge>
      </div>

      <dl className="mt-4 grid gap-2 rounded-xl bg-muted/35 p-3 text-sm sm:grid-cols-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500 dark:bg-orange-400/10 dark:text-orange-300">
            <CalendarDays className="size-4" />
          </span>
          <div>
            <dt className="text-xs text-muted-foreground">Date</dt>
            <dd className="font-semibold">{date}</dd>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300">
            <Clock3 className="size-4" />
          </span>
          <div>
            <dt className="text-xs text-muted-foreground">Time</dt>
            <dd className="font-semibold">{time}</dd>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500 dark:bg-rose-400/10 dark:text-rose-300">
            <UsersRound className="size-4" />
          </span>
          <div>
            <dt className="text-xs text-muted-foreground">Guests</dt>
            <dd className="font-semibold">{guests}</dd>
          </div>
        </div>
      </dl>
    </li>
  );
};
