import { useState } from "react";
import { Keyboard, Pressable, StyleSheet, Text, View } from "react-native";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  LOGIN_FORM_DEFAULT_VALUES,
  LOGIN_VALIDATION_RULES,
} from "@repo/shared/constants/login";
import type { LoginFormValues } from "@repo/shared/types/auth";
import {
  AlertCircleIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
} from "@/components/icons/Icons";
import { GradientButton } from "@/components/ui/GradientButton";
import { TextField, type TextFieldColors } from "@/components/ui/TextField";

export type LoginFormColors = TextFieldColors & {
  muted: string;
};

type LoginFormProps = {
  colors: LoginFormColors;
  /** Error from the server, shown below the submit button. */
  formError?: string;
  /** Called when a field changes, so the parent can clear `formError`. */
  onChange?: () => void;
  onSubmit: (values: LoginFormValues) => Promise<void>;
};

/** Email and password form; validation rules are shared with the web app. */
export const LoginForm = ({
  colors,
  formError,
  onChange,
  onSubmit,
}: LoginFormProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const {
    clearErrors,
    control,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: LOGIN_FORM_DEFAULT_VALUES,
  });
  const [email, password] = useWatch({
    control,
    name: ["email", "password"],
  });
  const isComplete = Boolean(email.trim() && password.trim());
  const hasFieldError = Boolean(errors.email || errors.password);
  // A server error does not block the button, so a failed request can be
  // retried with the same values.
  const isSubmitDisabled = !isComplete || hasFieldError || isSubmitting;

  /** Updates a field and clears its validation and form-level errors. */
  const createChangeHandler =
    (
      fieldName: keyof LoginFormValues,
      fieldOnChange: (value: string) => void,
    ) =>
    (value: string) => {
      fieldOnChange(value);
      clearErrors(fieldName);
      onChange?.();
    };

  // Close the keyboard first so a server error below the button is visible
  // and the screen does not shift while the request runs.
  const submit = () => {
    Keyboard.dismiss();
    void handleSubmit(onSubmit)();
  };

  return (
    <View>
      <Controller
        control={control}
        name="email"
        rules={LOGIN_VALIDATION_RULES.email}
        render={({ field: { onChange, ...field }, fieldState: { error } }) => (
          <TextField
            {...field}
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            colors={colors}
            error={error?.message}
            icon={<MailIcon color={colors.subtle} />}
            keyboardType="email-address"
            label="Email"
            onChangeText={createChangeHandler("email", onChange)}
            onSubmitEditing={() => setFocus("password")}
            placeholder="name@example.com"
            returnKeyType="next"
            submitBehavior="submit"
            textContentType="username"
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        rules={LOGIN_VALIDATION_RULES.password}
        render={({ field: { onChange, ...field }, fieldState: { error } }) => (
          <TextField
            {...field}
            accessory={
              <Pressable
                accessibilityLabel={
                  isPasswordVisible ? "Hide password" : "Show password"
                }
                accessibilityRole="button"
                hitSlop={4}
                onPress={() => setIsPasswordVisible((visible) => !visible)}
                style={styles.visibilityButton}
              >
                {isPasswordVisible ? (
                  <EyeOffIcon color={colors.muted} />
                ) : (
                  <EyeIcon color={colors.muted} />
                )}
              </Pressable>
            }
            autoCapitalize="none"
            autoComplete="current-password"
            autoCorrect={false}
            colors={colors}
            error={error?.message}
            icon={<LockIcon color={colors.subtle} />}
            label="Password"
            onChangeText={createChangeHandler("password", onChange)}
            onSubmitEditing={() => {
              if (!isSubmitDisabled) submit();
            }}
            placeholder="Enter your password"
            returnKeyType="go"
            secureTextEntry={!isPasswordVisible}
            textContentType="password"
          />
        )}
      />

      <GradientButton
        disabled={isSubmitDisabled}
        loading={isSubmitting}
        onPress={submit}
        style={styles.submit}
        title={isSubmitting ? "Signing in..." : "Sign in"}
      />

      {/* Below the button, so it never moves when the error comes or goes. */}
      {formError ? (
        <View
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          accessible
          style={styles.formError}
        >
          <AlertCircleIcon color={colors.destructive} size={16} />
          <Text style={[styles.formErrorText, { color: colors.destructive }]}>
            {formError}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  visibilityButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  formError: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  formErrorText: {
    flexShrink: 1,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 14,
    lineHeight: 20,
  },
  submit: {
    marginTop: 4,
  },
});
