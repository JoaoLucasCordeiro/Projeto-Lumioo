# Lumioo API — Documentação de Rotas

**Base URL:** `http://localhost:8080/api/v1/lumioo`

**Autenticação:** Bearer token no header `Authorization: Bearer <token>`

**Imagens e PDFs** são enviados e recebidos como strings **base64**.

**Paginação por cursor:** todas as listagens retornam `{ data: [...], nextCursor: string | null }`. Para buscar a próxima página, passe `?cursor=<nextCursor>`.

---

## Índice

- [Auth](#auth)
- [Usuários](#usuários)
- [Posts](#posts)
- [Comentários](#comentários)
- [Likes](#likes)
- [Posts Salvos](#posts-salvos)
- [Projetos](#projetos)
- [Trabalhos Acadêmicos](#trabalhos-acadêmicos)
- [Chat](#chat)
- [Seguidores e Bloqueio](#seguidores-e-bloqueio)
- [Socket.IO (Tempo Real)](#socketio-tempo-real)
- [Enums](#enums)

---

## Auth

### POST `/auth/signin`

Login. Aceita email acadêmico ou username.

**Rate limit:** 10 tentativas por 15 minutos.

**Body:**
```json
{
  "identifier": "email@exemplo.com ou username",
  "password": "string"
}
```

**Resposta 200:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "string",
    "fullName": "string",
    "academicEmail": "string",
    "username": "string",
    "institution": "string",
    "academicLevel": "UNDERGRADUATE",
    "dateOfBirth": "ISO date",
    "bio": "string | null",
    "avatar": "base64 | null",
    "coverPhoto": "base64 | null",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

**Erros:** `400` campos faltando · `401` credenciais inválidas · `429` rate limit

---

## Usuários

### POST `/users` — público

Cadastro de novo usuário.

**Body:**
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

**Resposta 201:** objeto do usuário sem senha.

**Erros:** `400` campos faltando · `409` email ou username já existe

---

### GET `/users` — público

Lista todos os usuários (sem paginação, sem senha).

**Resposta 200:** array de usuários.

---

### GET `/users/:id` — público

Busca usuário por ID.

**Resposta 200:** objeto do usuário sem senha.

**Erros:** `404` usuário não encontrado

---

### DELETE `/users/:id` — autenticado

Deleta a própria conta. Só pode deletar a si mesmo.

**Resposta 204:** sem corpo.

**Erros:** `403` tentando deletar conta de outro usuário

---

### GET `/profile` — autenticado

Retorna o perfil completo do usuário logado com posts e posts salvos.

**Resposta 200:**
```json
{
  "fullName": "string",
  "username": "string",
  "email": "string",
  "institution": "string",
  "academicLevel": "string",
  "birthDate": "ISO date",
  "joinDate": "ISO date",
  "bio": "string",
  "avatar": "base64 | null",
  "coverPhoto": "base64 | null",
  "followers": 0,
  "following": 0,
  "posts": 0,
  "userPosts": [{ "id": "...", "username": "...", "authorId": "...", "userImage": "base64|null", "image": "base64|null", "caption": "...", "likes": 0, "comments": 0, "timePosted": "ISO date", "isLiked": false, "isSaved": false }],
  "savedPosts": [{ "id": "...", "username": "...", "authorId": "...", "userImage": "base64|null", "image": "base64|null", "caption": "...", "likes": 0, "comments": 0, "timePosted": "ISO date", "isLiked": false, "isSaved": true }]
}
```

---

### PUT `/profile` — autenticado

Atualiza o perfil do usuário logado.

**Body (todos opcionais):**
```json
{
  "fullName": "string",
  "username": "string",
  "bio": "string",
  "avatar": "base64",
  "coverPhoto": "base64"
}
```

**Resposta 200:** objeto do usuário atualizado sem senha.

**Erros:** `409` username já em uso por outro usuário

---

### POST `/profile/password` — autenticado

Altera a senha do usuário logado.

**Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Resposta 200:** `{ "message": "Senha alterada com sucesso." }`

**Erros:** `400` campos faltando · `401` senha atual incorreta

---

### GET `/profile/:username` — auth opcional

Perfil público de um usuário pelo username.

> Se houver token e existir bloqueio ativo (em qualquer direção) entre o usuário logado e o perfil buscado, retorna **404**.

**Resposta 200:**
```json
{
  "id": "string",
  "fullName": "string",
  "username": "string",
  "institution": "string",
  "academicLevel": "string",
  "joinDate": "ISO date",
  "bio": "string",
  "avatar": "base64 | null",
  "coverPhoto": "base64 | null",
  "posts": 0,
  "followers": 0,
  "following": 0,
  "isFollowing": false,
  "isBlocked": false,
  "userPosts": [...],
  "savedPosts": []
}
```

> `isFollowing` e `isBlocked` são sempre `false` quando a requisição não tem token. `isBlocked` sempre será `false` na resposta — se houvesse bloqueio ativo, a API retornaria 404.

---

## Posts

### GET `/posts` — auth opcional

Lista todos os posts com paginação por cursor.

**Query params:**
| Param | Tipo | Descrição |
|---|---|---|
| `search` | string | Filtra por caption, username do autor ou hashtag |
| `cursor` | string | ID do último post retornado |

**Resposta 200:**
```json
{
  "posts": [{
    "id": "string",
    "username": "string",
    "authorId": "string",
    "userImage": "base64 | null",
    "image": "base64 | null",
    "caption": "string",
    "likes": 0,
    "comments": 0,
    "timePosted": "ISO date",
    "isLiked": false,
    "isSaved": false
  }],
  "nextCursor": "string | null"
}
```

Limite: **20 posts** por página.

---

### GET `/feed` — autenticado

Feed do usuário logado (todos os posts, ordenados por data). Mesmo formato de `/posts`.

Limite: **5 posts** por página.

---

### POST `/posts` — autenticado

Cria um novo post.

**Body:**
```json
{
  "caption": "string (obrigatório)",
  "image": "base64 (opcional)",
  "location": "string (opcional)",
  "hashtags": ["string"] 
}
```

**Resposta 201:**
```json
{
  "id": "string",
  "caption": "string",
  "image": "base64 | null",
  "location": "string | null",
  "hashtags": [],
  "authorId": "string",
  "createdAt": "ISO date"
}
```

---

### GET `/posts/:id` — auth opcional

Detalhes de um post com comentários.

**Resposta 200:**
```json
{
  "id": "string",
  "username": "string",
  "authorId": "string",
  "userImage": "base64 | null",
  "image": "base64 | null",
  "caption": "string",
  "likes": 0,
  "timePosted": "ISO date",
  "isLiked": false,
  "isSaved": false,
  "comments": [{
    "id": "string",
    "username": "string",
    "authorId": "string",
    "userImage": "base64 | null",
    "text": "string",
    "timePosted": "ISO date",
    "likes": 0,
    "isLiked": false
  }]
}
```

---

### PUT `/posts/:id` — autenticado

Atualiza um post. Apenas o autor pode atualizar.

**Body (todos opcionais):**
```json
{
  "caption": "string",
  "image": "base64",
  "location": "string",
  "hashtags": ["string"]
}
```

**Resposta 200:** objeto do post atualizado.

**Erros:** `403` não autorizado · `404` post não encontrado

---

### DELETE `/posts/:id` — autenticado

Deleta um post. Apenas o autor pode deletar.

**Resposta 204:** sem corpo.

**Erros:** `403` não autorizado · `404` post não encontrado

---

## Comentários

### POST `/posts/:postId/comments` — autenticado

Cria um comentário em um post.

**Body:**
```json
{
  "text": "string (obrigatório)"
}
```

**Resposta 201:**
```json
{
  "id": "string",
  "text": "string",
  "authorId": "string",
  "username": "string",
  "userImage": "/default-user.png",
  "timePosted": "ISO date",
  "likes": 0,
  "isLiked": false
}
```

---

### GET `/posts/:postId/comments` — público

Lista todos os comentários de um post, ordenados por data de criação (mais antigo primeiro).

**Resposta 200:** array de comentários.

---

### PUT `/comments/:commentId` — autenticado

Atualiza um comentário. Apenas o autor pode editar.

**Body:**
```json
{
  "text": "string (obrigatório)"
}
```

**Resposta 200:** objeto do comentário atualizado.

**Erros:** `403` não autorizado · `404` comentário não encontrado

---

### DELETE `/comments/:commentId` — autenticado

Deleta um comentário. Apenas o autor pode deletar.

**Resposta 204:** sem corpo.

**Erros:** `403` não autorizado · `404` comentário não encontrado

---

## Likes

### POST `/posts/:postId/like` — autenticado

Toggle de like em um post (dar/remover like com a mesma rota).

**Resposta 200:**
```json
{ "message": "Post liked successfully." }
// ou
{ "message": "Post unliked successfully." }
```

---

### POST `/comments/:commentId/like` — autenticado

Toggle de like em um comentário.

**Resposta 200:**
```json
{ "message": "Comment liked successfully." }
// ou
{ "message": "Comment unliked successfully." }
```

---

## Posts Salvos

### POST `/posts/:postId/save` — autenticado

Toggle de salvar/remover um post salvo.

**Resposta 200/201:**
```json
{ "message": "Post saved successfully." }
// ou
{ "message": "Post unsaved successfully." }
```

---

## Projetos

### GET `/projects` — público

Lista projetos com filtros e paginação por cursor.

**Query params:**
| Param | Tipo | Descrição |
|---|---|---|
| `search` | string | Filtra por título, descrição ou nome do dono |
| `category` | string | Filtra por categoria (ex: `Saúde`) |
| `year` | string | Filtra por ano de criação (ex: `2024`) |
| `cursor` | string | ID do último projeto retornado |

**Resposta 200:**
```json
{
  "projects": [{
    "id": "string",
    "title": "string",
    "description": "string",
    "category": "string",
    "year": "2024",
    "image": "base64 | null",
    "members": 3,
    "institution": "string (fullName do dono)",
    "status": "IN_PROGRESS | COMPLETED | OPEN_FOR_APPLICATIONS"
  }],
  "nextCursor": "string | null"
}
```

Limite: **20 projetos** por página.

---

### GET `/projects/:id` — público

Detalhes de um projeto com equipe completa.

**Resposta 200:**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "detailedDescription": "string",
  "category": "string",
  "year": "string",
  "image": "base64 | null",
  "members": 0,
  "author": "string (fullName)",
  "authorUsername": "string",
  "institution": "string",
  "status": "string",
  "team": [{ "name": "string", "role": "string", "photo": "base64 | null" }],
  "publications": [],
  "ownerId": "string"
}
```

---

### POST `/projects` — autenticado

Cria um novo projeto.

**Body:**
```json
{
  "title": "string (obrigatório)",
  "description": "string (obrigatório)",
  "category": "string (obrigatório)",
  "status": "IN_PROGRESS | COMPLETED | OPEN_FOR_APPLICATIONS (obrigatório)",
  "teamMembers": [
    { "name": "string", "role": "string", "photo": "base64 (opcional)" }
  ],
  "image": "base64 (opcional)",
  "contactEmail": "string (obrigatório se status = OPEN_FOR_APPLICATIONS)",
  "contactPhone": "string (obrigatório se status = OPEN_FOR_APPLICATIONS)"
}
```

**Regras de negócio:**
- `teamMembers` deve ser um array não-vazio.
- Se `status = OPEN_FOR_APPLICATIONS`, `contactEmail` e `contactPhone` são obrigatórios.

**Resposta 201:** objeto do projeto com `teamMembers`.

---

### PUT `/projects/:id` — autenticado

Atualiza um projeto. Apenas o dono pode editar.

**Body (todos opcionais):**
```json
{
  "title": "string",
  "description": "string",
  "image": "base64",
  "status": "string",
  "contactEmail": "string",
  "contactPhone": "string"
}
```

**Resposta 200:** objeto do projeto atualizado com `teamMembers`.

**Erros:** `403` não autorizado · `404` projeto não encontrado

---

### DELETE `/projects/:id` — autenticado

Deleta um projeto e seus membros de equipe (cascata). Apenas o dono pode deletar.

**Resposta 204:** sem corpo.

**Erros:** `403` não autorizado · `404` projeto não encontrado

---

## Trabalhos Acadêmicos

### GET `/works` — público

Lista trabalhos com filtros e paginação por cursor.

**Query params:**
| Param | Tipo | Descrição |
|---|---|---|
| `search` | string | Filtra por título, resumo, nome do autor ou keyword |
| `workType` | string | `TCC`, `ARTICLE`, `THESIS`, `DISSERTATION` |
| `year` | string | Ano de criação (ex: `2024`) |
| `area` | string | Filtra por institution do trabalho |
| `cursor` | string | ID do último trabalho retornado |

**Resposta 200:**
```json
{
  "works": [{
    "id": "string",
    "title": "string",
    "author": "string (fullName)",
    "type": "TCC | ARTICLE | THESIS | DISSERTATION",
    "area": "string (institution)",
    "year": "string",
    "abstract": "string (resumo)",
    "keywords": ["string"],
    "downloads": 0,
    "image": "base64 | null"
  }],
  "nextCursor": "string | null"
}
```

Limite: **20 trabalhos** por página.

---

### GET `/works/:id` — público

Detalhes de um trabalho acadêmico.

**Resposta 200:**
```json
{
  "id": "string",
  "title": "string",
  "author": "string (fullName)",
  "authorUsername": "string",
  "type": "string",
  "area": "string",
  "year": "string",
  "abstract": "string",
  "detailedDescription": "string",
  "keywords": ["string"],
  "downloads": 0,
  "fileUrl": "base64 (PDF)",
  "image": "base64 | null",
  "advisor": "string",
  "institution": "string",
  "department": "string | null",
  "references": ["string"]
}
```

---

### GET `/works/:id/download` — autenticado

Incrementa o contador de downloads e retorna o PDF.

**Resposta 200:**
```json
{
  "pdfFile": "base64",
  "title": "string"
}
```

---

### POST `/works` — autenticado

Publica um trabalho acadêmico.

**Body:**
```json
{
  "title": "string (obrigatório)",
  "workType": "TCC | ARTICLE | THESIS | DISSERTATION (obrigatório)",
  "summary": "string (obrigatório)",
  "description": "string (obrigatório)",
  "keywords": ["string", "string", "string"],
  "references": ["string"],
  "advisor": "string (obrigatório)",
  "institution": "string (obrigatório)",
  "pdfFile": "base64 (obrigatório)",
  "coverImage": "base64 (opcional)",
  "department": "string (opcional)"
}
```

**Regras de negócio:**
- `keywords` deve ter entre **3 e 5** itens.
- `references` deve ser um array (pode ser vazio).

**Resposta 201:** objeto do trabalho criado.

---

### PUT `/works/:id` — autenticado

Atualiza um trabalho. Apenas o autor pode editar.

**Body (todos opcionais):** mesmos campos do POST.

**Resposta 200:** objeto do trabalho atualizado.

**Erros:** `403` não autorizado · `404` trabalho não encontrado

---

### DELETE `/works/:id` — autenticado

Deleta um trabalho. Apenas o autor pode deletar.

**Resposta 204:** sem corpo.

**Erros:** `403` não autorizado · `404` trabalho não encontrado

---

## Chat

### POST `/conversations` — autenticado

Inicia ou encontra uma conversa DM com outro usuário. Idempotente: se a conversa já existe, a retorna.

**Body:**
```json
{
  "recipientId": "string (obrigatório)"
}
```

**Resposta 200** (existente) ou **201** (nova):
```json
{
  "id": "string",
  "createdAt": "ISO date",
  "updatedAt": "ISO date",
  "participants": [{ "id": "string", "username": "string", "avatar": "base64|null", "fullName": "string" }]
}
```

> `participants` retorna apenas o **outro** usuário da conversa (sem o logado).

**Erros:** `400` tentando conversar consigo mesmo

---

### GET `/conversations` — autenticado

Lista todas as conversas do usuário logado, ordenadas pela mais recente.

**Resposta 200:** array de conversas, cada uma com `participants` (sem o logado) e `messages` (último mensagem).

---

### GET `/conversations/:conversationId` — autenticado

Detalhes de uma conversa. Só participantes têm acesso.

**Resposta 200:** objeto da conversa com `participants` (sem o logado).

**Erros:** `403` não é participante · `404` conversa não encontrada

---

### GET `/conversations/:conversationId/messages` — autenticado

Histórico completo de mensagens de uma conversa. Só participantes têm acesso.

**Resposta 200:** array de mensagens com `sender` (`id`, `username`, `avatar`), ordenadas por data (mais antiga primeiro).

---

## Seguidores e Bloqueio

### POST `/follow/:userId` — autenticado

Segue um usuário.

**Regras de negócio:**
- Não pode seguir a si mesmo.
- Não pode seguir se há bloqueio ativo em qualquer direção entre os usuários.

**Resposta 201:** `{ "message": "User followed successfully." }`

**Erros:** `400` seguindo a si mesmo · `403` bloqueio ativo · `404` usuário não encontrado · `409` já está seguindo

---

### DELETE `/follow/:userId` — autenticado

Deixa de seguir um usuário.

**Resposta 200:** `{ "message": "User unfollowed successfully." }`

**Erros:** `404` não estava seguindo

---

### GET `/users/:userId/followers` — público

Lista os seguidores de um usuário. Paginação por cursor.

**Query params:** `cursor` (ID do seguidor)

**Resposta 200:**
```json
{
  "users": [{
    "id": "string",
    "username": "string",
    "fullName": "string",
    "avatar": "base64 | null",
    "institution": "string",
    "academicLevel": "string"
  }],
  "nextCursor": "string | null"
}
```

Limite: **20** por página.

---

### GET `/users/:userId/following` — público

Lista quem um usuário segue. Mesmo formato de `/followers`.

---

### POST `/block/:userId` — autenticado

Bloqueia um usuário.

**Regras de negócio:**
- Não pode bloquear a si mesmo.
- **Remove automaticamente** os follows nas duas direções (A→B e B→A) em uma transação atômica.

**Resposta 201:** `{ "message": "User blocked successfully." }`

**Erros:** `400` bloqueando a si mesmo · `404` usuário não encontrado · `409` já está bloqueado

---

### DELETE `/block/:userId` — autenticado

Desbloqueia um usuário.

**Resposta 200:** `{ "message": "User unblocked successfully." }`

**Erros:** `404` usuário não estava bloqueado

---

### GET `/blocked` — autenticado

Lista os usuários bloqueados pelo usuário logado. Mesmo formato de `/followers`.

---

## Socket.IO (Tempo Real)

**Conexão:** `ws://localhost:8080`

**Autenticação na conexão:**
```js
const socket = io('http://localhost:8080', {
  auth: { token: 'Bearer <jwt_token>' }
});
```

### Eventos emitidos pelo cliente

| Evento | Payload | Descrição |
|---|---|---|
| `joinConversation` | `{ conversationId: string }` | Entra na sala da conversa |
| `sendMessage` | `{ conversationId: string, text: string }` | Envia uma mensagem |

### Eventos recebidos pelo cliente

| Evento | Payload | Descrição |
|---|---|---|
| `newMessage` | objeto da mensagem | Nova mensagem na conversa |

---

## Enums

### `academicLevel`
```
UNDERGRADUATE  — Graduação
MASTER         — Mestrado
PHD            — Doutorado
PROFESSOR      — Professor
```

### `ProjectStatus`
```
IN_PROGRESS          — Em andamento
COMPLETED            — Concluído
OPEN_FOR_APPLICATIONS — Aberto para aplicações
```

### `WorkType`
```
TCC           — Trabalho de Conclusão de Curso
ARTICLE       — Artigo
THESIS        — Tese
DISSERTATION  — Dissertação
```
