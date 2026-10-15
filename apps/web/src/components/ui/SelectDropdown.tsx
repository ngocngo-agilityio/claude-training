import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/class-name";
import type { SelectableOption } from "@/types/selectable-option";

type SelectDropdownProps = {
  options: SelectableOption[];
  value?: string;
  placeholder?: string;
  icon?: ReactNode;
  className?: string;
  onValueChange?: (value: string) => void;
};

export const SelectDropdown = ({
  options,
  value,
  placeholder = "Select an option",
  icon,
  className,
  onValueChange,
}: SelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  // Toggles the dropdown between its open and closed states.
  const handleTriggerClick = () => {
    setIsOpen((currentValue) => !currentValue);
  };

  const handleOptionClick = (event: MouseEvent<HTMLButtonElement>) => {
    onValueChange?.(event.currentTarget.value);
    setIsOpen(false);
  };

  // Allows the dropdown to close with Escape without changing the selection.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Listen for mouse, touch, or pen presses anywhere in the document.
  useEffect(() => {
    const handleOutsideClick = (event: PointerEvent) => {
      // contains() is true for elements inside the dropdown. Negating it makes
      // this condition true only when the pressed element is outside.
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);

    return () =>
      document.removeEventListener("pointerdown", handleOutsideClick);
  }, []);

  return (
    <div
      className={cn("relative w-full", className)}
      onKeyDown={handleKeyDown}
      ref={containerRef}
    >
      {/* The trigger displays the icon, selected label, and dropdown arrow. */}
      <Button
        className="h-12 w-full justify-start rounded-xl border bg-background px-4 text-foreground shadow-sm hover:bg-muted"
        onClick={handleTriggerClick}
        variant="ghost"
      >
        {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
        <span className="min-w-0 flex-1 truncate text-left">
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </Button>

      {/* Mount the options panel only while the dropdown is open. */}
      {isOpen && (
        <div
          className="absolute left-0 top-[calc(100%+4px)] z-50 w-full overflow-hidden rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-lg"
          role="listbox"
        >
          {options.map(
            ({ value: optionValue, label, disabled: isDisabled = false }) => {
              const isSelected = optionValue === value;

              return (
                <Button
                  className={cn(
                    "h-9 w-full justify-start rounded-lg px-3 text-sm font-medium",
                    isSelected
                      ? "text-orange-500 hover:bg-orange-500/10"
                      : "text-foreground hover:bg-muted",
                  )}
                  disabled={isDisabled}
                  key={optionValue}
                  onClick={handleOptionClick}
                  role="option"
                  value={optionValue}
                  variant="ghost"
                >
                  <span className="min-w-0 flex-1 truncate text-left">
                    {label}
                  </span>
                </Button>
              );
            },
          )}
        </div>
      )}
    </div>
  );
};
