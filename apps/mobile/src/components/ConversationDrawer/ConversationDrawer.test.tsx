import { fireEvent, render, waitFor } from "@testing-library/react-native";
import type { Conversation } from "@repo/shared/types/conversation";
import { BackHandler } from "react-native";
import { lightColors } from "@/theme/colors";
import { useTheme } from "@/providers/ThemeProvider";
import {
  ConversationDrawer,
  type ConversationDrawerProps,
} from "./ConversationDrawer";

// Reanimated needs native modules; the drawer only needs its values as plain
// numbers, so the animation hooks are stubbed.
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 47, bottom: 34, left: 0, right: 0 }),
}));

jest.mock("react-native-reanimated", () => {
  const { View } = jest.requireActual("react-native");
  const animated = { View };
  return {
    __esModule: true,
    default: animated,
    ...animated,
    useAnimatedStyle: () => ({}),
    useReducedMotion: () => false,
    useSharedValue: (value: unknown) => ({ value }),
    withTiming: (value: unknown) => value,
  };
});

jest.mock("@/providers/ThemeProvider", () => ({
  useTheme: jest.fn(),
}));

const mockedUseTheme = jest.mocked(useTheme);

const conversations: Conversation[] = [
  {
    id: "thread-1",
    title: "Romantic dinner",
    createdAt: "2026-11-01T10:00:00Z",
    updatedAt: "2026-11-01T10:05:00Z",
  },
  {
    id: "thread-2",
    createdAt: "2026-11-02T10:00:00Z",
    updatedAt: "2026-11-02T10:05:00Z",
  },
];

const createProps = (
  overrides: Partial<ConversationDrawerProps> = {},
): ConversationDrawerProps => ({
  activeThreadId: "thread-1",
  conversations,
  error: null,
  isOpen: true,
  onClose: jest.fn(),
  onDelete: jest.fn(),
  onNewChat: jest.fn(),
  onSelect: jest.fn(),
  onSignOut: jest.fn(),
  onToggleTheme: jest.fn(),
  ...overrides,
});

describe("ConversationDrawer", () => {
  beforeEach(() => {
    mockedUseTheme.mockReturnValue({
      colors: lightColors,
      setTheme: jest.fn(),
      theme: "light",
    } as unknown as ReturnType<typeof useTheme>);
  });

  it("lists the conversations, using a fallback for untitled ones", async () => {
    const { getByText } = await render(
      <ConversationDrawer {...createProps()} />,
    );

    expect(getByText("Romantic dinner")).toBeTruthy();
    expect(getByText("Untitled conversation")).toBeTruthy();
  });

  it("shows the error in place of the list when loading fails", async () => {
    const { getByText, queryByText } = await render(
      <ConversationDrawer
        {...createProps({ error: "Could not load conversations." })}
      />,
    );

    expect(getByText("Could not load conversations.")).toBeTruthy();
    expect(queryByText("Romantic dinner")).toBeNull();
  });

  it("selects a conversation when its row is pressed", async () => {
    const props = createProps();
    const { getByRole } = await render(<ConversationDrawer {...props} />);

    fireEvent.press(getByRole("button", { name: "Untitled conversation" }));

    expect(props.onSelect).toHaveBeenCalledWith("thread-2");
  });

  it("asks for a delete when the trash button of a row is pressed", async () => {
    const props = createProps();
    const { getByLabelText } = await render(<ConversationDrawer {...props} />);

    fireEvent.press(getByLabelText("Delete Romantic dinner"));

    expect(props.onDelete).toHaveBeenCalledWith("thread-1");
  });

  it("closes when the scrim is pressed", async () => {
    const props = createProps();
    const { getByLabelText } = await render(<ConversationDrawer {...props} />);

    fireEvent.press(getByLabelText("Close conversations"));

    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on the Android back button while open", async () => {
    const props = createProps();
    type BackHandlerListener = Parameters<
      typeof BackHandler.addEventListener
    >[1];
    const handlers: BackHandlerListener[] = [];
    const spy = jest
      .spyOn(BackHandler, "addEventListener")
      .mockImplementation((_eventName, handler) => {
        handlers.push(handler);
        return { remove: jest.fn() };
      });

    await render(<ConversationDrawer {...props} />);
    await waitFor(() => expect(handlers.length).toBeGreaterThan(0));
    const listener = handlers[handlers.length - 1];
    const handled = listener({} as never);

    expect(handled).toBe(true);
    expect(props.onClose).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it("runs the footer actions", async () => {
    const props = createProps();
    const { getByLabelText, getByText } = await render(
      <ConversationDrawer {...props} />,
    );

    fireEvent.press(getByText("New chat"));
    fireEvent.press(getByLabelText("Switch theme"));
    fireEvent.press(getByLabelText("Sign out"));

    expect(props.onNewChat).toHaveBeenCalledTimes(1);
    expect(props.onToggleTheme).toHaveBeenCalledTimes(1);
    expect(props.onSignOut).toHaveBeenCalledTimes(1);
  });

  it("does not take the back button while closed", async () => {
    const spy = jest.spyOn(BackHandler, "addEventListener");

    await render(<ConversationDrawer {...createProps({ isOpen: false })} />);

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
