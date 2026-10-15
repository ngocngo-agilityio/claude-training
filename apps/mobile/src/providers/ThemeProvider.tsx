import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import { STORAGE_KEYS } from "@/constants/storage";
import { THEMES } from "@/constants/theme";
import { darkColors, lightColors } from "@/theme/colors";
import type { Theme, ThemeProviderState } from "@/types/theme";

type ThemeProviderProps = {
  children: ReactNode;
};

const initialState: ThemeProviderState = {
  theme: THEMES.LIGHT,
  colors: lightColors,
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export const useTheme = () => {
  return useContext(ThemeProviderContext);
};

const isTheme = (value: string | null): value is Theme =>
  value === THEMES.DARK || value === THEMES.LIGHT;

/**
 * Provides the active theme and its colors. The theme follows the device
 * setting until the user picks one; that choice is saved on the device.
 */
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const systemTheme: Theme =
    useColorScheme() === THEMES.DARK ? THEMES.DARK : THEMES.LIGHT;
  const [savedTheme, setSavedTheme] = useState<Theme | null>(null);

  // Restore the theme the user picked in an earlier session.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.THEME)
      .then((value) => {
        if (isTheme(value)) setSavedTheme(value);
      })
      // Storage can fail on a fresh install; keep following the device theme.
      .catch(() => undefined);
  }, []);

  const theme = savedTheme ?? systemTheme;

  const value = useMemo(
    () => ({
      theme,
      colors: theme === THEMES.DARK ? darkColors : lightColors,
      setTheme: (nextTheme: Theme) => {
        setSavedTheme(nextTheme);
        // The theme still applies for this session if saving fails.
        AsyncStorage.setItem(STORAGE_KEYS.THEME, nextTheme).catch(
          () => undefined,
        );
      },
    }),
    [theme],
  );

  return <ThemeProviderContext value={value}>{children}</ThemeProviderContext>;
};
