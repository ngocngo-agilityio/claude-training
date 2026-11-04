import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { SplashScreen } from "@/components/SplashScreen/SplashScreen";
import { THEMES } from "@/constants/theme";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";

/** The screens, split by sign-in state. Only one group is shown at a time. */
const AppNavigator = () => {
  const { accessToken } = useAuth();
  const isSignedIn = accessToken !== null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="index" />
      </Stack.Protected>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
};

/** The app screen, with the splash drawn over it until it fades away. */
export const AppShell = () => {
  const { theme } = useTheme();
  const { isLoading } = useAuth();
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const handleSplashFinish = useCallback(() => setIsSplashVisible(false), []);

  return (
    <>
      {/* Wait for the saved token: otherwise the login screen flashes first. */}
      {!isLoading && <AppNavigator />}
      {isSplashVisible && <SplashScreen onFinish={handleSplashFinish} />}
      <StatusBar style={theme === THEMES.DARK ? "light" : "dark"} />
    </>
  );
};
