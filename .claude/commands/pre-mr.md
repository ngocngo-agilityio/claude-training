---
description: Check my branch and draft the commit and MR before I open a merge request
argument-hint: "[base-branch]"
---

# Pre-MR check

Get my current branch ready for a merge request. Do every step in order and
stop to ask me before anything that changes git history or GitLab.

## 1. Branch

1. Base branch, first match wins:
   - `$ARGUMENTS`, if given
   - the target of this branch's open MR (`glab mr view` with no number)
   - the remote default branch
     (`git symbolic-ref --short refs/remotes/origin/HEAD`, without `origin/`)
   - `main`
2. Stop and tell me if I am on `main` or on the base branch itself: the work
   needs its own `feat/…` or `fix/…` branch first.
3. `git fetch origin <base>`. From here on, always compare with
   `origin/<base>`, never the local base branch, which can be behind or ahead.

## 2. What changed

Run:

```bash
git status
git log --oneline origin/<base>..HEAD
git diff --stat origin/<base>...HEAD
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
do not fail the check:

```bash
{ git diff --name-only --diff-filter=ACMR origin/<base>...HEAD
  git diff --name-only --diff-filter=ACMR HEAD
  git ls-files --others --exclude-standard
} | sort -u | xargs npx prettier --check --ignore-unknown
```

Run `pnpm run test` too when `apps/agent` or `packages/shared` changed. For
each failure, show the error and the smallest fix. Keep the results for
step 4.

## 4. Self-review

Review the branch with the `review-mr` skill (no MR number: this branch
against `origin/<base>`). Give it the check results from step 3 so it does
not run them again. Fix nothing yet; list the findings.

## 5. Drafts

Write, ready to use:

- **Commit message**:
  - Uncommitted changes: draft a Conventional Commit message (`feat:`, `fix:`,
    `test:`, `chore:`) for them, ending with the `Co-Authored-By` line.
  - Everything already committed: check each message in
    `git log origin/<base>..HEAD` instead, and name any that do not follow
    Conventional Commits.
- **MR title and description**: **Summary** (what and why) and **Test plan**
  (checkboxes for what was run or tried), ending with
  `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
  Write the description to a temporary file outside the repository, for
  example `"$TMPDIR/mr-description.md"`.
- **The command to open it**, reading the description from that file (inside
  a plain `"..."` the shell runs backticked code as commands):

  ```bash
  glab mr create --source-branch <branch> --target-branch <base> \
    --title "<title>" --description "$(cat "$TMPDIR/mr-description.md")"
  ```

## 6. Ask

End with a short summary (checks ✅/❌, number of 🔴/🟡 findings) and ask what
to do next: fix the findings, commit, or push and open the MR. Do not commit,
push or open the MR until I say so.
