import { useAgentContext, useFrontendTool } from "@copilotkit/react-core/v2";
import { TOOL_IDS } from "@repo/shared/constants/tools";
import { changeThemeInputSchema } from "@repo/shared/schemas/theme";
import { useTheme } from "@/providers/ThemeProvider";

/**
 * Sends the current theme to the agent and registers change_theme so the agent
 * can switch the application between light and dark mode.
 */
export const useThemeTool = () => {
  // Read the current theme and the function used to change it.
  const { theme, setTheme } = useTheme();

  // Tell the agent whether the current theme is light or dark.
  useAgentContext({
    description: "The application's current color theme.",
    value: { theme },
  });

  // Register the frontend tool that changes the theme.
  useFrontendTool(
    {
      name: TOOL_IDS.CHANGE_THEME,
      description:
        "Change the application's color theme. Use this when the user asks to switch to light mode or dark mode.",
      parameters: changeThemeInputSchema,
      handler: async ({ theme: nextTheme }) => {
        // Update ThemeProvider after the input passes schema validation.
        setTheme(nextTheme);
        return `Application theme changed to ${nextTheme} mode.`;
      },
    },
    [setTheme],
  );
};
