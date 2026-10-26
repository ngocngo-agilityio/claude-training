#!/usr/bin/env bash
# Show a macOS notification when Claude finishes responding
osascript -e 'display notification "Claude finished" with title "Claude Code"' >/dev/null 2>&1

exit 0
