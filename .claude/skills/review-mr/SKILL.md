---
name: review-mr
description: Review a GitHub pull request or GitLab merge request (or the current branch's diff) against the team rules in AGENTS.md - correctness, the never-do list, code style, tests, commit and PR/MR conventions. Use when asked to review a PR or MR (e.g. "review MR !7", "review PR 12"), or to check a branch before it is merged.
---

# Review a pull request or merge request

Review against this repository's own rules, not generic advice. Read the rules
from the files every time instead of working from memory, because they change.

Works on both hosts. GitHub uses `gh` and calls the change a **PR**; GitLab
uses `glab` and calls it an **MR**. The steps are the same, only the command
changes. Use the table in step 0.

Always compare against the remote branch (`<remote>/<branch>`), never a local
branch: local branches can be behind or ahead of the host, which makes the diff
empty or full of unrelated commits.

## 0. Pick the host and the commands

1. **Host from the input**: a URL containing `github.com` means GitHub; one
   containing `gitlab` means GitLab.
2. **No URL**: check which CLI knows the current branch. Run
   `gh pr view --json number` first, then `glab mr view`. The one that answers
   is the host. If neither answers, ask the user for the host and the number;
   do not guess.
3. **Remote**: use the git remote whose URL points at that host
   (`git remote -v`). This repo has `origin` (GitLab) and `github` (GitHub), so
   do not assume `origin` is GitHub.

| Step                     | GitHub (`gh`)                                     | GitLab (`glab`)                                              |
| ------------------------ | ------------------------------------------------- | ------------------------------------------------------------ |
| View with comments       | `gh pr view <id> --comments`                      | `glab mr view <id> --comments`                               |
| Review comments (inline) | `gh api repos/{owner}/{repo}/pulls/<id>/comments` | included in `glab mr view --comments`                        |
| Current branch's number  | `gh pr view --json number,baseRefName`            | `glab mr view` (no number); the `!N` it prints is the number |
| Diff                     | `gh pr diff <id>` (same as git below)             | `glab mr diff <id>` (same as git below)                      |
| Post a comment           | `gh pr comment <id> --body-file <file>`           | `glab mr note <id> -m "$(cat <file>)"`                       |
| Auth fix                 | `gh auth login`                                   | `glab auth login`                                            |

In the git steps below, `<remote>` is the remote from step 3 and `<source>`,
`<target>` are the branch names, which both hosts report.

## 1. Get the change

- **Number or URL given**:
  1. Run the view-with-comments command for the host from step 0. Note the title, description,
     source and target branches, and the earlier review comments.
  2. `git fetch <remote> <source> <target>`, then
     `git diff <remote>/<target>...<remote>/<source>` for the diff.
     (`gh pr diff` or `glab mr diff` show the same diff when git cannot reach
     the branch, for example from a fork.)
  3. If the CLI fails (for example `401` or "not logged in"), tell the user to
     run the auth fix from the table and continue from git with the branch
     names (ask for them if you do not know them). Note in the report that the
     description and comments were not checked.
- **No number**: review the current branch.
  1. Base branch: the target of the branch's open PR or MR (see the table);
     otherwise the default branch of the remote
     (`git symbolic-ref --short refs/remotes/<remote>/HEAD`, without
     `<remote>/`); otherwise ask.
  2. `git fetch <remote> <base>`, then `git diff <remote>/<base>...HEAD`.
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
  have a test next to the module it covers, as `apps/agent/src/**/*.test.mjs`.
- **Earlier comments**: every earlier review comment is either fixed in the
  code or answered. Name any that are still open.
- **PR/MR hygiene**: Conventional Commit title and commit messages (`feat:`,
  `fix:`, `test:`, `chore:`); the right target branch; a description with a
  test plan; no stray files (`.env`, `settings.local.json`, lockfile changes
  without a dependency change, debug logs).

### 💡 Suggestions

Simpler code, an existing helper that could be reused, a clearer name. Keep
these few; do not pad the review.

## 4. Run the checks

The checks must run on the PR's or MR's code.

- **The change is the current branch** and it matches `<remote>/<source>`: run
  the checks here.
- **Otherwise** use a temporary worktree outside the repository, so
  `eslint .` and Prettier in the main checkout never pick it up and the
  current work is not touched:

  ```bash
  git fetch <remote> <source>
  git worktree add --detach ../review-<host>-<id> <remote>/<source>
  cd ../review-<host>-<id>
  pnpm install --frozen-lockfile   # a new worktree has no node_modules
  ```

Then, from the root of the code under review:

```bash
pnpm run typecheck
pnpm run lint
pnpm run test   # when apps/agent or packages/shared changed
```

When you are done, go back and remove the worktree:
`git worktree remove --force ../review-<host>-<id>`. Here `<host>` is `github` or `gitlab`.

If the caller already ran these checks on the same code (for example
`/pre-mr`), reuse those results instead of running them again.

## 5. Report

Reply in the user's language with:

1. One line on what the PR or MR does.
2. A table of findings, most severe first:

   | Level | File                 | Problem | Suggested fix |
   | ----- | -------------------- | ------- | ------------- |
   | 🔴    | `path/to/file.ts:42` | …       | …             |

3. The check results (typecheck, lint, test: pass or the failing output).
4. A verdict: **✅ Ready to merge** or **⚠️ Needs changes**.

Only report problems you can point to in the code. If there are none, say so
plainly instead of inventing some.

## 6. Limits

- Post comments to the host only when the user asks, and show them the text
  first. Write the text to a temporary file and pass it with the command in the
  table (`--body-file` for `gh`, `"$(cat <file>)"` for `glab`): inside a plain
  `"..."` the shell runs backticked code as commands and breaks the comment.
- Never approve, merge, push, or change the PR's or MR's branch while reviewing.
