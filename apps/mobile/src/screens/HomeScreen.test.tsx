import { CopilotChat } from "@copilotkit/react-native/components";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import type { ReactNode } from "react";
import { ERROR_MESSAGES } from "@repo/shared/constants/errors";
import {
  deleteConversation,
  getConversations,
} from "@repo/shared/services/chat-service";
import type { Conversation } from "@repo/shared/types/conversation";
import { HomeScreen } from "./HomeScreen";

// The chat engine and the providers need native modules and a server. The
// screen only needs them to render, so they are replaced with simple stubs.
jest.mock("@copilotkit/react-native/components", () => ({
  CopilotChat: jest.fn(() => null),
}));

jest.mock("@copilotkit/react-native/headless", () => {
  const agent = { id: "agent" };
  const copilotkit = { connectAgent: jest.fn(() => Promise.resolve()) };
  return {
    useAgent: () => ({ agent, isReady: true }),
    useCopilotKit: () => ({ copilotkit }),
  };
});

jest.mock("@/providers/RestaurantCopilotProvider", () => {
  const { View } = jest.requireActual("react-native");
  return {
    RestaurantCopilotProvider: ({ children }: { children: ReactNode }) => (
      <View>{children}</View>
    ),
  };
});

jest.mock("@/providers/AuthProvider", () => ({
  useAuth: () => ({ accessToken: "token", signOut: jest.fn() }),
}));

jest.mock("@/providers/ThemeProvider", () => ({
  useTheme: () => ({
    colors: jest.requireActual("@/theme/colors").lightColors,
    setTheme: jest.fn(),
    theme: "light",
  }),
}));

jest.mock("@repo/shared/services/chat-service", () => ({
  getConversations: jest.fn(),
  deleteConversation: jest.fn(),
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

const mockedGetConversations = jest.mocked(getConversations);
const mockedDeleteConversation = jest.mocked(deleteConversation);

const romanticDinner: Conversation = {
  id: "thread-1",
  title: "Romantic dinner",
  createdAt: "2026-11-01T10:00:00Z",
  updatedAt: "2026-11-01T10:05:00Z",
};

const familyMeal: Conversation = {
  id: "thread-2",
  title: "Family meal",
  createdAt: "2026-11-02T10:00:00Z",
  updatedAt: "2026-11-02T10:05:00Z",
};

/** The agent name the chat was last rendered with; it carries the thread ID. */
const lastChatAgentName = () =>
  (
    jest.mocked(CopilotChat).mock.lastCall?.[0] as
      | { agentName?: string }
      | undefined
  )?.agentName;

describe("HomeScreen conversation drawer", () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  /** Runs the confirm button of the most recent delete alert. */
  const confirmDelete = () => {
    const buttons = alertSpy.mock.calls.at(-1)?.[2] as
      | { text?: string; onPress?: () => void }[]
      | undefined;
    buttons?.find((button) => button.text === "Delete")?.onPress?.();
  };

  it("loads the conversations when the drawer opens", async () => {
    mockedGetConversations.mockResolvedValue({ threads: [romanticDinner] });
    const screen = await render(<HomeScreen />);

    fireEvent.press(screen.getByLabelText("Open conversations"));

    expect(await screen.findByText("Romantic dinner")).toBeTruthy();
    expect(mockedGetConversations).toHaveBeenCalledWith("token");
  });

  it("shows the load error when the list request fails", async () => {
    mockedGetConversations.mockRejectedValue(new Error("network down"));
    const screen = await render(<HomeScreen />);

    fireEvent.press(screen.getByLabelText("Open conversations"));

    expect(
      await screen.findByText(ERROR_MESSAGES.LOAD_CONVERSATIONS_FAILED),
    ).toBeTruthy();
  });

  it("removes a conversation only after the delete is confirmed", async () => {
    mockedGetConversations.mockResolvedValue({
      threads: [romanticDinner, familyMeal],
    });
    mockedDeleteConversation.mockResolvedValue(undefined);
    const screen = await render(<HomeScreen />);

    fireEvent.press(screen.getByLabelText("Open conversations"));
    await screen.findByText("Family meal");
    fireEvent.press(screen.getByLabelText("Delete Family meal"));

    expect(alertSpy).toHaveBeenCalledWith(
      "Delete conversation?",
      expect.any(String),
      expect.any(Array),
    );
    expect(mockedDeleteConversation).not.toHaveBeenCalled();

    confirmDelete();

    await waitFor(() => expect(screen.queryByText("Family meal")).toBeNull());
    expect(mockedDeleteConversation).toHaveBeenCalledWith("token", "thread-2");
  });

  it("keeps the conversation and shows an alert when the delete fails", async () => {
    mockedGetConversations.mockResolvedValue({
      threads: [romanticDinner, familyMeal],
    });
    mockedDeleteConversation.mockRejectedValue(new Error("server error"));
    const screen = await render(<HomeScreen />);

    fireEvent.press(screen.getByLabelText("Open conversations"));
    await screen.findByText("Family meal");
    fireEvent.press(screen.getByLabelText("Delete Family meal"));
    confirmDelete();

    await waitFor(() =>
      expect(alertSpy).toHaveBeenLastCalledWith(
        ERROR_MESSAGES.DELETE_CONVERSATION_FAILED,
      ),
    );
    expect(screen.getByText("Family meal")).toBeTruthy();
  });

  it("opens a new empty chat when the open conversation is deleted", async () => {
    mockedGetConversations.mockResolvedValue({ threads: [romanticDinner] });
    mockedDeleteConversation.mockResolvedValue(undefined);
    const screen = await render(<HomeScreen />);

    // Open the conversation: its chat renders under the thread ID.
    fireEvent.press(await screen.findByLabelText("Open conversations"));
    fireEvent.press(await screen.findByText("Romantic dinner"));
    await waitFor(() => expect(lastChatAgentName()).toContain("thread-1"));

    // Delete it while it is open.
    fireEvent.press(screen.getByLabelText("Open conversations"));
    fireEvent.press(await screen.findByLabelText("Delete Romantic dinner"));
    confirmDelete();

    await waitFor(() => {
      expect(lastChatAgentName()).toBeDefined();
      expect(lastChatAgentName()).not.toContain("thread-1");
    });
  });

  it("keeps a deleted conversation out of a list request still running", async () => {
    mockedGetConversations.mockResolvedValueOnce({
      threads: [romanticDinner, familyMeal],
    });
    let resolveStaleRequest: (value: {
      threads: Conversation[];
    }) => void = () => undefined;
    mockedGetConversations.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveStaleRequest = resolve;
      }),
    );
    mockedDeleteConversation.mockResolvedValue(undefined);
    const screen = await render(<HomeScreen />);

    // First open: the list loads, then the drawer closes.
    fireEvent.press(screen.getByLabelText("Open conversations"));
    await screen.findByText("Family meal");
    fireEvent.press(screen.getByLabelText("Close conversations"));

    // Second open: its request is still running when the row is deleted.
    fireEvent.press(screen.getByLabelText("Open conversations"));
    fireEvent.press(screen.getByLabelText("Delete Family meal"));
    confirmDelete();
    await waitFor(() => expect(screen.queryByText("Family meal")).toBeNull());

    // The older request now resolves with the deleted row still in it.
    await act(async () => {
      resolveStaleRequest({ threads: [romanticDinner, familyMeal] });
      // Let the component handle the response before the assertions.
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.queryByText("Family meal")).toBeNull();
    expect(screen.getByText("Romantic dinner")).toBeTruthy();
  });
});
