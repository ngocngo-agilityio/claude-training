# Loop check

Run these steps from the repo root on every tick.

1. Run `pnpm run typecheck` and `pnpm run lint`.
2. If the current branch has an open merge request, read it with `glab mr view --comments`. For each unresolved comment, make the change it asks for.
3. If a check fails or a comment needs a change, make the smallest fix and explain it in one line.
4. Never push, and never edit `pnpm-lock.yaml`. Leave fixes as local changes for the user to review.
5. If everything passes and there is nothing to fix, reply `✅ All green` in one line.
