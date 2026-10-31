# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Lumioo is an academic social network (posts, projects, academic works/TCCs, follows, DM chat). It is a monorepo of three independent apps, each with its own `package.json` and no shared workspace tooling — run `npm` commands from inside the relevant folder.

| Folder | What | Stack |
|---|---|---|
| `backendserver/` | REST API + Socket.IO chat | Express 4, TypeScript, Prisma 6, PostgreSQL, Zod |
| `frontendclient/` | Web SPA | React 19, Vite, Tailwind 4, shadcn/ui, TanStack Query 5, React Router 7 |
| `mobileclient/Lumioo/` | Mobile app | Expo (expo-router, file-based routing), NativeWind, axios |
| `docs/` | Per-controller/middleware API docs (Portuguese) | — |

`backendserver/CLAUDE.md` and `frontendclient/CLAUDE.md` have per-app commands and architecture; read them when working in those folders. `backendserver/CLAUDE.md` was rewritten for the modular architecture; `frontendclient/CLAUDE.md` still has a stale `VITE_API_URL` (see Environment below). The mobile app has no CLAUDE.md; its design docs are in `mobileclient/Lumioo/docs/` (`UI_PATTERN.md`, `NATIVEWIND_GUIDE.md`, `UI_STYLING_GUIDE.md`).

The codebase, commit messages (conventional commits, e.g. `feat(security): ...`) and docs are in Portuguese; UI strings and routes (`/cadastro`, `/trabalhos`, `/projetos`) are too.

## Commands

```bash
# Backend (backendserver/)
docker compose up -d        # Postgres on host port 5435 + pgAdmin on 5051
npm run dev                 # ts-node-dev with hot reload (transpile-only: no type-check)
npm run build               # tsc -> dist/  (use this to type-check)
npm test                    # Vitest + Supertest
npm run seed                # sample data (login: ana_souza / Lumioo@123)
npx prisma migrate dev      # apply/create migrations (see MIGRATIONS.md)
npx prisma generate         # after editing prisma/schema.prisma

# Frontend (frontendclient/)
npm run dev                 # Vite on :5173
npm run build               # tsc + vite build
npm run lint

# Mobile (mobileclient/Lumioo/)
npx expo start              # or npm run android / ios / web
npm run lint
```

Only the backend has tests (`npm test` in `backendserver/`, needs the Postgres container running); the web and mobile apps have none.

## Environment

- Backend `.env`: `DATABASE_URL`, `PORT` (8080), `JWT_SECRET`, `FRONTEND_URL` (CORS origin for HTTP and Socket.IO). See `backendserver/.env.example`.
- Frontend `.env`: `VITE_API_URL` — must include the full base path, `http://localhost:8080/api/v1/lumioo` (per `.env.example`; the `/api` value in `frontendclient/CLAUDE.md` is stale).
- Mobile: `EXPO_PUBLIC_API_URL`, same base path.

## Cross-app architecture

- **One API, three consumers.** Every route lives under `/api/v1/lumioo` (all routers are mounted at that prefix in `backendserver/src/server.ts`). Web and mobile both authenticate with a `Bearer` JWT whose payload is `{ userId }`; the web client stores it in localStorage (`lumioo_token`), mobile in `expo-secure-store`. API contract changes must be reflected in the clients and in the API docs (`backendserver/docs/API_REFERENCE.md`, mirrored in `frontendclient/docs/` and `mobileclient/Lumioo/docs/`).
- **No file storage.** Post images and work PDFs are stored as base64 strings in Postgres, hence `express.json({ limit: '10mb' })`.
- **Chat** is split: history/conversation management over REST (`chat.controller.ts`), live messages over Socket.IO (`backendserver/src/socket.ts`, JWT via `socket.handshake.auth.token`). See `docs/CHAT_GUIDE.md` in backend/frontend.
- **Works** (`Work` model) have `visibility` (`WorkVisibility`), a knowledge area (`WorkArea`), location, and an access-request flow (`WorkAccessStatus`) for non-public works; projects also carry location/visibility. The web app renders these on an academic map using `frontendclient/src/lib/mapCoordinates.ts`.

## Backend architecture (summary)

The backend is a **modular monolith**: `backendserver/src/modules/<domain>/` holds routes → controller → service → schemas for each domain (`auth`, `users`, `posts`, `comments`, `projects`, `works`, `follows`, `chat`), with shared pieces in `src/shared/`, validated env in `src/config/env.ts`, and the app factory in `src/app.ts`. Business rules live in services, which throw typed `AppError`s that the global `errorHandler` turns into `{ error }` responses. See `backendserver/CLAUDE.md` for the rules and for how to add an endpoint.

- **Validation:** Zod schemas per module, applied with `validateBody(schema)`; every write endpoint has one.
- **Rate limiting:** `loginLimiter`, `accountActionLimiter`, `writeLimiter` and `socialActionLimiter` in `src/shared/middlewares/rateLimit.middleware.ts`. New write endpoints should get one.
- **PII:** `GET /users` and `GET /users/:id` deliberately expose only public fields (see commit `9f8867c`); don't return email or other private fields from public user endpoints.
- **Tests:** `npm test` in `backendserver/` (Vitest + Supertest against a dedicated `lumioo_test` database). The mobile and web apps still have no tests.
- **Seed:** `npm run seed` in `backendserver/` creates sample data; every seed user has the password `Lumioo@123`.
