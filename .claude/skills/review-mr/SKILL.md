---
name: review-mr
description: Review a GitLab merge request (or the current branch's diff) against the team rules in AGENTS.md - correctness, the never-do list, code style, tests, commit and MR conventions. Use when asked to review an MR or PR (e.g. "review MR !7"), or to check a branch before it is merged.
---

# Review a merge request

Review against this repository's own rules, not generic advice. Read the rules
from the files every time instead of working from memory, because they change.

Always compare against the remote (`origin/<branch>`), never a local branch:
local branches can be behind or ahead of GitLab, which makes the diff empty or
full of unrelated commits.

## 1. Get the change

- **MR number given** (`!7`, `7` or a URL):
  1. `glab mr view <id> --comments`: note the title, description, source and
     target branches, and the earlier review comments.
  2. `git fetch origin <source> <target>`, then
     `git diff origin/<target>...origin/<source>` for the diff.
     (`glab mr diff <id>` shows the same diff when git cannot reach the
     branches, for example an MR from a fork.)
  3. If `glab` fails (for example `401 invalid_token`), tell the user to run
     `glab auth login` and continue from git with the branch names (ask for
     them if you do not know them). Note in the report that the MR description
     and comments were not checked.
- **No MR number**: review the current branch.
  1. Base branch: the target of the branch's open MR (`glab mr view` with no
     number shows it); otherwise the remote default branch
     (`git symbolic-ref --short refs/remotes/origin/HEAD`, without `origin/`);
     otherwise ask.
  2. `git fetch origin <base>`, then `git diff origin/<base>...HEAD`.
  3. Include uncommitted changes from `git status` / `git diff HEAD` too.

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
- **Earlier comments**: every earlier review comment is either fixed in the
  code or answered. Name any that are still open.
- **MR hygiene**: Conventional Commit title and commit messages (`feat:`,
  `fix:`, `test:`, `chore:`); the right target branch; a description with a
  test plan; no stray files (`.env`, `settings.local.json`, lockfile changes
  without a dependency change, debug logs).

### 💡 Suggestions

Simpler code, an existing helper that could be reused, a clearer name. Keep
these few; do not pad the review.

## 4. Run the checks

The checks must run on the MR's code.

- **The MR is the current branch** and it matches `origin/<source>`: run the
  checks here.
- **Otherwise** use a temporary worktree outside the repository, so
  `eslint .` and Prettier in the main checkout never pick it up and the
  current work is not touched:

  ```bash
  git fetch origin <source>
  git worktree add --detach ../review-mr-<id> origin/<source>
  cd ../review-mr-<id>
  pnpm install --frozen-lockfile   # a new worktree has no node_modules
  ```

Then, from the root of the code under review:

```bash
pnpm run typecheck
pnpm run lint
pnpm run test   # when apps/agent or packages/shared changed
```

When you are done, go back and remove the worktree:
`git worktree remove --force ../review-mr-<id>`.

If the caller already ran these checks on the same code (for example
`/pre-mr`), reuse those results instead of running them again.

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

- Post comments to GitLab only when the user asks, and show them the text
  first. Write the text to a temporary file and pass it as
  `glab mr note <id> -m "$(cat <file>)"`: inside a plain `"..."` the shell
  runs backticked code as commands and breaks the comment.
- Never approve, merge, push, or change the MR's branch while reviewing.
