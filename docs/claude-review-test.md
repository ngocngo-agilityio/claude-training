# PR Review Checklist

Use this checklist for a quick check before merging a PR.

- [ ] The PR goal is clearly described in the description.
- [ ] The changes include only the files needed for that goal.
- [ ] No secrets, keys, or hardcoded URLs appear in the code.
- [ ] `pnpm run typecheck` and `pnpm run lint` pass.
- [ ] New logic has tests, or the PR explains why they are not needed.
- [ ] Branch and commit names follow Conventional Commits.
