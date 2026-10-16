import { useState } from "react";
import type { ChangeEventHandler } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  Controller,
  type ControllerRenderProps,
  useForm,
  useWatch,
} from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  LOGIN_FORM_DEFAULT_VALUES,
  LOGIN_VALIDATION_RULES,
} from "@repo/shared/constants/login";
import type { LoginFormValues } from "@repo/shared/types/auth";

type LoginFormProps = {
  hasFormError?: boolean;
  onChange?: () => void;
  onSubmit: (values: LoginFormValues) => Promise<void>;
};

export const LoginForm = ({
  hasFormError = false,
  onChange,
  onSubmit,
}: LoginFormProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const {
    clearErrors,
    control,
    handleSubmit,
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

  /** Updates a field and clears its validation and form-level errors. */
  const createChangeHandler = (
    fieldName: keyof LoginFormValues,
    fieldOnChange: ControllerRenderProps<LoginFormValues>["onChange"],
  ): ChangeEventHandler<HTMLInputElement> => {
    return (event) => {
      fieldOnChange(event);
      clearErrors(fieldName);
      onChange?.();
    };
  };

  return (
    <form
      className="mt-6 space-y-4"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium" htmlFor="email">
          Email
        </label>
        <Controller
          control={control}
          name="email"
          rules={LOGIN_VALIDATION_RULES.email}
          render={({
            field: { onChange, ...inputProps },
            fieldState: { error },
          }) => (
            <>
              <Input
                {...inputProps}
                aria-invalid={Boolean(error)}
                autoComplete="email"
                id="email"
                onChange={createChangeHandler("email", onChange)}
                placeholder="name@example.com"
                type="email"
              />
              {error && (
                <p className="mt-1 text-xs text-red-500" role="alert">
                  {error.message}
                </p>
              )}
            </>
          )}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium" htmlFor="password">
          Password
        </label>
        <Controller
          control={control}
          name="password"
          rules={LOGIN_VALIDATION_RULES.password}
          render={({
            field: { onChange, ...inputProps },
            fieldState: { error },
          }) => (
            <>
              <div className="relative">
                <Input
                  {...inputProps}
                  aria-invalid={Boolean(error)}
                  autoComplete="current-password"
                  className="pr-10"
                  id="password"
                  onChange={createChangeHandler("password", onChange)}
                  placeholder="Enter your password"
                  type={isPasswordVisible ? "text" : "password"}
                />
                <button
                  aria-controls="password"
                  aria-label={
                    isPasswordVisible ? "Hide password" : "Show password"
                  }
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-slate-700 transition-colors hover:text-orange-700 focus-visible:text-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500 dark:text-slate-700 dark:hover:text-orange-700 dark:focus-visible:text-orange-700"
                  onClick={() => setIsPasswordVisible((visible) => !visible)}
                  type="button"
                >
                  {isPasswordVisible ? (
                    <EyeOff className="size-[18px]" strokeWidth={2.4} />
                  ) : (
                    <Eye className="size-[18px]" strokeWidth={2.4} />
                  )}
                </button>
              </div>
              {error && (
                <p className="mt-1 text-xs text-red-500" role="alert">
                  {error.message}
                </p>
              )}
            </>
          )}
        />
      </div>

      <Button
        className="w-full"
        disabled={!isComplete || hasFieldError || hasFormError || isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
};
