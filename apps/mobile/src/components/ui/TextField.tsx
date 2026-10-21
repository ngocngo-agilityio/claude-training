import { useState, type ReactNode, type Ref } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

/** Focus colors from the design, the same in both themes. */
const FOCUS_BORDER_COLOR = "#f97316";
const FOCUS_RING = "0px 0px 0px 4px rgba(249, 115, 22, 0.14)";
/** Room for one line of error text between this field and the next. */
const ERROR_SLOT_HEIGHT = 26;

export type TextFieldColors = {
  surface: string;
  text: string;
  subtle: string;
  border: string;
  destructive: string;
};

export type TextFieldProps = TextInputProps & {
  label: string;
  colors: TextFieldColors;
  /** Icon drawn before the input. */
  icon?: ReactNode;
  /** Control drawn after the input, such as a show password button. */
  accessory?: ReactNode;
  /** Validation message; also turns the border red. */
  error?: string;
  ref?: Ref<TextInput>;
};

/**
 * Labeled text input with a leading icon, focus ring and error message. The
 * error line keeps its space even when empty, so showing or clearing an error
 * does not push the fields and buttons below it.
 */
export const TextField = ({
  accessory,
  colors,
  error,
  icon,
  label,
  onBlur,
  onFocus,
  ref,
  ...inputProps
}: TextFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? colors.destructive
    : isFocused
      ? FOCUS_BORDER_COLOR
      : colors.border;

  return (
    <View>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View
        style={[
          styles.box,
          accessory ? styles.boxWithAccessory : null,
          {
            backgroundColor: colors.surface,
            borderColor,
            borderWidth: isFocused || error ? 1.5 : 1,
          },
          isFocused && !error ? styles.focusRing : null,
        ]}
      >
        {icon}
        <TextInput
          {...inputProps}
          accessibilityLabel={label}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          placeholderTextColor={colors.subtle}
          ref={ref}
          style={[styles.input, { color: colors.text }]}
        />
        {accessory}
      </View>
      <View style={styles.errorSlot}>
        {error ? (
          <Text
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
            numberOfLines={1}
            style={[styles.error, { color: colors.destructive }]}
          >
            {error}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    marginBottom: 8,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 14,
    lineHeight: 20,
  },
  box: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  boxWithAccessory: {
    paddingRight: 6,
  },
  focusRing: {
    boxShadow: FOCUS_RING,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    padding: 0,
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 16,
  },
  errorSlot: {
    height: ERROR_SLOT_HEIGHT,
    justifyContent: "center",
  },
  error: {
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 13,
    lineHeight: 18,
  },
});
