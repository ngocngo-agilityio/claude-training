#!/usr/bin/env bash
# Block commands forbidden by AGENTS.md ("Never do")
cmd=$(jq -r '.tool_input.command // empty')

# Check only the executed part: drop quoted text such as commit messages
code=$(printf '%s' "$cmd" | sed -E "s/\"[^\"]*\"//g; s/'[^']*'//g")

if echo "$code" | grep -Eq -- '--no-verify'; then
  echo "Blocked: do not use --no-verify. Run 'pnpm run typecheck' and 'pnpm run lint', fix errors, then commit." >&2
  exit 2
fi

if echo "$code" | grep -Eq 'git push .*(--force|-f)( |$)'; then
  echo "Blocked: do not force push. Use a normal 'git push'." >&2
  exit 2
fi

if echo "$code" | grep -Eq 'pnpm add' && echo "$code" | grep -Eq 'mobile'; then
  echo "Blocked: in apps/mobile use 'npx expo install <pkg>' instead of pnpm add." >&2
  exit 2
fi

exit 0
