import { fireEvent, render, waitFor } from "@testing-library/react-native";
import * as SecureStore from "expo-secure-store";
import { Pressable, Text } from "react-native";
import { STORAGE_KEYS } from "@/constants/storage";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockedSecureStore = jest.mocked(SecureStore);

/** Shows the token state and offers buttons that sign in and out. */
const AuthProbe = () => {
  const { accessToken, isLoading, signIn, signOut } = useAuth();

  return (
    <>
      <Text>{isLoading ? "loading" : (accessToken ?? "signed out")}</Text>
      <Pressable onPress={() => signIn("new-token")}>
        <Text>sign in</Text>
      </Pressable>
      <Pressable onPress={signOut}>
        <Text>sign out</Text>
      </Pressable>
    </>
  );
};

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    mockedSecureStore.setItemAsync.mockResolvedValue(undefined);
    mockedSecureStore.deleteItemAsync.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("restores the token saved on the device", async () => {
    mockedSecureStore.getItemAsync.mockResolvedValue("saved-token");

    const { getByText } = await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(getByText("saved-token")).toBeTruthy());
    expect(mockedSecureStore.getItemAsync).toHaveBeenCalledWith(
      STORAGE_KEYS.ACCESS_TOKEN,
    );
  });

  test("starts signed out when nothing is saved", async () => {
    mockedSecureStore.getItemAsync.mockResolvedValue(null);

    const { getByText } = await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(getByText("signed out")).toBeTruthy());
  });

  test("starts signed out when the saved token cannot be read", async () => {
    mockedSecureStore.getItemAsync.mockRejectedValue(new Error("unreadable"));

    const { getByText } = await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(getByText("signed out")).toBeTruthy());
    expect(console.warn).toHaveBeenCalled();
  });

  test("saves the token when the user signs in", async () => {
    mockedSecureStore.getItemAsync.mockResolvedValue(null);

    const { getByText } = await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );
    await waitFor(() => expect(getByText("signed out")).toBeTruthy());

    fireEvent.press(getByText("sign in"));

    await waitFor(() => expect(getByText("new-token")).toBeTruthy());
    expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
      STORAGE_KEYS.ACCESS_TOKEN,
      "new-token",
    );
  });

  test("stays signed in for this session when saving fails", async () => {
    mockedSecureStore.getItemAsync.mockResolvedValue(null);
    mockedSecureStore.setItemAsync.mockRejectedValue(new Error("too large"));

    const { getByText } = await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );
    await waitFor(() => expect(getByText("signed out")).toBeTruthy());

    fireEvent.press(getByText("sign in"));

    await waitFor(() => expect(getByText("new-token")).toBeTruthy());
    await waitFor(() => expect(console.warn).toHaveBeenCalled());
  });

  test("clears the saved token when the user signs out", async () => {
    mockedSecureStore.getItemAsync.mockResolvedValue("saved-token");

    const { getByText } = await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );
    await waitFor(() => expect(getByText("saved-token")).toBeTruthy());

    fireEvent.press(getByText("sign out"));

    await waitFor(() => expect(getByText("signed out")).toBeTruthy());
    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(
      STORAGE_KEYS.ACCESS_TOKEN,
    );
  });
});
