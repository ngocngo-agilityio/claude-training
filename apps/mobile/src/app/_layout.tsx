import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import * as NativeSplash from "expo-splash-screen";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { configureApi } from "@repo/shared/config/api";
import { AppShell } from "@/components/AppShell";
import { MASTRA_BASE_URL, RESTAURANTS_API_DOMAIN } from "@/constants/api";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

// Keep the native splash up until the in-app splash is drawn over it.
NativeSplash.preventAutoHideAsync().catch(() => undefined);

// Without these, requests go to relative URLs and only fail with a generic
// error, so point the developer at the missing config.
if (__DEV__ && (!MASTRA_BASE_URL || !RESTAURANTS_API_DOMAIN)) {
  console.warn(
    "EXPO_PUBLIC_MASTRA_BASE_URL or EXPO_PUBLIC_RESTAURANTS_API_DOMAIN is missing, see .env.example",
  );
}

// Shared services read their endpoints from this config instead of Expo's env.
configureApi({
  mastraBaseUrl: MASTRA_BASE_URL,
  restaurantsApiDomain: RESTAURANTS_API_DOMAIN,
});

export default function RootLayout() {
  const [areFontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  // The native splash stays up while the fonts load.
  if (!areFontsLoaded && !fontError) return null;

  return (
    // The prebuilt CopilotKit chat components need the gesture handler root.
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
