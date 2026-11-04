---
description: Check my branch and draft the commit and MR/PR before I open a merge request or pull request
argument-hint: "[base-branch]"
---

# Pre-MR check

Get my current branch ready for a merge request (GitLab) or pull request
(GitHub). Do every step in order and stop to ask me before anything that
changes git history or the host (GitLab/GitHub).

## 0. Host

Pick the host from the git remotes (`git remote -v`). This repo has `origin`
(GitLab) and `github` (GitHub), so do not assume `origin`.

| Host   | Remote                     | CLI    | Term | Open command     |
| ------ | -------------------------- | ------ | ---- | ---------------- |
| GitLab | the remote on `gitlab`     | `glab` | MR   | `glab mr create` |
| GitHub | the remote on `github.com` | `gh`   | PR   | `gh pr create`   |

If the branch is already on one host, use that host. If it is unclear which one
I want, ask me. Use the matching term in the output (MR or PR).

## 1. Branch

1. Base branch, first match wins:
   - `$ARGUMENTS`, if given
   - the target of this branch's open MR/PR on the chosen host
     (`glab mr view` or `gh pr view --json baseRefName`, no number)
   - the default branch of the chosen remote
     (`git symbolic-ref --short refs/remotes/<remote>/HEAD`, without `<remote>/`)
   - `main`
2. Stop and tell me if I am on `main` or on the base branch itself: the work
   needs its own `feat/…` or `fix/…` branch first.
3. `git fetch <remote> <base>`. From here on, always compare with
   `<remote>/<base>`, never the local base branch, which can be behind or ahead.

## 2. What changed

Run:

```bash
git status
git log --oneline <remote>/<base>..HEAD
git diff --stat <remote>/<base>...HEAD
```

List uncommitted changes separately, and point out files that should not be
committed (`.env`, `.claude/settings.local.json`, logs, unrelated lockfile
changes).

## 3. Checks

From the repository root:

```bash
pnpm run typecheck
pnpm run lint
```

Check formatting only on the files this branch changes, so files outside it
do not fail the check. `xargs -r` skips the run when the list is empty:

```bash
{ git diff --name-only --diff-filter=ACMR <remote>/<base>...HEAD
  git diff --name-only --diff-filter=ACMR HEAD
} | sort -u | xargs -r npx prettier --check --ignore-unknown
```

Run `pnpm run test` too when `apps/agent` or `packages/shared` changed. For
each failure, show the error and the smallest fix. Keep the results (typecheck,
lint, test, prettier) for step 4.

These checks run on local `HEAD`. The branch may not be pushed yet, so the
results describe the local code, not `<remote>/<branch>`.

## 4. Self-review

Review the branch with the `review-mr` skill. Pass it these arguments so it
does not guess the host or base, and does not run the checks again:

- current branch (not an MR/PR number)
- host: GitLab or GitHub, from step 0
- base: `<remote>/<base>`
- source: local `HEAD`, which may be unpushed
- checks already run on this `HEAD`: typecheck, lint, test (if run), prettier
  (use the results from step 3; do not create a worktree)

Fix nothing yet; list the findings.

## 5. Drafts

Write, ready to use:

- **Commit message**:
  - Uncommitted changes: draft a Conventional Commit message for them. Use the
    types allowed by `commitlint.config.js` (for example `feat:`, `fix:`,
    `test:`, `chore:`, `docs:`), and end with the `Co-Authored-By` line from
    the session attribution instructions.
  - Everything already committed: check each message in
    `git log <remote>/<base>..HEAD` instead, and name any that do not follow
    Conventional Commits or `commitlint.config.js`.
- **MR/PR title and description**: **Summary** (what and why) and **Test plan**
  (checkboxes for what was run or tried), ending with
  `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
  Write the description to a temporary file outside the repository, for
  example `"$TMPDIR/mr-description.md"`.
- **The command to open it**, using the host from step 0 and reading the
  description from that file (inside a plain `"..."` the shell runs backticked
  code as commands):

  GitLab:

  ```bash
  glab mr create --source-branch <branch> --target-branch <base> \
    --title "<title>" --description "$(cat "$TMPDIR/mr-description.md")"
  ```

  GitHub:

  ```bash
  gh pr create --head <branch> --base <base> \
    --title "<title>" --body-file "$TMPDIR/mr-description.md"
  ```

## 6. Ask

End with a short summary (checks ✅/❌, number of 🔴/🟡 findings from step 4)
and ask what to do next: fix the findings, commit, or push and open the MR/PR.
Do not commit, push, or open the MR/PR until I say so.
