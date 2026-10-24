import * as NativeSplash from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { THEMES } from "@/constants/theme";
import { useTheme } from "@/providers/ThemeProvider";
import { darkColors, lightColors } from "@/theme/colors";
import splashIcon from "../../assets/splash-icon.png";

/** How long the splash stays up before it hands over to the app. */
const SPLASH_MIN_DURATION_MS = 1500;

const LOGO_SIZE = 96;
// The rounded square fills 87.5% of splash-icon.png; the rest is padding.
const LOGO_IMAGE_SIZE = Math.round(LOGO_SIZE / 0.875);
const GLOW_SIZE = 300;
const LOGO_GAP = 20;
const TITLE_LINE_HEIGHT = 38;
const TITLE_GAP = 6;
const TAGLINE_LINE_HEIGHT = 22;
// The native splash draws the logo at the screen center. The logo starts
// there and moves up to its place above the text, so the handover is seamless.
const LOGO_START_OFFSET =
  (LOGO_GAP + TITLE_LINE_HEIGHT + TITLE_GAP + TAGLINE_LINE_HEIGHT) / 2;
const DOT_DELAYS_MS = [0, 200, 400];

/**
 * Splash colors from the design. Dark mode matches the app theme; light mode
 * uses a warmer ground than the app's white background.
 */
const SPLASH_COLORS = {
  [THEMES.LIGHT]: {
    background: "#fbf7f3",
    foreground: "#1c1917",
    mutedForeground: "#57534e",
    brand: lightColors.brand,
    glow: "rgba(249, 115, 22, 0.20)",
  },
  [THEMES.DARK]: {
    background: darkColors.background,
    foreground: darkColors.foreground,
    mutedForeground: darkColors.mutedForeground,
    brand: darkColors.brand,
    glow: "rgba(255, 124, 37, 0.28)",
  },
};

type SplashScreenProps = {
  /** Called once the exit animation ends and the splash can unmount. */
  onFinish: () => void;
};

type UseSplashAnimationOptions = {
  isStarted: boolean;
  onFinish: () => void;
};

type LoadingDotProps = {
  /** Fill color; the theme's brand color. */
  color: string;
  delay: number;
};

/**
 * Runs the splash animations: the logo settles into place and the glow
 * breathes, then after SPLASH_MIN_DURATION_MS the logo zooms out of view while
 * the splash fades away. With reduce motion on, only the fades remain.
 */
const useSplashAnimation = ({
  isStarted,
  onFinish,
}: UseSplashAnimationOptions) => {
  const isReducedMotion = useReducedMotion();
  const logoOffset = useSharedValue(isReducedMotion ? 0 : LOGO_START_OFFSET);
  const logoScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(isReducedMotion ? 1 : 0.8);
  const contentOpacity = useSharedValue(1);
  const splashOpacity = useSharedValue(1);

  useEffect(() => {
    if (!isStarted) return;

    glowOpacity.set(withTiming(1, { duration: 600 }));

    if (!isReducedMotion) {
      logoOffset.set(withSpring(0, { damping: 16, stiffness: 140 }));
      logoScale.set(
        withSequence(
          withTiming(1.06, { duration: 200, easing: Easing.out(Easing.quad) }),
          withSpring(1, { damping: 10, stiffness: 160 }),
        ),
      );
      glowScale.set(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }),
          withRepeat(
            withTiming(1.08, {
              duration: 1200,
              easing: Easing.inOut(Easing.sin),
            }),
            -1,
            true,
          ),
        ),
      );
    }

    const exitTimer = setTimeout(() => {
      contentOpacity.set(withTiming(0, { duration: 150 }));

      if (!isReducedMotion) {
        logoScale.set(
          withTiming(8, { duration: 450, easing: Easing.in(Easing.cubic) }),
        );
      }

      splashOpacity.set(
        withDelay(
          100,
          withTiming(0, { duration: 350 }, (isFinished) => {
            if (isFinished) scheduleOnRN(onFinish);
          }),
        ),
      );
    }, SPLASH_MIN_DURATION_MS);

    return () => clearTimeout(exitTimer);
  }, [
    contentOpacity,
    glowOpacity,
    glowScale,
    isReducedMotion,
    isStarted,
    logoOffset,
    logoScale,
    onFinish,
    splashOpacity,
  ]);

  const splashStyle = useAnimatedStyle(() => ({
    opacity: splashOpacity.get(),
  }));
  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: logoOffset.get() }, { scale: logoScale.get() }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.get(),
    transform: [{ scale: glowScale.get() }],
  }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.get(),
  }));

  return { contentStyle, glowStyle, logoStyle, splashStyle };
};

/** One of the three loading dots; it pulses in a loop after `delay`. */
const LoadingDot = ({ color, delay }: LoadingDotProps) => {
  const opacity = useSharedValue(0.25);

  useEffect(() => {
    opacity.set(
      withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 600 }),
            withTiming(0.25, { duration: 600 }),
          ),
          -1,
        ),
      ),
    );
  }, [delay, opacity]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: opacity.get() }));

  return (
    <Animated.View style={[styles.dot, { backgroundColor: color }, dotStyle]} />
  );
};

/**
 * Branded splash drawn over the app on launch. It takes over from the native
 * splash, which shows the same logo on the same background.
 */
export const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const { theme } = useTheme();
  const colors = SPLASH_COLORS[theme];
  const [isLaidOut, setIsLaidOut] = useState(false);
  const { contentStyle, glowStyle, logoStyle, splashStyle } =
    useSplashAnimation({ isStarted: isLaidOut, onFinish });

  // Hide the native splash only once this one is drawn, so nothing flashes.
  useEffect(() => {
    if (isLaidOut) NativeSplash.hideAsync().catch(() => undefined);
  }, [isLaidOut]);

  return (
    <Animated.View
      onLayout={() => setIsLaidOut(true)}
      style={[
        styles.splash,
        { backgroundColor: colors.background },
        splashStyle,
      ]}
    >
      <Animated.View style={[styles.logo, logoStyle]}>
        <Animated.View
          style={[
            styles.glow,
            {
              experimental_backgroundImage: `radial-gradient(circle, ${colors.glow} 0%, rgba(225, 29, 72, 0.08) 45%, transparent 70%)`,
            },
            glowStyle,
          ]}
        />
        <View style={styles.logoShadow} />
        <Image
          accessibilityIgnoresInvertColors
          accessible={false}
          source={splashIcon}
          style={styles.logoImage}
        />
      </Animated.View>

      <Animated.View style={[styles.text, contentStyle]}>
        <Animated.Text
          entering={FadeInDown.delay(150).springify()}
          style={[styles.title, { color: colors.foreground }]}
        >
          RestoAI
        </Animated.Text>
        <Animated.View entering={FadeInDown.delay(270).springify()}>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            Find, book and enjoy – just ask.
          </Text>
        </Animated.View>
      </Animated.View>

      <Animated.View
        accessibilityLabel="Loading"
        accessibilityRole="progressbar"
        entering={FadeIn.delay(500)}
        style={[styles.dots, contentStyle]}
      >
        {DOT_DELAYS_MS.map((delay) => (
          <LoadingDot color={colors.brand} delay={delay} key={delay} />
        ))}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    gap: LOGO_GAP,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    borderRadius: GLOW_SIZE / 2,
  },
  logoShadow: {
    ...StyleSheet.absoluteFill,
    borderRadius: 28,
    boxShadow: "0px 20px 40px rgba(225, 29, 72, 0.30)",
  },
  logoImage: {
    position: "absolute",
    width: LOGO_IMAGE_SIZE,
    height: LOGO_IMAGE_SIZE,
  },
  text: {
    alignItems: "center",
    gap: TITLE_GAP,
  },
  title: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 32,
    lineHeight: TITLE_LINE_HEIGHT,
    letterSpacing: -0.64,
  },
  tagline: {
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 15,
    lineHeight: TAGLINE_LINE_HEIGHT,
  },
  dots: {
    position: "absolute",
    bottom: 72,
    flexDirection: "row",
    gap: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
