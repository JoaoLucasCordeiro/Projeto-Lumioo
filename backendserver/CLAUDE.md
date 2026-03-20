# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Run in development (hot reload)
npm run dev

# Build TypeScript to dist/
npm run build

# Run production build
npm start

# Database migrations
npx prisma migrate dev

# Regenerate Prisma client after schema changes
npx prisma generate

# Explore the database
npx prisma studio
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL` — PostgreSQL connection string
- `PORT` — server port (default `8080`)
- `JWT_SECRET` — secret for signing JWTs
- `FRONTEND_URL` — allowed CORS origin for both HTTP and Socket.IO

## Architecture

**Lumioo** is an academic social network REST API built with Express + TypeScript + Prisma (PostgreSQL). Real-time chat uses Socket.IO on the same HTTP server.

### Request lifecycle

```
src/server.ts  →  src/routes/*.routes.ts  →  src/middlewares/  →  src/controllers/*.controller.ts  →  Prisma
```

- `server.ts` — bootstraps Express, registers all routers under `/api/v1/lumioo`, creates the `http.Server`, attaches Socket.IO, and starts listening.
- `src/socket.ts` — Socket.IO handler; authenticates connections via JWT from `socket.handshake.auth.token`, then handles `joinConversation` and `sendMessage` events (persists messages to DB and broadcasts to room).

### Auth

Two middlewares in `src/middlewares/`:
- `authenticateToken` — requires a valid `Bearer <token>` header; attaches `req.user.userId`.
- `optionalAuthenticateToken` — same but allows unauthenticated requests through.

JWT payload contains `{ userId }`. The type augmentation for `req.user` lives in `src/types/express.d.ts`.

### Data model (Prisma)

Key entities and relationships:
- **User** — academic profile (`academicEmail`, `username`, `institution`, `academicLevel` enum: `UNDERGRADUATE | MASTER | PHD | PROFESSOR`)
- **Post** — image + caption + hashtags; owned by User; has Comments, Likes, SavedPosts
- **Comment** — on a Post; can also be liked (polymorphic `Like`)
- **Like** — polymorphic: either `postId` or `commentId` (unique per user per target)
- **SavedPost** — join table (`userId`, `postId`) for bookmarked posts
- **Project** — research project with `status` enum: `IN_PROGRESS | COMPLETED | OPEN_FOR_APPLICATIONS`; has `TeamMember[]`
- **Work** — academic work (`TCC | ARTICLE | THESIS | DISSERTATION`) with PDF stored as base64 Text
- **Conversation** + **Message** — DM chat between users; messages are created by Socket.IO, history retrieved via REST

### API base path

All routes are prefixed with `/api/v1/lumioo`. Notable routes:
- `POST /auth/signin` — public
- `POST /users` — public registration
- `GET /profile`, `PUT /profile` — authenticated current user
- `GET /feed` — authenticated post feed
- `POST /conversations`, `GET /conversations` — authenticated DM management
- Images and PDFs are stored as base64 strings in the DB (no external file storage).
