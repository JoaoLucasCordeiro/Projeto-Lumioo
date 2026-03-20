# Lumioo API — Documentação de Funcionalidades

**Base URL:** `/api/v1/lumioo`
**Autenticação:** Bearer Token JWT (validade de 1 dia)
**Mídia:** Imagens e PDFs armazenados como strings base64 no banco de dados

---

## Convenções

| Símbolo | Significado |
|---|---|
| `🔓` | Rota pública (sem autenticação) |
| `🔐` | Rota protegida (requer `Authorization: Bearer <token>`) |
| `🔑` | Rota com autenticação opcional (comportamento contextual) |

---

## 1. Autenticação

### `POST /auth/signin` 🔓
Autentica um usuário e retorna um JWT.

**Body:**
```json
{
  "identifier": "email@universidade.edu ou username",
  "password": "string"
}
```

**Resposta `200`:**
```json
{
  "user": { ...dadosDoUsuário },
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

> O campo `identifier` aceita tanto e-mail acadêmico quanto username.

---

## 2. Usuários

### `POST /users` 🔓
Cadastra um novo usuário.

**Body (todos obrigatórios):**
```json
{
  "fullName": "string",
  "academicEmail": "string",
  "username": "string",
  "password": "string",
  "institution": "string",
  "academicLevel": "UNDERGRADUATE | MASTER | PHD | PROFESSOR",
  "dateOfBirth": "YYYY-MM-DD"
}
```
**Resposta `201`:** objeto do usuário (sem senha).
**Erro `409`:** e-mail ou username já existe.

---

### `GET /users` 🔓
Lista todos os usuários cadastrados.

---

### `GET /users/:id` 🔓
Retorna dados de um usuário pelo ID.

---

### `DELETE /users/:id` 🔐
Remove um usuário (apenas o próprio usuário).

---

### `GET /profile` 🔐
Retorna o perfil completo do usuário autenticado, incluindo:
- Dados pessoais e acadêmicos
- Posts publicados (com contagem de likes, comentários, flags `isLiked`/`isSaved`)
- Posts salvos

---

### `PUT /profile` 🔐
Atualiza o perfil do usuário autenticado.

**Body (campos opcionais):**
```json
{
  "fullName": "string",
  "username": "string",
  "bio": "string",
  "avatar": "base64 string",
  "coverPhoto": "base64 string"
}
```

---

### `PUT /profile/password` 🔐
Altera a senha do usuário autenticado.

**Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

---

### `GET /profile/:username` 🔑
Retorna o perfil público de um usuário pelo username. Se autenticado, os campos `isLiked` e `isSaved` dos posts são preenchidos corretamente.

---

## 3. Posts (Feed Acadêmico)

### `GET /posts` 🔑
Lista todos os posts. Suporta busca por query string.

**Query params:**
- `search` — filtra por legenda, username do autor ou hashtag

---

### `GET /posts/:id` 🔓
Retorna detalhes de um post específico, incluindo comentários com seus likes.

---

### `POST /posts` 🔐
Cria um novo post.

**Body:**
```json
{
  "caption": "string (obrigatório)",
  "image": "base64 string (obrigatório)",
  "location": "string (opcional)",
  "hashtags": ["string"]
}
```

---

### `PUT /posts/:id` 🔐
Atualiza um post (apenas o autor pode editar).

**Body:** `caption`, `image`, `location`, `hashtags`

---

### `DELETE /posts/:id` 🔐
Remove um post (apenas o autor pode deletar). Resposta `204`.

---

### `GET /feed` 🔐
Retorna o feed paginado via cursor com 5 posts por página.

**Query params:**
- `cursor` — ID do último post recebido (para paginação)

**Resposta `200`:**
```json
{
  "posts": [...],
  "nextCursor": "id_do_ultimo_post | null"
}
```

Cada post inclui: `id`, `username`, `authorId`, `userImage`, `image`, `caption`, `likes`, `comments`, `timePosted`, `isLiked`, `isSaved`.

---

## 4. Comentários

### `GET /posts/:postId/comments` 🔓
Lista todos os comentários de um post em ordem cronológica.

---

### `POST /posts/:postId/comments` 🔐
Cria um comentário em um post.

**Body:**
```json
{ "text": "string" }
```

---

### `PUT /comments/:commentId` 🔐
Edita um comentário (apenas o autor).

**Body:**
```json
{ "text": "string" }
```

---

### `DELETE /comments/:commentId` 🔐
Remove um comentário e todos os seus likes associados (apenas o autor). Resposta `204`.

---

## 5. Likes (Toggle)

Ambas as rotas funcionam como **toggle**: uma chamada curte, a seguinte descurte.

### `POST /posts/:postId/like` 🔐
Curte ou descurte um post.

- **`201`** — curtido
- **`200`** — descurtido

---

### `POST /comments/:commentId/like` 🔐
Curte ou descurte um comentário.

- **`201`** — curtido
- **`200`** — descurtido

---

## 6. Posts Salvos (Bookmark)

### `POST /posts/:postId/save` 🔐
Salva ou remove um post dos favoritos (toggle).

- **`201`** — salvo
- **`200`** — removido dos salvos

---

## 7. Projetos de Pesquisa

### `GET /projects` 🔓
Lista todos os projetos. Suporta filtros via query string.

**Query params:**
- `search` — busca em título, descrição e nome do dono
- `category` — filtra por categoria (`all` ignora o filtro)
- `year` — filtra por ano de criação (`all` ignora o filtro)

**Resposta:** `id`, `title`, `description`, `category`, `year`, `image`, `members`, `institution`, `status`

---

### `GET /projects/:id` 🔓
Retorna detalhes completos de um projeto, incluindo lista de membros da equipe.

---

### `POST /projects` 🔐
Cria um novo projeto de pesquisa.

**Body:**
```json
{
  "title": "string (obrigatório)",
  "description": "string (obrigatório)",
  "category": "string (obrigatório)",
  "status": "IN_PROGRESS | COMPLETED | OPEN_FOR_APPLICATIONS (obrigatório)",
  "image": "base64 string (opcional)",
  "contactEmail": "string (obrigatório se status = OPEN_FOR_APPLICATIONS)",
  "contactPhone": "string (obrigatório se status = OPEN_FOR_APPLICATIONS)",
  "teamMembers": [
    { "name": "string", "role": "string", "photo": "base64 string (opcional)" }
  ]
}
```

---

### `PUT /projects/:id` 🔐
Atualiza um projeto (apenas o dono).

**Body:** `title`, `description`, `image`, `status`, `contactEmail`, `contactPhone`

---

### `DELETE /projects/:id` 🔐
Remove um projeto e todos os seus membros de equipe em transação atômica (apenas o dono). Resposta `204`.

---

## 8. Trabalhos Acadêmicos

### `GET /works` 🔓
Lista todos os trabalhos acadêmicos. Suporta filtros.

**Query params:**
- `search` — busca em título, resumo, autor ou keywords
- `workType` — `TCC | ARTICLE | THESIS | DISSERTATION`
- `year` — filtra por ano
- `area` — filtra por instituição

---

### `GET /works/:id` 🔓
Retorna detalhes completos de um trabalho: título, autor, tipo, área, resumo, descrição detalhada, keywords, referências, orientador, instituição, departamento, arquivo PDF (base64) e total de downloads.

---

### `GET /works/:id/download` 🔓
Incrementa o contador de downloads atomicamente e retorna o arquivo PDF (base64) com o título do trabalho.

**Resposta `200`:**
```json
{ "pdfFile": "base64 string", "title": "string" }
```

---

### `POST /works` 🔐
Publica um trabalho acadêmico.

**Body:**
```json
{
  "title": "string",
  "workType": "TCC | ARTICLE | THESIS | DISSERTATION",
  "summary": "string",
  "description": "string",
  "keywords": ["string"],
  "references": ["string"],
  "advisor": "string",
  "institution": "string",
  "department": "string (opcional)",
  "coverImage": "base64 string (opcional)",
  "pdfFile": "base64 string"
}
```

> `keywords` deve conter entre **3 e 5** itens.

---

### `PUT /works/:id` 🔐
Atualiza um trabalho (apenas o autor).

---

### `DELETE /works/:id` 🔐
Remove um trabalho (apenas o autor). Resposta `204`.

---

## 9. Chat em Tempo Real

### REST — Gerenciamento de Conversas

#### `POST /conversations` 🔐
Inicia ou retoma uma conversa direta (DM) com outro usuário.

**Body:**
```json
{ "recipientId": "string" }
```

- **`201`** — nova conversa criada
- **`200`** — conversa existente retornada

---

#### `GET /conversations` 🔐
Lista todas as conversas do usuário autenticado, ordenadas pela mais recente, com a última mensagem de cada conversa.

---

#### `GET /conversations/:conversationId` 🔐
Retorna detalhes de uma conversa específica (apenas participantes têm acesso).

---

#### `GET /conversations/:conversationId/messages` 🔐
Retorna o histórico de mensagens de uma conversa em ordem cronológica, incluindo dados do remetente (`id`, `username`, `avatar`).

---

### Socket.IO — Mensagens em Tempo Real

Conexão via Socket.IO no mesmo servidor HTTP. **Autenticação obrigatória** via `socket.handshake.auth.token`.

| Evento (cliente → servidor) | Payload | Descrição |
|---|---|---|
| `joinConversation` | `conversationId: string` | Entra na sala da conversa |
| `sendMessage` | `{ conversationId, text }` | Envia uma mensagem; persiste no banco e emite para todos na sala |

| Evento (servidor → cliente) | Payload | Descrição |
|---|---|---|
| `receiveMessage` | objeto `Message` com dados do sender | Mensagem recebida em tempo real |

---

## Resumo dos Módulos

| Módulo | Entidades | Tempo Real |
|---|---|---|
| Auth | JWT, bcrypt | — |
| Usuários | Perfil, avatar, foto de capa | — |
| Posts | Imagem, legenda, hashtags, localização | — |
| Comentários | Texto, autor | — |
| Likes | Toggle post/comentário (polimórfico) | — |
| Salvos | Bookmark de posts | — |
| Projetos | Equipe, status, candidaturas abertas | — |
| Trabalhos | PDF base64, downloads, keywords | — |
| Chat | Conversas DM, histórico REST | Socket.IO |
