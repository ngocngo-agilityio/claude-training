import { persist } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";
import { AUTH_STORAGE_KEY } from "@/constants/auth";
import type { AuthenticatedUser } from "@repo/shared/types/auth";

type AuthState = {
  accessToken: string;
  user: AuthenticatedUser | null;
};

type AuthStore = AuthState & {
  setAccessToken: (accessToken: string) => void;
  setUser: (user: AuthenticatedUser) => void;
  clearAuth: () => void;
};

const INITIAL_AUTH_STATE: AuthState = {
  accessToken: "",
  user: null,
};

export const useAuthStore = createWithEqualityFn<AuthStore>()(
  persist<AuthStore>(
    (set) => ({
      ...INITIAL_AUTH_STATE,
      setAccessToken: (accessToken) => set({ accessToken }),
      setUser: (user) => set({ user }),
      clearAuth: () => set(INITIAL_AUTH_STATE),
    }),
    {
      name: AUTH_STORAGE_KEY,
    },
  ),
);
