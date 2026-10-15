import { createWithEqualityFn } from "zustand/traditional";

type ComposerLock = {
  id: string;
  reason: string;
};

type ComposerLockState = {
  locks: ComposerLock[];
};

type ComposerLockStore = ComposerLockState & {
  lockComposer: (id: string, reason: string) => void;
  unlockComposer: (id: string) => void;
};

/**
 * Features share this store to lock chat while awaiting a decision.
 * Each card has its own ID, so releasing one lock leaves the others intact.
 */
export const useComposerLockStore = createWithEqualityFn<ComposerLockStore>()(
  (set) => ({
    locks: [],
    // Replace an existing lock with the same ID to avoid duplicates.
    lockComposer: (id, reason) =>
      set((state) => ({
        locks: [
          ...state.locks.filter((lock) => lock.id !== id),
          { id, reason },
        ],
      })),
    // Release only the specified card's lock.
    unlockComposer: (id) =>
      set((state) => ({
        locks: state.locks.filter((lock) => lock.id !== id),
      })),
  }),
);

/** Return the latest lock reason, or null when chat is unlocked. */
export const selectComposerLockReason = (state: ComposerLockStore) =>
  state.locks.at(-1)?.reason ?? null;
