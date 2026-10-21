import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import Animated, {
  FadeInDown,
  useReducedMotion,
} from "react-native-reanimated";
import { login } from "@repo/shared/services/auth-service";
import type { LoginFormValues, LoginResponse } from "@repo/shared/types/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { ChefHatIcon, MicIcon } from "@/components/icons/Icons";
import { THEMES } from "@/constants/theme";
import { useTheme } from "@/providers/ThemeProvider";
import { darkColors, lightColors } from "@/theme/colors";

const LOGO_GRADIENT = "linear-gradient(135deg, #f97316, #e11d48)";
const CONTENT_PADDING_BOTTOM = 40;

/**
 * Sign in colors from the design. Dark mode matches the app theme; light mode
 * uses the design's warm ground, a shade cooler than the splash's #fbf7f3.
 */
const LOGIN_COLORS = {
  [THEMES.LIGHT]: {
    background: "#f7f5f2",
    surface: "#ffffff",
    text: "#1c1917",
    muted: "#57534e",
    subtle: "#78716c",
    border: "#e7e5e4",
    brand: "#c2410c",
    destructive: lightColors.destructive,
  },
  [THEMES.DARK]: {
    background: darkColors.background,
    surface: darkColors.card,
    text: darkColors.foreground,
    muted: darkColors.mutedForeground,
    subtle: "#8793a3",
    border: darkColors.border,
    brand: darkColors.brand,
    destructive: darkColors.destructive,
  },
};

/** Space kept between the submit button and the top of the keyboard. */
const KEYBOARD_GAP = 16;

type LoginScreenProps = {
  onLoginSuccess: (data: LoginResponse) => void;
};

/**
 * Keeps the whole form, submit button included, above the keyboard on both
 * platforms. The keyboard height is added as bottom padding so the screen can
 * scroll even when the window does not resize (Android edge-to-edge), and the
 * form is scrolled back into view whenever it or the content changes size,
 * for example when an error message appears while the keyboard is open.
 */
const useKeepFormAboveKeyboard = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  // Bottom edge of the form, in scroll content coordinates.
  const formBottomRef = useRef(0);
  const scrollYRef = useRef(0);
  // Top edge of the keyboard on screen, or null while it is hidden.
  const keyboardTopRef = useRef<number | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollFormIntoView = () => {
    if (keyboardTopRef.current === null) return;

    // The screen starts at the top of the window, so the keyboard's top edge
    // is also the height of the area left visible above it.
    const offset =
      formBottomRef.current + KEYBOARD_GAP - keyboardTopRef.current;

    if (offset > scrollYRef.current) {
      scrollViewRef.current?.scrollTo({ y: offset });
    }
  };

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      "keyboardDidShow",
      (event) => {
        keyboardTopRef.current = event.endCoordinates.screenY;
        setKeyboardHeight(event.endCoordinates.height);
        scrollFormIntoView();
      },
    );
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      keyboardTopRef.current = null;
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const onFormLayout = (event: LayoutChangeEvent) => {
    const { height, y } = event.nativeEvent.layout;
    formBottomRef.current = y + height;
    scrollFormIntoView();
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollYRef.current = event.nativeEvent.contentOffset.y;
  };

  return {
    keyboardHeight,
    onContentSizeChange: scrollFormIntoView,
    onFormLayout,
    onScroll,
    scrollViewRef,
  };
};

/** Sign in screen: brand header, email and password form, voice teaser. */
export const LoginScreen = ({ onLoginSuccess }: LoginScreenProps) => {
  const { theme } = useTheme();
  const colors = LOGIN_COLORS[theme];
  const isReducedMotion = useReducedMotion();
  const [formError, setFormError] = useState("");
  const {
    keyboardHeight,
    onContentSizeChange,
    onFormLayout,
    onScroll,
    scrollViewRef,
  } = useKeepFormAboveKeyboard();

  const handleSubmit = async (values: LoginFormValues) => {
    setFormError("");
    const result = await login(values);

    if (result.success) {
      onLoginSuccess(result.data);
    } else {
      setFormError(result.error);
    }
  };

  const enter = (delay: number) =>
    isReducedMotion ? undefined : FadeInDown.delay(delay).springify();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingBottom: CONTENT_PADDING_BOTTOM + keyboardHeight },
      ]}
      keyboardShouldPersistTaps="handled"
      onContentSizeChange={onContentSizeChange}
      onScroll={onScroll}
      ref={scrollViewRef}
      scrollEventThrottle={16}
      style={[styles.root, { backgroundColor: colors.background }]}
    >
      <Animated.View entering={enter(0)} style={styles.header}>
        <View style={styles.logo}>
          <ChefHatIcon color="#ffffff" size={28} />
        </View>
        <View style={styles.headings}>
          <Text
            accessibilityRole="header"
            style={[styles.title, { color: colors.text }]}
          >
            Welcome back
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Sign in to keep planning your next meal with RestoAI.
          </Text>
        </View>
      </Animated.View>

      <Animated.View entering={enter(120)} onLayout={onFormLayout}>
        <LoginForm
          colors={colors}
          formError={formError}
          onChange={() => setFormError("")}
          onSubmit={handleSubmit}
        />
      </Animated.View>

      <Animated.View
        entering={enter(240)}
        style={[
          styles.banner,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <MicIcon color={colors.brand} />
        <Text style={[styles.bannerText, { color: colors.muted }]}>
          New: talk to RestoAI with your voice after you sign in.
        </Text>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: 32,
    paddingTop: 96,
    paddingHorizontal: 24,
  },
  header: {
    gap: 20,
  },
  logo: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    experimental_backgroundImage: LOGO_GRADIENT,
  },
  headings: {
    gap: 8,
  },
  title: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 16,
    lineHeight: 24,
  },
  banner: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 16,
  },
  bannerText: {
    flex: 1,
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
});
