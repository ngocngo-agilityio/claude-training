import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "@/constants/storage";

type AuthProviderProps = {
  children: ReactNode;
};

type AuthProviderState = {
  /** Token of the signed-in user, or null when signed out. */
  accessToken: string | null;
  /** True until the saved token has been read from the device. */
  isLoading: boolean;
  signIn: (accessToken: string) => void;
  signOut: () => void;
};

const initialState: AuthProviderState = {
  accessToken: null,
  isLoading: true,
  signIn: () => null,
  signOut: () => null,
};

const AuthProviderContext = createContext<AuthProviderState>(initialState);

export const useAuth = () => {
  return useContext(AuthProviderContext);
};

/**
 * Provides the signed-in token. The token is kept in SecureStore, so the user
 * stays signed in after the app restarts, until they sign out.
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the token saved in an earlier session.
  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN)
      .then((value) => {
        setAccessToken(value);
      })
      // Reading can fail on a fresh install; start signed out instead.
      .catch((error: unknown) => {
        if (__DEV__) console.warn("Could not read the saved token:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const value = useMemo(
    () => ({
      accessToken,
      isLoading,
      signIn: (nextAccessToken: string) => {
        setAccessToken(nextAccessToken);
        // The user stays signed in for this session if saving fails.
        SecureStore.setItemAsync(
          STORAGE_KEYS.ACCESS_TOKEN,
          nextAccessToken,
        ).catch((error: unknown) => {
          if (__DEV__) console.warn("Could not save the token:", error);
        });
      },
      signOut: () => {
        setAccessToken(null);
        // Signed out for this session even if the saved copy cannot be removed.
        SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN).catch(
          (error: unknown) => {
            if (__DEV__) console.warn("Could not remove the token:", error);
          },
        );
      },
    }),
    [accessToken, isLoading],
  );

  return <AuthProviderContext value={value}>{children}</AuthProviderContext>;
};
