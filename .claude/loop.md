# Loop check

Run these steps from the repo root on every tick.

1. Run `pnpm run typecheck` and `pnpm run lint`. If either fails, fix it (step 4) and rerun both until they pass.
2. Find the open request for the current branch. Try both hosts:
   - GitHub (remote `github`): `gh pr view --json number,url,reviewDecision`
   - GitLab (remote `origin`): `glab mr view --comments`

   If neither has an open PR/MR, skip to step 6 and reply `ℹ️ No open PR/MR for <branch>`.

3. Read the unresolved comments:
   - GitHub: fetch review threads with `gh api graphql -F owner='{owner}' -F repo='{repo}' -F number=<n> -f query='query($owner:String!, $repo:String!, $number:Int!) { repository(owner:$owner, name:$repo) { pullRequest(number:$number) { reviewThreads(first:100) { nodes { isResolved path line comments(first:20) { nodes { author { login } body } } } } } } }'`. Keep only threads with `isResolved == false`.
   - GitLab: `glab api projects/:id/merge_requests/<iid>/discussions`. Keep only discussions whose notes have `resolvable: true` and `resolved: false`.

   For each one, make the change only if it clearly asks for one. If it is a question, praise, or unclear, do not change code. List it in the summary.

4. Fix a failing check or a requested change with the smallest change, following AGENTS.md. Then rerun `pnpm run typecheck` and `pnpm run lint`. Explain each fix in one line.
5. Hard rules:
   - Never push, commit, or use `--no-verify`.
   - Never edit `pnpm-lock.yaml`, or `apps/mobile/ios` / `apps/mobile/android`.
   - Never reply to, resolve, or post on a PR/MR. Leave all fixes as local changes for the user to review.
6. If everything passes and there is nothing to fix, reply `✅ All green` in one line. If there are changes or skipped comments, list them briefly instead.
