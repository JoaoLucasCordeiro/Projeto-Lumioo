# Lumioo API — Relatório de Análise Geral

> Gerado em: 2026-03-20
> Versão analisada: branch `main`

---

## Sumário Executivo

Foram identificados **35+ problemas** distribuídos em segurança, performance, arquitetura, tratamento de erros e inconsistências na API. A tabela abaixo resume a severidade:

| Severidade | Quantidade |
|-----------|-----------|
| 🔴 CRÍTICO | 12 |
| 🟠 ALTO    | 15 |
| 🟡 MÉDIO   | 10+ |

---

## 1. Segurança

### 🔴 CRÍTICO — Dados sensíveis expostos (hash de senha)
**Arquivo:** `src/controllers/user.controller.ts`

`getAllUsers` e `getUserById` retornam o campo `password` (hash bcrypt) na resposta JSON, pois não há `select` excluindo esse campo.

```typescript
const users = await prisma.user.findMany(); // retorna `password` para todos
```

**Correção:** Usar `select` explícito ou `omit: { password: true }` em toda query de usuário.

---

### 🔴 CRÍTICO — Falta de autorização em `DELETE /users/:id`
**Arquivo:** `src/controllers/user.controller.ts`

Qualquer usuário autenticado pode deletar a conta de qualquer outro usuário. Não há verificação de `req.user.userId === id`.

```typescript
await prisma.user.delete({ where: { id } }); // sem checar ownership
```

---

### 🔴 CRÍTICO — Socket.IO cria mensagens sem validar participação
**Arquivo:** `src/socket.ts`

No evento `sendMessage`, não há verificação se o `userId` autenticado é participante da `conversationId` enviada. Qualquer usuário autenticado pode injetar mensagens em qualquer conversa.

```typescript
// Nenhum check: conversation.participants.includes(userId)
const newMessage = await prisma.message.create({ data: { conversationId: data.conversationId, ... } });
```

---

### 🔴 CRÍTICO — `getMessagesForConversation` sem verificação de participação
**Arquivo:** `src/controllers/chat.controller.ts`

Qualquer usuário autenticado pode ler mensagens de qualquer conversa passando um `conversationId` arbitrário.

---

### 🔴 CRÍTICO — Download de work sem autenticação
**Arquivo:** `src/controllers/work.controller.ts`

O endpoint `downloadWorkById` não exige autenticação, não tem controle de acesso e retorna o PDF em base64 dentro do JSON.

```typescript
// Rota pública — qualquer pessoa baixa qualquer trabalho
res.status(200).json({ pdfFile: work.pdfFile });
```

---

### 🟠 ALTO — JWT_SECRET não validado no startup
**Arquivos:** `src/server.ts`, `src/socket.ts`

Se `JWT_SECRET` não estiver definido no `.env`, `jwt.verify` recebe `undefined` e pode aceitar qualquer token ou lançar erro não tratado.

```typescript
jwt.verify(token, process.env.JWT_SECRET as string); // sem validação prévia
```

**Correção:**
```typescript
if (!process.env.JWT_SECRET) { console.error('JWT_SECRET not set!'); process.exit(1); }
```

---

### 🟠 ALTO — Sem rate limiting em autenticação
**Arquivo:** `src/routes/auth.routes.ts`

O endpoint `POST /auth/signin` não tem proteção contra força bruta. Não há nenhum middleware de rate limiting.

---

### 🟠 ALTO — CORS sem fallback seguro
**Arquivo:** `src/server.ts`

Se `FRONTEND_URL` não estiver definido, `origin: undefined` permite requisições de qualquer origem.

```typescript
origin: process.env.FRONTEND_URL, // undefined = permite tudo
```

---

### 🟠 ALTO — Payload limit de 50 MB
**Arquivo:** `src/server.ts`

```typescript
app.use(express.json({ limit: '50mb' }));
```

Abre vetor de DoS simples via envio de payloads gigantes. Reduzir para 10 MB máximo.

---

### 🟡 MÉDIO — Sem validação de formato de email e username
**Arquivo:** `src/controllers/user.controller.ts`

Não há regex nem biblioteca de validação para verificar se `academicEmail` é um e-mail válido ou se `username` contém caracteres permitidos.

---

### 🟡 MÉDIO — Falta de validação de força de senha
**Arquivo:** `src/controllers/user.controller.ts`

A senha é hasheada diretamente sem nenhuma verificação de comprimento mínimo, letras maiúsculas ou caracteres especiais.

---

## 2. Performance

### 🔴 CRÍTICO — Múltiplas instâncias de `PrismaClient`
**Arquivos:** Todos os controllers

Cada controller instancia seu próprio `PrismaClient`:

```typescript
// Em cada arquivo de controller
const prisma = new PrismaClient();
```

Isso causa múltiplos connection pools, memory leaks e comportamento imprevisível.

**Correção:** Criar um singleton em `src/lib/prisma.ts` e importar de lá.

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
```

---

### 🔴 CRÍTICO — Falta de paginação em `getAllPosts`, `getAllWorks`, `getAllProjects`
**Arquivos:** `post.controller.ts`, `work.controller.ts`, `project.controller.ts`

Todas essas queries fazem `findMany` sem `.take()`, retornando todos os registros do banco de dados.

---

### 🔴 CRÍTICO — Falta de paginação em `getMyProfile` e `getProfileByUsername`
**Arquivo:** `src/controllers/user.controller.ts`

Os posts do usuário são carregados sem limite, incluindo `likes`, `savedBy` e `author` de cada post.

---

### 🟠 ALTO — Rota duplicada em `post.routes.ts`
**Arquivo:** `src/routes/post.routes.ts`

```typescript
router.get('/posts/:id', getPostById);                                    // linha 10
router.get('/posts/:id', optionalAuthenticateToken, getPostById);         // linha 17 — duplicada
```

A segunda definição sobrescreve a primeira. O endpoint usa `optionalAuthenticateToken` sem intenção clara.

---

### 🟠 ALTO — Array de `likes` retornado em vez de `_count`
**Arquivo:** Vários controllers

Vários endpoints carregam o array completo de likes só para contar no frontend:

```typescript
likes: { select: { userId: true } } // carrega array completo desnecessariamente
```

**Correção:** Usar `_count: { select: { likes: true } }`.

---

### 🟡 MÉDIO — Falta de índices no schema
**Arquivo:** `prisma/schema.prisma`

Campos usados em `where` sem índice explícito:
- `Message.conversationId`
- `Comment.postId`
- `SavedPost.userId`

---

### 🟡 MÉDIO — Busca com `OR` em login ineficiente
**Arquivo:** `src/controllers/auth.controller.ts`

```typescript
where: { OR: [{ academicEmail: identifier }, { username: identifier }] }
```

Poderia detectar se é e-mail e usar `findUnique` diretamente.

---

## 3. Arquitetura e Design

### 🟠 ALTO — Sem camada de validação de entrada (schema validation)
**Arquivos:** Todos os controllers

Não há uso de Zod, Joi ou similar. Validações são feitas manualmente com `if (!campo)`, sem tipos, sem tamanhos máximos e sem mensagens padronizadas.

---

### 🟠 ALTO — Sem middleware de error handler global
**Arquivo:** `src/server.ts`

Cada controller tem seu próprio `try/catch` com `console.error` e resposta manual. Não há handler centralizado para:
- Erros Prisma por código (P2025, P2002)
- Erros 500 genéricos
- Logging estruturado

---

### 🟠 ALTO — Lógica de negócio no controller
**Arquivo:** `src/controllers/chat.controller.ts`

17 linhas de deduplicação de conversas estão dentro do controller. Deveria estar em um service ou ser resolvida na query com `distinct`.

---

### 🟠 ALTO — Sem transações onde necessário
**Arquivo:** `src/controllers/comments.controller.ts`

Delete de comentário faz duas queries independentes:
```typescript
await prisma.like.deleteMany({ where: { commentId } });
await prisma.comment.delete({ where: { id: commentId } });
```

Se a segunda falhar, os likes ficam órfãos. Usar `prisma.$transaction` ou `onDelete: Cascade` no schema.

---

### 🟡 MÉDIO — `followers` e `following` sempre retornam `0`
**Arquivo:** `src/controllers/user.controller.ts`

```typescript
followers: 0, // hardcoded
following: 0, // hardcoded
```

Esses valores são fixos e enganam o cliente.

---

### 🟡 MÉDIO — Sem graceful shutdown no servidor
**Arquivo:** `src/server.ts`

Não há tratamento de `SIGTERM`/`SIGINT` para fechar conexões do Prisma e do Socket.IO antes de encerrar o processo.

---

### 🟡 MÉDIO — Sem health check endpoint

Não existe `GET /health` ou similar para monitoramento e readiness probes.

---

## 4. Problemas no Schema Prisma

### 🟠 ALTO — `Like` sem constraint XOR entre `postId` e `commentId`
**Arquivo:** `prisma/schema.prisma`

O modelo permite criar um `Like` com ambos `postId` e `commentId` null, ou com os dois preenchidos. Não há como garantir a exclusividade pelo schema.

```prisma
postId      String?
commentId   String?
// Sem CHECK: (postId IS NULL) != (commentId IS NULL)
```

---

### 🟡 MÉDIO — Sem `createdAt`/`updatedAt` em `TeamMember` e sem `updatedAt` em `SavedPost`

Ausência de timestamps dificulta auditoria e ordenação.

---

### 🟡 MÉDIO — Imagens e PDFs armazenados como base64 no banco

```prisma
avatar   String? @db.Text
image    String
pdfFile  String  @db.Text
```

Base64 é 33% maior que o binário original, degrada performance de queries e não é escalável. O padrão é usar object storage (S3, GCS) e guardar apenas a URL.

---

## 5. Tratamento de Erros

### 🟠 ALTO — Erros Prisma não diferenciados

Todos os `catch` retornam `500` genérico sem tratar erros específicos do Prisma:
- `P2002` → unique constraint → deveria retornar `409 Conflict`
- `P2025` → not found → deveria retornar `404 Not Found`
- `P1001` → banco inacessível → deveria retornar `503 Service Unavailable`

---

### 🟠 ALTO — Token inválido silenciado no `optionalAuthenticateToken`
**Arquivo:** `src/middlewares/optionalAuth.middleware.ts`

```typescript
catch (error) {
  // bloco vazio — falha silenciosa sem log
}
```

---

### 🟡 MÉDIO — Sem logging estruturado

Apenas `console.error` sem:
- Request ID para rastreabilidade
- Nível de log (debug/warn/error)
- Formato JSON para ingestão por ferramentas (Datadog, Grafana, etc.)

---

## 6. Inconsistências na API

### 🔴 CRÍTICO — Rota `GET /posts/:id` duplicada
Já descrito em Performance §2.4.

---

### 🟠 ALTO — Formato de resposta inconsistente

| Endpoint | Formato |
|---|---|
| `getFeedPosts` | `{ posts: [], nextCursor: null }` |
| `getMyProfile` | objeto flat com campos do usuário |
| `getAllPosts` | array direto `[...]` |
| `getAllWorks` | array direto `[...]` |

Sem envelope padrão, o cliente precisa tratar cada resposta diferente.

---

### 🟠 ALTO — Status codes inconsistentes

- `togglePostLike`: retorna `200` ou `201` dependendo do fluxo
- Deveria ser `200` em ambos (toggle é idempotente)

---

### 🟡 MÉDIO — Método HTTP inadequado para troca de senha

```typescript
router.put('/profile/password', authenticateToken, changePassword);
```

`PUT` é para substituição de recurso. Troca de senha é uma ação → `POST` é mais adequado.

---

## 7. Bug Específico

### 🔴 CRÍTICO — `mode: 'insensitive'` em campo não-string no Prisma
**Arquivo:** `src/controllers/project.controller.ts`

```typescript
whereClause.category = { equals: category as string, mode: 'insensitive' };
```

`mode: 'insensitive'` só é válido para campos do tipo `String` com comparações de texto livre (`contains`, `startsWith`). Usar com `equals` em um campo de enum causa erro em runtime dependendo da versão do Prisma/PostgreSQL.

**Correção:**
```typescript
whereClause.category = category as string;
```

---

## Top 5 Prioridades Imediatas

| # | Problema | Impacto |
|---|---|---|
| 1 | Singleton do `PrismaClient` | Connection pool / memory leak |
| 2 | Paginação em `findMany` sem limite | Crash por OOM em produção |
| 3 | Verificação de ownership nos endpoints PUT/DELETE | Segurança crítica |
| 4 | Remover rota duplicada `GET /posts/:id` | Bug de comportamento |
| 5 | Schema validation com Zod | Segurança + consistência |
