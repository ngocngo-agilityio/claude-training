import { useNavigate } from "react-router";
import { useState } from "react";
import { shallow } from "zustand/shallow";
import { LoginForm } from "@/components/auth/LoginForm";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ROUTES } from "@/constants/routes";
import { login } from "@repo/shared/services/auth-service";
import { useAuthStore } from "@/stores/auth-store";
import type { LoginFormValues } from "@repo/shared/types/auth";

export const LoginPage = () => {
  const [errorMessage, setErrorMessage] = useState<string>();

  const [setAccessToken, setUser] = useAuthStore(
    (state) => [state.setAccessToken, state.setUser],
    shallow,
  );
  const navigate = useNavigate();

  /** Authenticates the user and redirects them to the home page. */
  const handleLogin = async (values: LoginFormValues) => {
    setErrorMessage(undefined);
    const result = await login(values);

    if (!result.success) {
      setErrorMessage(result.error);
      return;
    }

    setAccessToken(result.data.accessToken);
    setUser(result.data.user);
    navigate(ROUTES.CHAT, { replace: true });
  };

  /** Clears the form-level error when the user edits their credentials. */
  const handleLoginChange = () => {
    setErrorMessage(undefined);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <section className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-900">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your details to continue to RestoAI.
        </p>
        <LoginForm
          hasFormError={!!errorMessage}
          onChange={handleLoginChange}
          onSubmit={handleLogin}
        />
        {errorMessage && (
          <p className="mt-3 text-sm text-red-500" role="alert">
            {errorMessage}
          </p>
        )}
      </section>
    </main>
  );
};
