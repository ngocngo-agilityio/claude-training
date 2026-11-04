import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { THEMES } from "@/constants/theme";
import { useTheme } from "@/providers/ThemeProvider";
import { fontFamily, fontSize } from "@/theme/typography";

/** Glow under the primary button; a decorative effect, not a theme token. */
const BUTTON_SHADOW = "0px 10px 24px rgba(225, 29, 72, 0.25)";

type GradientButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  /** Shows a spinner next to the title and blocks presses. */
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Full-width button on the brand gradient, used for primary actions. */
export const GradientButton = ({
  disabled = false,
  loading = false,
  onPress,
  style,
  title,
}: GradientButtonProps) => {
  const { colors, theme } = useTheme();
  const isDisabled = disabled || loading;
  // A faded gradient turns muddy on the dark ground, so dark mode draws the
  // disabled button as a flat surface with readable text instead. While
  // loading, the button keeps its gradient in both themes to read as busy.
  const isDarkDisabled = disabled && !loading && theme === THEMES.DARK;
  const titleColor = isDarkDisabled
    ? colors.mutedForeground
    : colors.brandForeground;
  const [gradientStart, gradientEnd] = colors.brandGradient;
  const gradient = `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { experimental_backgroundImage: gradient },
        isDarkDisabled
          ? [
              styles.darkDisabled,
              {
                backgroundColor: colors.secondary,
                borderColor: colors.border,
              },
            ]
          : loading
            ? styles.loading
            : isDisabled
              ? styles.disabled
              : null,
        pressed ? styles.pressed : null,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={titleColor} size="small" /> : null}
      <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    boxShadow: BUTTON_SHADOW,
  },
  disabled: {
    opacity: 0.5,
    boxShadow: "none",
  },
  loading: {
    opacity: 0.8,
  },
  darkDisabled: {
    experimental_backgroundImage: "none",
    borderWidth: 1,
    boxShadow: "none",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
  },
});
