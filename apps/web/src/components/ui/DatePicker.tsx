import { useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/class-name";

type DatePickerProps = {
  value?: Date;
  className?: string;
  isDateDisabled?: (date: Date) => boolean;
  onValueChange?: (date: Date) => void;
};

export const DatePicker = ({
  value,
  className,
  isDateDisabled,
  onValueChange,
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleTriggerClick = () => {
    setIsOpen((currentValue) => !currentValue);
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    onValueChange?.(selectedDate);
    setIsOpen(false);
  };

  const selectedDateLabel = value
    ? value.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Select a date";

  return (
    <div className={cn("relative w-full", className)}>
      <Button
        className="h-12 w-full justify-start rounded-xl border bg-background px-4 text-foreground shadow-sm hover:bg-muted"
        onClick={handleTriggerClick}
        type="button"
        variant="ghost"
      >
        <CalendarDays className="size-5 text-muted-foreground" />
        <span className="flex-1 text-left">{selectedDateLabel}</span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </Button>

      {/* Only render the calendar while the popup is open. */}
      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 rounded-xl border bg-popover p-4 shadow-lg">
          <DayPicker
            classNames={{
              caption_label: "text-sm font-semibold",
              day_button:
                "rounded-full text-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
              selected:
                "[&>button]:bg-orange-500 [&>button]:text-white [&>button]:hover:bg-orange-600",
              weekday: "text-xs font-normal text-muted-foreground",
            }}
            className="[--rdp-accent-color:var(--color-orange-500)] [--rdp-day-height:36px] [--rdp-day-width:36px] [--rdp-day_button-height:36px] [--rdp-day_button-width:36px]"
            defaultMonth={value}
            disabled={isDateDisabled}
            mode="single"
            onSelect={handleDateSelect}
            selected={value}
          />
        </div>
      )}
    </div>
  );
};
