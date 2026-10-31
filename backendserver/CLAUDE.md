# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
docker compose up -d postgres   # Postgres em localhost:5435 (usuário/senha em docker-compose.yml)
npm run dev                     # ts-node-dev com hot reload (--transpile-only: NÃO checa tipos)
npm run build                   # tsc -> dist/  (use para checar tipos)
npm start                       # roda dist/server.js

npx prisma migrate dev          # aplica/cria migrations (ver MIGRATIONS.md)
npx prisma generate             # depois de editar prisma/schema.prisma
npm run seed                    # dados de exemplo (10 usuários, 30 posts, projetos, trabalhos, chat…)

npm test                        # Vitest + Supertest (usa a base lumioo_test, criada automaticamente)
npx vitest run test/works.test.ts   # um arquivo
npx vitest run -t "fluxo completo"  # um teste pelo nome
```

`prisma/migrations/` está no `.gitignore`, então o banco de testes é montado com `prisma db push` a partir do `schema.prisma`.

## Environment

Copie `.env.example` para `.env`. Todas são validadas na inicialização por `src/config/env.ts` (o processo sai se faltar alguma):

- `DATABASE_URL` — PostgreSQL
- `JWT_SECRET` — assinatura dos JWTs
- `FRONTEND_URL` — origens permitidas para CORS (HTTP e Socket.IO), separadas por vírgula
- `PORT` — padrão `8080`

## Architecture

API REST + Socket.IO num **monolito modular** (Express 4, TypeScript, Prisma 6, PostgreSQL, Zod). Tudo sob `/api/v1/lumioo`.

```
src/
├── server.ts            # só sobe: http.Server + Socket.IO + listen + shutdown
├── app.ts               # createApp(): Express sem abrir porta (usado pelos testes com supertest)
├── config/env.ts        # variáveis de ambiente validadas com Zod
├── modules/<nome>/      # um módulo por domínio
│   ├── <nome>.routes.ts       # liga rota → middlewares → controller
│   ├── <nome>.controller.ts   # só HTTP: lê req, chama o service, responde
│   ├── <nome>.service.ts      # regra de negócio + Prisma; lança AppError
│   └── <nome>.schemas.ts      # schemas Zod do módulo
├── shared/              # errors.ts, http.ts, prisma.ts, geo.ts, middlewares/
├── socket/index.ts      # chat em tempo real
└── types/express.d.ts   # req.user
test/                    # testes de integração (Vitest + Supertest)
prisma/                  # schema.prisma, seed.ts, seed-images/
```

Módulos: `auth`, `users` (perfil e conta), `posts` (feed, curtir, salvar), `comments` (inclui curtir comentário), `projects`, `works`, `follows` (seguir e bloquear), `chat`.

### Regras de dependência

`routes → controller → service → Prisma`, sempre nessa direção.

- **Controllers** não têm regra de negócio nem tratam erro: usam `asyncHandler` e `requireUserId` (`shared/http.ts`) e devolvem o que o service retornar.
- **Services** não conhecem `req`/`res`. Lançam erros tipados (`notFound`, `forbidden`, `conflict`, `badRequest`, `unauthorized` de `shared/errors.ts`) e o `errorHandler` global os transforma em `{ error: message, ...extra }`. Um erro pode levar campos extras (ex.: o 403 de trabalho privado inclui `visibility` e `accessRequestStatus`).
- **Validação**: `validateBody(schema)` (`shared/middlewares/validate.middleware.ts`) com os schemas Zod do módulo; responde `400 { error }` com a primeira mensagem. Todo endpoint de escrita deve ter schema.
- Para reaproveitar entre módulos, importe o service ou o mapper (ex.: `users.service` usa `posts.mapper`), nunca o controller.

### Para adicionar um endpoint

1. Schema em `<modulo>.schemas.ts` (se recebe corpo).
2. Função no `<modulo>.service.ts` (lança `AppError` para os casos de erro).
3. Handler fino no controller com `asyncHandler`.
4. Rota em `<modulo>.routes.ts` com a cadeia: `authenticateToken` → limiter → `validateBody` → controller. Rotas fixas (`/works/stats`) vêm **antes** das paramétricas (`/works/:id`).
5. Teste em `test/`.

### Autenticação e limites

- `authenticateToken` exige `Bearer <jwt>` (payload `{ userId, username }`; 401 sem token, 403 inválido). `optionalAuthenticateToken` deixa passar anônimos; nesse caso o service decide o que mostrar (ex.: trabalhos privados).
- Rate limit em memória (`shared/middlewares/rateLimit.middleware.ts`, desligado com `NODE_ENV=test`): `loginLimiter` (10/15min), `accountActionLimiter` (5/15min: cadastro e troca de senha), `writeLimiter` (30/15min: criar conteúdo), `socialActionLimiter` (60/15min: seguir, curtir, bloquear). Endpoint novo de escrita deve usar um deles.
- **PII**: `GET /users` e `GET /users/:id` expõem só campos públicos (sem e-mail nem data de nascimento).

### Dados

- Prisma com PostgreSQL; cliente único em `shared/prisma.ts`. Imagens e PDFs ficam como base64 no banco (sem storage de arquivos), por isso `express.json({ limit: '10mb' })`.
- Paginação por cursor (`?cursor=` → `{ items, nextCursor }`).
- Trabalhos: `visibility` PUBLIC/PRIVATE; privados exigem pedido de acesso aprovado (`WorkAccessRequest`: PENDING → APPROVED/DENIED → REVOKED). A regra está em `works.service.ts` (`assertCanAccess`).
- Bloqueio (`Block`) esconde os perfis nos dois sentidos (404) e impede seguir.

### Chat em tempo real (`src/socket/index.ts`)

- Conexão autenticada com o JWT em `handshake.auth.token` (sem token válido, desconecta).
- Eventos recebidos: `joinConversation(conversationId)` e `sendMessage({ conversationId, text })` (texto 1–2000 caracteres, validado com Zod). Emitidos: `receiveMessage` (para a sala da conversa) e `error({ message })`.
- Só participantes entram na sala ou enviam. `chat.service.createMessage` grava a mensagem e atualiza `updatedAt` da conversa (a lista ordena por atividade).
- Histórico e criação de conversas são REST (`/conversations`).

## Tests

`npm test` roda Vitest com Supertest sobre `createApp()` e um banco `lumioo_test` próprio (criado e recriado por `test/global-setup.ts` no mesmo Postgres do docker-compose; troque com `TEST_DATABASE_URL`). Cada teste cria os próprios usuários com sufixo único (`test/helpers.ts`), sem depender de ordem nem de limpeza. O teste de chat sobe um servidor real em porta aleatória para exercitar o Socket.IO.
