# Lumioo API — Guia de Migrations

> Última atualização: 2026-03-20
> Versão do Prisma: 6.7.0

---

## Situação Atual

O projeto **não possui nenhuma migration aplicada** (`prisma/migrations/` não existe). Todo o schema precisa ser criado no banco pela primeira vez via Prisma Migrate.

---

## Pré-requisitos

1. PostgreSQL rodando e acessível
2. Arquivo `.env` configurado com `DATABASE_URL`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
```

Exemplo local:
```env
DATABASE_URL="postgresql://postgres:senha@localhost:5432/lumioo_dev"
```

---

## Migration 1 — Setup inicial completo

**Nome sugerido:** `init`

Cria toda a estrutura do banco: enums, tabelas, constraints, índices e foreign keys.

### Como rodar

```bash
npx prisma migrate dev --name init
```

> Este comando cria a pasta `prisma/migrations/`, gera o arquivo SQL, aplica no banco e regenera o Prisma Client automaticamente.

### O que será criado

#### Enums

| Enum | Valores |
|---|---|
| `AcademicLevel` | `UNDERGRADUATE`, `MASTER`, `PHD`, `PROFESSOR` |
| `ProjectStatus` | `IN_PROGRESS`, `COMPLETED`, `OPEN_FOR_APPLICATIONS` |
| `WorkType` | `TCC`, `ARTICLE`, `THESIS`, `DISSERTATION` |

#### Tabelas

| Tabela | Descrição |
|---|---|
| `users` | Usuários da plataforma com perfil acadêmico |
| `conversations` | Conversas DM entre dois usuários |
| `messages` | Mensagens de uma conversa |
| `posts` | Posts do feed acadêmico |
| `comments` | Comentários em posts |
| `likes` | Curtidas polimórficas (post ou comentário) |
| `saved_posts` | Posts salvos por um usuário |
| `projects` | Projetos de pesquisa |
| `team_members` | Membros de um projeto |
| `works` | Trabalhos acadêmicos (TCC, artigos, etc.) |
| `_ConversationParticipants` | Tabela de junção Conversation ↔ User |

#### Índices criados

| Tabela | Índice | Motivo |
|---|---|---|
| `users` | `UNIQUE (academicEmail)` | Login e unicidade de e-mail |
| `users` | `UNIQUE (username)` | Login e unicidade de username |
| `messages` | `INDEX (conversationId)` | Busca de mensagens por conversa |
| `messages` | `INDEX (senderId)` | Filtro por remetente |
| `posts` | `INDEX (authorId)` | Busca de posts de um usuário |
| `comments` | `INDEX (postId)` | Busca de comentários de um post |
| `comments` | `INDEX (authorId)` | Busca de comentários de um usuário |
| `likes` | `UNIQUE (userId, postId)` | Previne like duplicado em post |
| `likes` | `UNIQUE (userId, commentId)` | Previne like duplicado em comentário |
| `_ConversationParticipants` | `INDEX (B)` | Busca de conversas por participante |

#### Cascade configurado

| Relação | Comportamento |
|---|---|
| `Post` deletado | `Comment`, `Like`, `SavedPost` deletados em cascade |
| `Comment` deletado | `Like` do comentário deletado em cascade |
| `Conversation` deletada | `Message` deletada em cascade |

---

## Migration 2 — Índices de performance e timestamp (pendente)

**Nome sugerido:** `add_performance_indexes`

> **Esta migration ainda não foi aplicada.** Ela faz parte das otimizações de nível MÉDIO implementadas em 2026-03-20.

Se o banco já existia antes da refatoração (sem os índices e sem `createdAt` em `team_members`), esta migration adiciona os itens em cima.

### Como rodar

```bash
npx prisma migrate dev --name add_performance_indexes
```

### O que será adicionado incrementalmente

```sql
-- Índices de performance em messages
CREATE INDEX "messages_conversationId_idx" ON "messages"("conversationId");
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");

-- Índice de performance em posts
CREATE INDEX "posts_authorId_idx" ON "posts"("authorId");

-- Índices de performance em comments
CREATE INDEX "comments_postId_idx" ON "comments"("postId");
CREATE INDEX "comments_authorId_idx" ON "comments"("authorId");

-- Timestamp de auditoria em team_members
ALTER TABLE "team_members" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
```

> **Nota:** Se você está criando o banco do zero via Migration 1, tudo isso já estará incluído. A Migration 2 só é necessária para bancos existentes criados antes de 2026-03-20.

---

## Comandos de referência

```bash
# Criar e aplicar nova migration (desenvolvimento)
npx prisma migrate dev --name <nome_descritivo>

# Aplicar migrations pendentes sem criar nova (produção)
npx prisma migrate deploy

# Ver status das migrations
npx prisma migrate status

# Resetar o banco (DESTRÓI TODOS OS DADOS — apenas dev)
npx prisma migrate reset

# Regenerar o Prisma Client sem rodar migration
npx prisma generate

# Inspecionar o banco atual e sincronizar o schema (sem migrations)
npx prisma db push

# Abrir o Prisma Studio para explorar os dados
npx prisma studio
```

---

## Fluxo recomendado por ambiente

### Desenvolvimento (primeira vez)

```bash
# 1. Configure o .env com DATABASE_URL
cp .env.example .env

# 2. Crie o banco no PostgreSQL se necessário
createdb lumioo_dev

# 3. Aplique todas as migrations
npx prisma migrate dev --name init

# 4. (Opcional) Popule com dados de teste
npx prisma studio
```

### Produção / CI

```bash
# Nunca use migrate dev em produção — use deploy
npx prisma migrate deploy
```

> `migrate deploy` aplica apenas as migrations pendentes, não cria novas, não reseta o banco e não regenera o client. É seguro para rodar em pipelines de CI/CD.

---

## Troubleshooting

| Erro | Causa | Solução |
|---|---|---|
| `P1001: Can't reach database server` | `DATABASE_URL` incorreto ou banco offline | Verificar string de conexão e status do PostgreSQL |
| `P1012: Environment variable not found: DATABASE_URL` | `.env` ausente ou não carregado | Criar `.env` a partir do `.env.example` |
| `Drift detected` | Schema e banco estão fora de sincronia | Rodar `npx prisma migrate dev` para resolver o drift |
| `Migration failed` | Erro de SQL durante apply | Ver o SQL gerado em `prisma/migrations/` e corrigir manualmente se necessário |
