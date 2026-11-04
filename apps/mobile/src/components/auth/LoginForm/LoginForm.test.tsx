import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { ERROR_MESSAGES } from "@repo/shared/constants/errors";
import { THEMES } from "@/constants/theme";
import { useTheme } from "@/providers/ThemeProvider";
import { LoginForm, type LoginFormColors } from "./LoginForm";

jest.mock("@/providers/ThemeProvider", () => ({
  useTheme: jest.fn(),
}));

beforeEach(() => {
  jest.mocked(useTheme).mockReturnValue({
    theme: THEMES.LIGHT,
    colors: {
      brandGradient: ["#e11d48", "#f97316"],
      brandForeground: "#ffffff",
      mutedForeground: "#6b7280",
      secondary: "#1f2937",
      border: "#374151",
    },
  } as unknown as ReturnType<typeof useTheme>);
});

const colors: LoginFormColors = {
  surface: "#ffffff",
  text: "#111827",
  subtle: "#9ca3af",
  muted: "#6b7280",
  border: "#e5e7eb",
  brand: "#e11d48",
  brandRing: "rgba(225, 29, 72, 0.2)",
  destructive: "#dc2626",
};

describe("LoginForm", () => {
  it("keeps the sign-in button disabled until both fields are filled", async () => {
    const { getByLabelText, getByRole } = await render(
      <LoginForm colors={colors} onSubmit={jest.fn()} />,
    );

    expect(getByRole("button", { name: "Sign in" })).toBeDisabled();

    await fireEvent.changeText(getByLabelText("Email"), "a@b.com");
    expect(getByRole("button", { name: "Sign in" })).toBeDisabled();

    await fireEvent.changeText(getByLabelText("Password"), "secret");
    expect(getByRole("button", { name: "Sign in" })).toBeEnabled();
  });

  it("submits the entered values", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { getByLabelText, getByRole } = await render(
      <LoginForm colors={colors} onSubmit={onSubmit} />,
    );

    await fireEvent.changeText(getByLabelText("Email"), "a@b.com");
    await fireEvent.changeText(getByLabelText("Password"), "secret");
    await fireEvent.press(getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual({
      email: "a@b.com",
      password: "secret",
    });
  });

  it("shows the server error and toggles password visibility", async () => {
    const { getByLabelText, getByRole, getByText } = await render(
      <LoginForm
        colors={colors}
        formError="Wrong password"
        onSubmit={jest.fn()}
      />,
    );

    expect(getByText("Wrong password")).toBeTruthy();
    expect(getByLabelText("Password").props.secureTextEntry).toBe(true);

    await fireEvent.press(getByRole("button", { name: "Show password" }));
    expect(getByLabelText("Password").props.secureTextEntry).toBe(false);
  });

  it("shows the required message when a field is blurred empty", async () => {
    const { getByLabelText, getByText } = await render(
      <LoginForm colors={colors} onSubmit={jest.fn()} />,
    );

    await fireEvent(getByLabelText("Email"), "focus");
    await fireEvent(getByLabelText("Email"), "blur");

    await waitFor(() =>
      expect(getByText(ERROR_MESSAGES.EMAIL_REQUIRED)).toBeTruthy(),
    );
  });
});
