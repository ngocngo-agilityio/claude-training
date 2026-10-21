# Agent Guidelines for ui-dojo

pnpm workspace; Turborepo runs and caches tasks. Apps: `apps/web` (React + Vite), `apps/agent` (Mastra + CopilotKit runtime), `apps/mock-api` (JSON Server), `apps/mobile` (Expo + React Native); `packages/shared` holds schemas, types, constants and API services for every app.

## Commands (from the repo root)

- Dev: `pnpm run dev` (mock API + Mastra + Vite); one app: `dev:web`, `dev:agent`, `dev:api`
- Mobile: `pnpm run dev:ios` / `dev:android` (dev build), `dev:mobile` (Metro only), `build:ios` / `build:android` (release)
- Build: `pnpm run build`; one app: `build:web`, `build:agent`
- Check: `pnpm run typecheck`, `pnpm run lint`, `pnpm run format`, `pnpm run test` (agent tests only)
- Commits: Husky runs ESLint + Prettier on staged files; commitlint requires Conventional Commits (`feat:`, `fix:`, `chore:`)

## Code style

- `type` over `interface`, strict TS, named exports, functional components with an extracted `XxxProps` type
- Imports: `@/*` inside an app; shared code as `@repo/shared/<folder>/<file>`; relative `.ts` imports inside `packages/shared`
- Naming: PascalCase for components and their files (`LoginForm.tsx`); camelCase functions/variables; kebab-case for other files (`reserve-restaurant-tool.ts`)
- Package scripts are `dev`, `build`, `typecheck`, `test`; register new task names in `turbo.json`
- Web: Tailwind + `cn()` from `@/lib/utils`, variants with cva; UI in `src/components/ui`, AI UI in `src/components/ai-elements`
- Mobile: `StyleSheet.create` + colors from `useTheme()` / `src/theme`; see `apps/mobile/AGENTS.md`
- Mastra: agents, tools and workflows under `apps/agent/src/mastra/{agents,tools,workflows}`
- Errors: services return result objects (e.g. `LoginResult`); user-facing text comes from `ERROR_MESSAGES` in shared
- Turborepo: before changing `turbo.json`, read `docs/` in the installed `turbo` package

## Never do (do this instead)

- Edit `apps/mobile/ios` or `android` by hand → change `app.json` or config plugins, then rebuild
- `pnpm add` in `apps/mobile` → `npx expo install <pkg>`
- Import React, DOM or env vars in `packages/shared` → pass values from the app via `configureApi`
- Hardcode URLs or secrets → read them from `.env` and update `.env.example`
- Show raw API error text to users → map it to an `ERROR_MESSAGES` entry
- Commit with `--no-verify` or failing checks → run `pnpm run typecheck` and `pnpm run lint`, fix, then commit
- Commit to `main` → work on a `feat/…` or `fix/…` branch and open a merge request
