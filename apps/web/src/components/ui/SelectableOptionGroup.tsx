import type { MouseEvent } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/class-name";
import type { SelectableOption } from "@/types/selectable-option";

type SelectableOptionGroupProps = {
  options: SelectableOption[];
  value?: string;
  className?: string;
  optionClassName?: string;
  onValueChange?: (value: string) => void;
};

export const SelectableOptionGroup = ({
  options,
  value,
  className,
  optionClassName,
  onValueChange,
}: SelectableOptionGroupProps) => {
  const handleOptionClick = (event: MouseEvent<HTMLButtonElement>) => {
    onValueChange?.(event.currentTarget.value);
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)} role="radiogroup">
      {options.map(
        ({ value: optionValue, label, disabled: isDisabled = false }) => {
          const isSelected = optionValue === value;

          return (
            <Button
              aria-checked={isSelected}
              className={cn(
                "h-10 rounded-lg border px-4 text-sm font-semibold shadow-sm",
                isSelected
                  ? "border-orange-500 bg-orange-500/5 text-orange-500 hover:bg-orange-500/10"
                  : "border-border bg-background text-foreground hover:border-orange-500/40 hover:bg-muted",
                optionClassName,
              )}
              disabled={isDisabled}
              key={optionValue}
              onClick={handleOptionClick}
              role="radio"
              value={optionValue}
              variant="ghost"
            >
              {label}
            </Button>
          );
        },
      )}
    </div>
  );
};
