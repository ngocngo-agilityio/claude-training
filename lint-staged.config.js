// Commands that run on staged files before each commit (see .husky/pre-commit).
export default {
  "*.{ts,tsx,js,mjs}": ["eslint --fix --no-warn-ignored", "prettier --write"],
  "*.{json,md,css,yaml,yml}": "prettier --write",
};
