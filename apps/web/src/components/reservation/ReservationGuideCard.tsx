import { Check } from "lucide-react";
import type { ReservationGuideProps } from "@repo/shared/schemas/reservation-guide";

export const ReservationGuideCard = ({
  title = "Restaurant reservation guide",
  description,
  steps = [],
  followUpQuestion,
}: Partial<ReservationGuideProps>) => {
  return (
    <div className="space-y-3">
      <article className="rounded-2xl border bg-card p-5 shadow-sm">
        <h3 className="text-base font-semibold text-card-foreground">
          {title}
        </h3>
        {description && (
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        )}

        <ol className="mt-5 grid gap-3 md:grid-cols-2">
          {steps.map((step, index) => (
            <li
              className="flex items-start gap-3 rounded-xl border bg-background/50 p-4"
              key={`${index}-${step.title}`}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <Check
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-emerald-500"
                  />
                  <h4 className="text-sm font-medium text-card-foreground">
                    {step.title}
                  </h4>
                </div>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </article>

      {followUpQuestion && (
        <p className="w-fit max-w-[92%] rounded-3xl rounded-tl-md border border-orange-200/60 bg-orange-50/70 px-5 py-3 text-sm leading-6 text-foreground shadow-sm dark:border-border/80 dark:bg-card">
          {followUpQuestion}
        </p>
      )}
    </div>
  );
};
