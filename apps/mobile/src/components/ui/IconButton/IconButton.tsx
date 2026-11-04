import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type IconButtonProps = {
  /** Read by screen readers; the button has no visible text. */
  label: string;
  onPress: () => void;
  children: ReactNode;
  /** Adds to the square 44px base, for colors and a different radius. */
  style?: StyleProp<ViewStyle>;
};

/** A 44px touch target holding one icon. */
export const IconButton = ({
  children,
  label,
  onPress,
  style,
}: IconButtonProps) => (
  <Pressable
    accessibilityLabel={label}
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [styles.button, style, pressed && styles.pressed]}
  >
    {children}
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
});
