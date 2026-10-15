# Agent Guidelines for ui-dojo

## Structure

pnpm workspace; Turborepo (`turbo.json`) runs and caches tasks:

- `apps/web`: React + Vite web app
- `apps/agent`: Mastra server (agent, tools, workflows, CopilotKit runtime)
- `apps/mock-api`: JSON Server mock API
- `apps/mobile`: Expo + React Native app
- `packages/shared`: schemas, types, constants, utilities and API services used by every app

## Commands

Run from the repository root:

- Dev: `pnpm run dev` (runs the mock API, Mastra and Vite in parallel); one app with `dev:web`, `dev:agent`, `dev:api`
- Mobile dev: `pnpm run dev:ios` / `dev:android` (native development build), `dev:mobile` (Metro only)
- Build: `pnpm run build` (web and agent); one app with `build:web`, `build:agent`
- Mobile build: `pnpm run build:ios` / `build:android` (release build)
- Typecheck: `pnpm run typecheck`
- Lint: `pnpm run lint`
- Format: `pnpm run format`
- Test: `pnpm run test` (agent tests only; the web app has no test suite)

## Commits

- Husky runs lint-staged (ESLint + Prettier on staged files) before each commit
- Commit messages must follow Conventional Commits (`feat: ...`, `fix: ...`, `chore: ...`); commitlint rejects others

## Code Style

- **Tasks**: Name package scripts `dev`, `build`, `typecheck` and `test` so Turborepo picks them up; add new task names to `turbo.json`
- **Imports**: Use `@/*` path alias for imports inside an app (e.g., `@/components/ui/button`); import shared code as `@repo/shared/<folder>/<file>` (e.g., `@repo/shared/constants/tools`)
- **Shared package**: Keep `packages/shared` free of React, DOM and environment variables; use relative imports with the `.ts` extension inside it; apps pass endpoints through `configureApi`
- **Types**: Prefer `type` over `interface`; use TypeScript strict mode
- **Components**: Use functional components with typed props; extract prop types (e.g., `MessageProps`)
- **Formatting**: Prettier with default config; double quotes for strings
- **Class Names**: Use `cn()` utility from `@/lib/utils` to merge Tailwind classes with clsx
- **Variants**: Use `class-variance-authority` (cva) for component variants
- **Naming**: PascalCase for components, camelCase for functions/variables, kebab-case for files
- **React**: Extract reusable UI into `apps/web/src/components/ui`, AI components into `apps/web/src/components/ai-elements`
- **Mastra**: Agents in `apps/agent/src/mastra/agents`, tools in `apps/agent/src/mastra/tools`, workflows in `apps/agent/src/mastra/workflows`
- **Error Handling**: No specific pattern observed; use standard try/catch
- **Exports**: Named exports for components and utilities

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.

<!-- END:turborepo-agent-rules -->
