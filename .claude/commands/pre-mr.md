---
description: Check my branch and draft the commit and MR before I open a merge request
argument-hint: [base-branch]
---

# Pre-MR check

Get my current branch ready for a merge request. Do every step in order and
stop to ask me before anything that changes git history or GitLab.

## 1. Branch

- Base branch: `$ARGUMENTS` if given; otherwise `feat/restaurant-reservation`
  if it exists, else `main`.
- Stop and tell me if I am on `main` or on the base branch itself: the work
  needs its own `feat/…` or `fix/…` branch first.

## 2. What changed

Run `git status` and `git diff <base>...HEAD --stat`. List uncommitted
changes separately, and point out files that should not be committed
(`.env`, `.claude/settings.local.json`, logs, unrelated lockfile changes).

## 3. Checks

From the repository root:

```bash
pnpm run typecheck
pnpm run lint
npx prettier --check .
```

For each failure, show the error and the smallest fix. Run
`pnpm run test` too when `apps/agent` or `packages/shared` changed.

## 4. Self-review

Review the branch with the `review-mr` skill (no MR number: the branch
against the base). Fix nothing yet; list the findings.

## 5. Drafts

Write, ready to copy:

- A Conventional Commit message (`feat:`, `fix:`, `test:`, `chore:`) for the
  uncommitted changes, ending with the `Co-Authored-By` line.
- An MR title and description: **Summary** (what and why), **Test plan**
  (checkboxes for what was run or tried), ending with
  `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
- The command to open it:
  `glab mr create --source-branch <branch> --target-branch <base> --title "…" --description "…"`

## 6. Ask

End with a short summary (checks ✅/❌, number of 🔴/🟡 findings) and ask what
to do next: fix the findings, commit, or push and open the MR. Do not commit,
push or open the MR until I say so.
