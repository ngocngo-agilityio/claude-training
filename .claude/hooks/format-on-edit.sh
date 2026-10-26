#!/usr/bin/env bash
# Format files right after Claude edits them with the project's Prettier config
file=$(jq -r '.tool_input.file_path // empty')

case "$file" in
  *.ts | *.tsx | *.js | *.mjs | *.json | *.md | *.css | *.yaml | *.yml)
    cd "$CLAUDE_PROJECT_DIR" && pnpm exec prettier --write "$file" >/dev/null 2>&1
    ;;
esac

# Never block an edit because the formatter failed
exit 0
