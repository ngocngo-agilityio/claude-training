# Restaurant Reservation

## Overview

The Restaurant Reservation application simulates restaurant discovery,
recommendations, table reservations, and reservation management through an AI
assistant.

## Technical stack

- React
- Vite
- TypeScript
- Mastra (agent, tools, and memory)
- CopilotKit (chat and generative UI)
- OpenAI
- Zod
- Tailwind CSS
- JSON Server

## Features

### AI Assistant

#### 1. Authentication

- Allow users to sign in using email and password.
- Allow users to sign out.

#### 2. Restaurant Discovery

- Allow users to get restaurant recommendations based on cuisine, budget,
  occasion, and location.
- Allow users to view a restaurant's menu.
- Allow users to view restaurant details.

#### 3. Table Reservation

- Allow users to select a reservation date, guest count, and available time.
- Allow users to review reservation details before booking.
- Require users to explicitly confirm or cancel the reservation.
- Create the reservation only after the user confirms.
- Allow authenticated users to view their existing reservations.

#### 4. Reservation Guide

- Allow users to request instructions on how to find a restaurant and make a
  reservation.

#### 5. AI Chat Experience

- Provide restaurant-related prompt suggestions.

#### 6. Theme

- Allow users to switch between light and dark themes manually.
- Allow users to ask the AI assistant to change the application theme.

## Project structure

The repository is a pnpm workspace, with Turborepo running the tasks:

```
apps/
  web/        React + Vite web app (CopilotKit chat and generative UI)
  agent/      Mastra server (agent, tools, workflow, CopilotKit runtime)
  mock-api/   JSON Server mock API for restaurants, menus and reservations
packages/
  shared/     Code used by every app: Zod schemas, types, constants,
              utilities and API services
```

The agent is shared by every client. A new client (for example a React Native
app under `apps/mobile`) reuses `packages/shared` and talks to the same
`apps/agent` server.

## Getting Started

To get started with this project, follow the instructions below.

### Prerequisites

- Node.js 20 or later
- pnpm
- OpenAI API key

### Installation

1. Clone the repository:

   ```bash
   git clone git@gitlab.asoft-python.com:ngoc.ngo/copilotkit-training.git
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Configure environment variables

   Copy the example environment files:

   ```bash
   cp apps/agent/.env.example apps/agent/.env
   cp apps/web/.env.example apps/web/.env
   ```

   Update the values in both `.env` files before running the application.

### Run the application

```bash
pnpm run dev
```

This starts the JSON Server mock API (`http://localhost:3001`), Mastra server
(`http://localhost:4750`), and Vite development server concurrently. Open
[http://localhost:5173](http://localhost:5173) in your browser to use the app.

To run one part only, or the mobile app:

```bash
pnpm run dev:web        # web only
pnpm run dev:agent      # Mastra server only
pnpm run dev:api        # mock API only
pnpm run dev:ios        # build the mobile app and open it on the iOS simulator
pnpm run dev:android    # build the mobile app and open it on the Android emulator
pnpm run dev:mobile     # start Metro for a mobile app that is already installed
```

The mobile app calls the agent and the mock API, so keep `pnpm run dev` running
in another terminal.

### Build

```bash
pnpm run build          # web and agent
pnpm run build:web      # web only
pnpm run build:agent    # agent only
pnpm run build:ios      # mobile release build for iOS
pnpm run build:android  # mobile release build for Android
pnpm run preview:web    # serve the built web app
```

Turborepo caches `build` (web), `typecheck` and `test`, so a task whose inputs
have not changed is replayed from cache instead of running again.

### Lint, typecheck and test

```bash
pnpm run lint
pnpm run typecheck
pnpm run test
```

### Git hooks

Husky installs two Git hooks when you run `pnpm install`:

- `pre-commit` runs ESLint and Prettier on the staged files (lint-staged).
- `commit-msg` checks that the message follows
  [Conventional Commits](https://www.conventionalcommits.org), for example
  `feat: add restaurant carousel` or `fix: handle expired session`.

## Learn More

- [Mastra Documentation](https://mastra.ai/docs)
- [CopilotKit Documentation](https://copilotkit.ai)
