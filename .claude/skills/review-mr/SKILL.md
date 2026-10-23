---
name: review-mr
description: Review a GitLab merge request (or the current branch's diff) against the ui-dojo team rules in AGENTS.md - correctness, the never-do list, code style, tests, commit and MR conventions. Use when asked to review an MR or PR (e.g. "review MR !7"), or to check a branch before it is merged.
---

# Review a merge request

Review against this repository's own rules, not generic advice. Read the rules
from the files every time instead of working from memory, because they change.

## 1. Get the change

- **MR number given** (`!7`, `7` or a URL):
  - `glab mr view <id> --comments` for the title, description, source and
    target branches, and earlier review comments
  - `glab mr diff <id>` for the diff
  - If `glab` fails (for example `401 invalid_token`), tell the user to run
    `glab auth login`, then continue from git: `git fetch origin` and
    `git diff origin/<target>...origin/<source>`. Ask for the branch names if
    you do not know them, and note in the report that the MR description and
    comments were not checked.
- **No MR number**: review the current branch against its base,
  `git diff <base>...HEAD`. Use the upstream MR's target branch if there is
  one, otherwise ask which branch it will merge into. Mention uncommitted
  changes from `git status` too.

Read every changed file in full around the hunks, not just the diff lines, so
you judge the code in context.

## 2. Load the rules

- `AGENTS.md` at the repository root: commands, code style, never-do list
- `apps/mobile/AGENTS.md` when the diff touches `apps/mobile`
- Nearby code in the same folder, to see the local idiom

## 3. Check, most important first

### 🔴 Must fix

- **Correctness**: wrong conditions or comparisons, unhandled `null` or
  `undefined`, missing `await`, stale closures, effects without cleanup, race
  conditions, errors that are thrown instead of returned as a result object.
  Trace the code with a concrete input before reporting.
- **Never-do list** from `AGENTS.md`, for example:
  - hardcoded URLs or secrets (must come from `.env`, with `.env.example`
    updated)
  - raw API error text shown to users instead of an `ERROR_MESSAGES` entry
  - React, DOM or env vars imported in `packages/shared`
  - hand edits under `apps/mobile/ios` or `apps/mobile/android`
  - packages added to `apps/mobile` with `pnpm add` instead of
    `npx expo install`
  - commits to `main` or with `--no-verify`

### 🟡 Should fix

- **Code style**: `type` over `interface`; named exports; an extracted
  `XxxProps` type; PascalCase component files, kebab-case other files;
  `@/*` imports inside an app and `@repo/shared/<folder>/<file>` for shared
  code; web uses Tailwind + `cn()` + cva, mobile uses `StyleSheet.create` and
  colors from `useTheme()` / `src/theme`.
- **Tests**: new or changed logic in `apps/agent` or `packages/shared` should
  have a test in `apps/agent/tests/*.test.mjs`.
- **MR hygiene**: Conventional Commit title (`feat:`, `fix:`, `test:`,
  `chore:`); the right target branch; a description with a test plan; no
  stray files (`.env`, `settings.local.json`, lockfile changes without a
  dependency change, debug logs).

### 💡 Suggestions

Simpler code, an existing helper that could be reused, a clearer name. Keep
these few; do not pad the review.

## 4. Run the checks

From the repository root, on the MR's code:

```bash
pnpm run typecheck
pnpm run lint
pnpm run test   # when apps/agent or packages/shared changed
```

When the MR is not the current branch, check it out in a separate worktree
(`git worktree add <path> origin/<source-branch>`) so the current work is not
touched, and remove the worktree afterwards.

## 5. Report

Reply in the user's language with:

1. One line on what the MR does.
2. A table of findings, most severe first:

   | Level | File                 | Problem | Suggested fix |
   | ----- | -------------------- | ------- | ------------- |
   | 🔴    | `path/to/file.ts:42` | …       | …             |

3. The check results (typecheck, lint, test: pass or the failing output).
4. A verdict: **✅ Ready to merge** or **⚠️ Needs changes**.

Only report problems you can point to in the code. If there are none, say so
plainly instead of inventing some.

## 6. Limits

- Post comments to GitLab (`glab mr note <id> -m "..."`) only when the user
  asks, and show them the text first.
- Never approve, merge, push, or change the MR's branch while reviewing.
