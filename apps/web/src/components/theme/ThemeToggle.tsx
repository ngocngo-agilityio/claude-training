import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { useTheme } from "@/providers/ThemeProvider";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const nextTheme = isDark ? "light" : "dark";
  const label = `Change to ${nextTheme} mode`;

  const handleThemeToggle = () => {
    setTheme(nextTheme);
  };

  return (
    <div className="flex items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label={label}
            className="rounded-full border bg-background shadow-sm hover:border-orange-500/40 hover:bg-orange-500/5 hover:text-orange-500"
            onClick={handleThemeToggle}
            size="icon"
            variant="ghost"
          >
            {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>
    </div>
  );
};
