import { render } from "@testing-library/react-native";
import { THEMES } from "@/constants/theme";
import { useTheme } from "@/providers/ThemeProvider";
import { SplashScreen } from "./SplashScreen";

// Reanimated and Worklets need native modules; stub the calls the splash makes.
jest.mock("react-native-worklets", () => ({
  scheduleOnRN: jest.fn(),
}));

jest.mock("react-native-reanimated", () => {
  const { View } = jest.requireActual("react-native");
  const animated = {
    View,
    Text: jest.requireActual("react-native").Text,
    Image: jest.requireActual("react-native").Image,
  };
  const entering = { delay: () => ({ springify: () => ({}) }) };
  const sharedValue = (value: unknown) => ({
    get: () => value,
    set: () => undefined,
  });
  return {
    __esModule: true,
    default: animated,
    ...animated,
    Easing: {
      out: () => () => 0,
      in: () => () => 0,
      inOut: () => () => 0,
      quad: () => 0,
      cubic: () => 0,
      sin: () => 0,
    },
    FadeIn: entering,
    FadeInDown: entering,
    useAnimatedStyle: () => ({}),
    useReducedMotion: () => false,
    useSharedValue: sharedValue,
    withDelay: (_delay: number, value: unknown) => value,
    withRepeat: (value: unknown) => value,
    withSequence: (value: unknown) => value,
    withSpring: (value: unknown) => value,
    withTiming: (value: unknown) => value,
  };
});

jest.mock("expo-splash-screen", () => ({
  hideAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock("@/providers/ThemeProvider", () => ({
  useTheme: jest.fn(),
}));

const mockedUseTheme = jest.mocked(useTheme);

describe("SplashScreen", () => {
  beforeEach(() => {
    mockedUseTheme.mockReturnValue({
      theme: THEMES.LIGHT,
    } as unknown as ReturnType<typeof useTheme>);
  });

  it("shows the app name and tagline", async () => {
    const { getByText } = await render(<SplashScreen onFinish={jest.fn()} />);

    expect(getByText("RestoAI")).toBeTruthy();
    expect(getByText("Find, book and enjoy – just ask.")).toBeTruthy();
  });

  it("exposes a loading indicator", async () => {
    const { getByLabelText } = await render(
      <SplashScreen onFinish={jest.fn()} />,
    );

    expect(getByLabelText("Loading")).toBeTruthy();
  });
});
