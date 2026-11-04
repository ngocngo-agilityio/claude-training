import { render } from "@testing-library/react-native";
import { THEMES } from "@/constants/theme";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { AppShell } from "./AppShell";

jest.mock("expo-router", () => {
  const { View } = jest.requireActual("react-native");
  const Stack = ({ children }: { children: unknown }) => (
    <View>{children}</View>
  );
  Stack.Protected = ({ children }: { children: unknown }) => (
    <View>{children}</View>
  );
  Stack.Screen = () => null;
  return { Stack };
});

jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
}));

jest.mock("@/components/SplashScreen/SplashScreen", () => {
  const { Text } = jest.requireActual("react-native");
  return {
    SplashScreen: () => <Text>splash</Text>,
  };
});

jest.mock("@/providers/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/providers/ThemeProvider", () => ({
  useTheme: jest.fn(),
}));

const mockedUseAuth = jest.mocked(useAuth);
const mockedUseTheme = jest.mocked(useTheme);

describe("AppShell", () => {
  beforeEach(() => {
    mockedUseTheme.mockReturnValue({
      theme: THEMES.LIGHT,
    } as unknown as ReturnType<typeof useTheme>);
  });

  it("draws the splash over the app", async () => {
    mockedUseAuth.mockReturnValue({
      accessToken: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useAuth>);

    const { getByText } = await render(<AppShell />);

    expect(getByText("splash")).toBeTruthy();
  });
});
