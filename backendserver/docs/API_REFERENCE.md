# Lumioo API — Referência Completa

> **Base URL:** `http://localhost:8080/api/v1/lumioo`
> **Content-Type:** `application/json`
> **Autenticação:** Bearer Token JWT no header `Authorization: Bearer <token>`
> **Limite de payload:** 10 MB (necessário para imagens/PDFs em base64)

---

## Convenções

| Símbolo | Significado |
|---------|-------------|
| 🔓 | Rota pública — sem autenticação |
| 🔐 | Rota protegida — requer `Authorization: Bearer <token>` |
| 🔑 | Rota com auth opcional — funciona sem token, mas com token retorna dados personalizados (ex: `isLiked`, `isSaved`) |

### Paginação por cursor

Os endpoints de listagem (`GET /posts`, `GET /feed`, `GET /projects`, `GET /works`) utilizam **cursor-based pagination**:

- A resposta inclui `nextCursor: string | null`
- Para buscar a próxima página, passe `?cursor=<nextCursor>`
- Quando `nextCursor` é `null`, não há mais páginas

---

## 1. Autenticação

### `POST /auth/signin` 🔓

Autentica um usuário. Aceita e-mail acadêmico **ou** username.

> **Rate limit:** 10 tentativas a cada 15 minutos por IP.

**Request body:**
```json
{
  "identifier": "joao@univ.edu.br",
  "password": "minhasenha123"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `identifier` | string | ✅ | E-mail acadêmico ou username |
| `password` | string | ✅ | Senha do usuário |

**Response `200 OK`:**
```json
{
  "user": {
    "id": "clxxx...",
    "fullName": "João Lima",
    "academicEmail": "joao@univ.edu.br",
    "username": "joao_lima",
    "institution": "Universidade Federal",
    "academicLevel": "UNDERGRADUATE",
    "dateOfBirth": "2000-05-15T00:00:00.000Z",
    "bio": "Estudante de Computação",
    "avatar": "data:image/jpeg;base64,...",
    "coverPhoto": null,
    "createdAt": "2024-01-10T12:00:00.000Z",
    "updatedAt": "2024-01-10T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> O token JWT tem validade de **1 dia**. Armazene-o de forma segura (AsyncStorage no mobile).

**Erros:**
| Status | Mensagem |
|--------|----------|
| `400` | `"Email/username and password are required."` |
| `401` | `"Invalid credentials."` |
| `429` | `"Too many login attempts. Try again in 15 minutes."` |

---

## 2. Usuários

### `POST /users` 🔓

Cria uma nova conta de usuário.

**Request body:**
```json
{
  "fullName": "João Lima",
  "academicEmail": "joao@univ.edu.br",
  "username": "joao_lima",
  "password": "minhasenha123",
  "institution": "Universidade Federal",
  "academicLevel": "UNDERGRADUATE",
  "dateOfBirth": "2000-05-15"
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `fullName` | string | ✅ | 1–100 caracteres |
| `academicEmail` | string | ✅ | E-mail válido, único |
| `username` | string | ✅ | 3–30 chars, apenas letras/números/`_`, único |
| `password` | string | ✅ | Mínimo 8 caracteres |
| `institution` | string | ✅ | 1–200 caracteres |
| `academicLevel` | string | ✅ | `UNDERGRADUATE` \| `MASTER` \| `PHD` \| `PROFESSOR` |
| `dateOfBirth` | string | ✅ | Data no formato ISO (ex: `"2000-05-15"`) |

**Response `201 Created`:** Objeto do usuário sem o campo `password`.

**Erros:**
| Status | Mensagem |
|--------|----------|
| `400` | `"All fields are required."` ou erros de validação do schema |
| `409` | `"Email or username already exists."` |

---

### `GET /users` 🔓

Lista todos os usuários (sem senha).

**Response `200 OK`:**
```json
[
  {
    "id": "clxxx...",
    "fullName": "João Lima",
    "username": "joao_lima",
    "academicEmail": "joao@univ.edu.br",
    "institution": "Universidade Federal",
    "academicLevel": "UNDERGRADUATE",
    "dateOfBirth": "2000-05-15T00:00:00.000Z",
    "bio": "Estudante de Computação",
    "avatar": null,
    "createdAt": "2024-01-10T12:00:00.000Z",
    "updatedAt": "2024-01-10T12:00:00.000Z"
  }
]
```

---

### `GET /users/:id` 🔓

Retorna um usuário pelo ID (sem senha).

**Parâmetros de rota:** `id` — ID do usuário (cuid)

**Response `200 OK`:** Mesmo objeto acima.

**Erros:** `404` — `"User not found."`

---

### `DELETE /users/:id` 🔐

Deleta a própria conta. Só é possível deletar a conta do próprio usuário autenticado.

**Parâmetros de rota:** `id` — deve ser igual ao ID do token JWT

**Response `204 No Content`**

**Erros:**
| Status | Mensagem |
|--------|----------|
| `403` | `"Forbidden: You can only delete your own account."` |
| `404` | `"User not found."` |

---

### `GET /profile` 🔐

Retorna o perfil completo do usuário autenticado, incluindo posts e posts salvos.

**Response `200 OK`:**
```json
{
  "fullName": "João Lima",
  "username": "joao_lima",
  "email": "joao@univ.edu.br",
  "institution": "Universidade Federal",
  "academicLevel": "UNDERGRADUATE",
  "birthDate": "2000-05-15T00:00:00.000Z",
  "joinDate": "2024-01-10T12:00:00.000Z",
  "bio": "",
  "avatar": null,
  "coverPhoto": null,
  "followers": 0,
  "following": 0,
  "posts": 3,
  "userPosts": [
    {
      "id": "clxxx...",
      "username": "joao_lima",
      "authorId": "clyyy...",
      "userImage": null,
      "image": "data:image/jpeg;base64,...",
      "caption": "Meu primeiro post!",
      "likes": 12,
      "comments": 3,
      "timePosted": "2024-06-01T10:00:00.000Z",
      "isLiked": false,
      "isSaved": true
    }
  ],
  "savedPosts": [
    {
      "id": "clzzz...",
      "username": "maria_silva",
      "authorId": "clwww...",
      "userImage": null,
      "image": "data:image/jpeg;base64,...",
      "caption": "Post salvo",
      "likes": 5,
      "comments": 1,
      "timePosted": "2024-06-02T10:00:00.000Z",
      "isLiked": false,
      "isSaved": true
    }
  ]
}
```

> `followers` e `following` retornam `0` (funcionalidade não implementada ainda).

---

### `PUT /profile` 🔐

Atualiza o perfil do usuário autenticado.

**Request body (todos opcionais):**
```json
{
  "fullName": "João Lima Atualizado",
  "username": "novo_username",
  "bio": "Nova bio aqui",
  "avatar": "data:image/jpeg;base64,...",
  "coverPhoto": "data:image/jpeg;base64,..."
}
```

> **Imagens:** Envie como string base64 com o prefixo `data:image/jpeg;base64,...` ou similar.
> Tamanho máximo do payload: 10 MB.

**Response `200 OK`:** Objeto do usuário atualizado (sem senha).

**Erros:**
| Status | Mensagem |
|--------|----------|
| `409` | `"Username already taken."` |

---

### `POST /profile/password` 🔐

Altera a senha do usuário autenticado.

**Request body:**
```json
{
  "currentPassword": "senhaAtual123",
  "newPassword": "novaSenha456"
}
```

**Response `200 OK`:**
```json
{ "message": "Senha alterada com sucesso." }
```

**Erros:**
| Status | Mensagem |
|--------|----------|
| `400` | `"Senha atual e nova senha são obrigatórias."` |
| `401` | `"A senha atual está incorreta."` |
| `404` | `"Usuário não encontrado."` |

---

### `GET /profile/:username` 🔑

Retorna o perfil público de qualquer usuário pelo username. Se autenticado, inclui `isLiked` e `isSaved` nos posts.

**Parâmetros de rota:** `username` — username do usuário

**Response `200 OK`:**
```json
{
  "id": "clxxx...",
  "fullName": "Maria Silva",
  "username": "maria_silva",
  "institution": "USP",
  "academicLevel": "MASTER",
  "joinDate": "2024-01-10T12:00:00.000Z",
  "bio": "Pesquisadora em IA",
  "avatar": null,
  "coverPhoto": null,
  "posts": 5,
  "followers": 0,
  "following": 0,
  "userPosts": [ /* mesma estrutura de POST acima */ ],
  "savedPosts": []
}
```

> `savedPosts` sempre retorna `[]` em perfis públicos.

**Erros:**
| Status | Mensagem |
|--------|----------|
| `404` | `"Profile not found."` |

---

## 3. Posts

### `GET /posts` 🔑

Lista todos os posts com paginação por cursor. Suporta busca.

**Query params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `cursor` | string | ID do último post recebido (para próxima página) |
| `search` | string | Busca por caption, username do autor ou hashtag (case-insensitive) |

**Response `200 OK`:**
```json
{
  "posts": [
    {
      "id": "clxxx...",
      "username": "joao_lima",
      "authorId": "clyyy...",
      "userImage": null,
      "image": "data:image/jpeg;base64,...",
      "caption": "Meu post de pesquisa #ciencia",
      "likes": 42,
      "comments": 7,
      "timePosted": "2024-06-01T10:00:00.000Z",
      "isLiked": false,
      "isSaved": false
    }
  ],
  "nextCursor": "clzzz..."
}
```

> Limite: 20 posts por página.

---

### `GET /feed` 🔐

Retorna o feed de posts do usuário autenticado (todos os posts ordenados por data), com paginação.

**Query params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `cursor` | string | ID do último post recebido |

**Response `200 OK`:**
```json
{
  "posts": [ /* mesma estrutura acima, com isLiked e isSaved do usuário */ ],
  "nextCursor": "clzzz..."
}
```

> Limite: 5 posts por página.

---

### `POST /posts` 🔐

Cria um novo post.

**Request body:**
```json
{
  "caption": "Meu post de pesquisa!",
  "image": "data:image/jpeg;base64,...",
  "location": "São Paulo, SP",
  "hashtags": ["ciencia", "pesquisa"]
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `caption` | string | ✅ | 1–2000 caracteres |
| `image` | string | ✅ | Base64 da imagem |
| `location` | string | ❌ | Máximo 200 caracteres |
| `hashtags` | string[] | ❌ | Array de strings (padrão: `[]`) |

**Response `201 Created`:**
```json
{
  "id": "clxxx...",
  "caption": "Meu post de pesquisa!",
  "image": "data:image/jpeg;base64,...",
  "location": "São Paulo, SP",
  "hashtags": ["ciencia", "pesquisa"],
  "authorId": "clyyy...",
  "createdAt": "2024-06-01T10:00:00.000Z"
}
```

---

### `GET /posts/:id` 🔑

Retorna um post com todos os comentários.

**Response `200 OK`:**
```json
{
  "id": "clxxx...",
  "username": "joao_lima",
  "authorId": "clyyy...",
  "userImage": null,
  "image": "data:image/jpeg;base64,...",
  "caption": "Meu post!",
  "likes": 10,
  "timePosted": "2024-06-01T10:00:00.000Z",
  "isLiked": false,
  "isSaved": false,
  "comments": [
    {
      "id": "clccc...",
      "username": "maria_silva",
      "authorId": "clmmm...",
      "userImage": null,
      "text": "Que post incrível!",
      "timePosted": "2024-06-01T11:00:00.000Z",
      "likes": 2,
      "isLiked": false
    }
  ]
}
```

---

### `PUT /posts/:id` 🔐

Atualiza um post. Somente o autor pode editar.

**Request body (todos opcionais):**
```json
{
  "caption": "Caption atualizada",
  "image": "data:image/jpeg;base64,...",
  "location": "Rio de Janeiro",
  "hashtags": ["novo", "hashtag"]
}
```

**Response `200 OK`:** Objeto do post atualizado.

**Erros:**
| Status | Mensagem |
|--------|----------|
| `403` | `"You are not authorized to update this post."` |
| `404` | `"Post not found."` |

---

### `DELETE /posts/:id` 🔐

Deleta um post. Somente o autor pode deletar.

**Response `204 No Content`**

**Erros:**
| Status | Mensagem |
|--------|----------|
| `403` | `"You are not authorized to delete this post."` |
| `404` | `"Post not found."` |

---

## 4. Comentários

### `POST /posts/:postId/comments` 🔐

Cria um comentário em um post.

**Parâmetros de rota:** `postId` — ID do post

**Request body:**
```json
{
  "text": "Excelente pesquisa!"
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `text` | string | ✅ | 1–500 caracteres |

**Response `201 Created`:**
```json
{
  "id": "clccc...",
  "text": "Excelente pesquisa!",
  "authorId": "clyyy...",
  "username": "joao_lima",
  "userImage": "/default-user.png",
  "timePosted": "2024-06-01T11:00:00.000Z",
  "likes": 0,
  "isLiked": false
}
```

---

### `GET /posts/:postId/comments` 🔓

Retorna todos os comentários de um post, ordenados do mais antigo ao mais novo.

**Response `200 OK`:**
```json
[
  {
    "id": "clccc...",
    "text": "Ótimo post!",
    "createdAt": "2024-06-01T11:00:00.000Z",
    "updatedAt": "2024-06-01T11:00:00.000Z",
    "authorId": "clyyy...",
    "postId": "clppp...",
    "author": {
      "username": "joao_lima"
    }
  }
]
```

---

### `PUT /comments/:commentId` 🔐

Edita um comentário. Somente o autor pode editar.

**Request body:**
```json
{ "text": "Texto corrigido" }
```

**Response `200 OK`:** Objeto do comentário atualizado (mesmo formato do `POST`).

**Erros:**
| Status | Mensagem |
|--------|----------|
| `400` | `"Comment text is required."` |
| `403` | `"User not authorized to edit this comment."` |
| `404` | `"Comment not found."` |

---

### `DELETE /comments/:commentId` 🔐

Deleta um comentário. Somente o autor pode deletar.

**Response `204 No Content`**

**Erros:**
| Status | Mensagem |
|--------|----------|
| `403` | `"User not authorized to delete this comment."` |
| `404` | `"Comment not found."` |

---

## 5. Likes

> Ambas as rotas são **toggle**: se o like existe, remove; se não existe, cria.

### `POST /posts/:postId/like` 🔐

Like/unlike em um post.

**Response `200 OK`:**
```json
{ "message": "Post liked successfully." }
// ou
{ "message": "Post unliked successfully." }
```

---

### `POST /comments/:commentId/like` 🔐

Like/unlike em um comentário.

**Response `200 OK`:**
```json
{ "message": "Comment liked successfully." }
// ou
{ "message": "Comment unliked successfully." }
```

---

## 6. Posts Salvos

### `POST /posts/:postId/save` 🔐

Salva/remove um post dos salvos (toggle).

**Response:**
- `201 Created` — `{ "message": "Post saved successfully." }` (quando salva)
- `200 OK` — `{ "message": "Post unsaved successfully." }` (quando remove)

---

## 7. Projetos

### `GET /projects` 🔓

Lista projetos com paginação e filtros.

**Query params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `cursor` | string | Cursor de paginação |
| `search` | string | Busca por título, descrição ou nome do autor |
| `category` | string | Filtra por categoria (ex: `"Computação"`) — use `"all"` para ignorar |
| `year` | string | Filtra por ano de criação (ex: `"2024"`) — use `"all"` para ignorar |

**Response `200 OK`:**
```json
{
  "projects": [
    {
      "id": "clppp...",
      "title": "IA para Diagnóstico Médico",
      "description": "Projeto de pesquisa em IA aplicada...",
      "category": "Computação",
      "year": "2024",
      "image": null,
      "members": 3,
      "institution": "Dr. Carlos Mendes",
      "status": "IN_PROGRESS"
    }
  ],
  "nextCursor": "clqqq..."
}
```

> **Nota:** O campo `institution` na listagem contém o `fullName` do dono do projeto (comportamento atual da API).

---

### `GET /projects/:id` 🔓

Retorna os detalhes completos de um projeto.

**Response `200 OK`:**
```json
{
  "id": "clppp...",
  "title": "IA para Diagnóstico Médico",
  "description": "Descrição do projeto...",
  "detailedDescription": "Descrição do projeto...",
  "category": "Computação",
  "year": "2024",
  "image": null,
  "members": 3,
  "author": "Dr. Carlos Mendes",
  "authorUsername": "carlos_mendes",
  "institution": "Universidade Federal",
  "status": "IN_PROGRESS",
  "team": [
    {
      "name": "João Lima",
      "role": "Desenvolvedor",
      "photo": null
    }
  ],
  "publications": [],
  "ownerId": "clyyy..."
}
```

---

### `POST /projects` 🔐

Cria um novo projeto.

**Request body:**
```json
{
  "title": "IA para Diagnóstico",
  "description": "Descrição detalhada do projeto",
  "category": "Computação",
  "image": "data:image/jpeg;base64,...",
  "status": "IN_PROGRESS",
  "contactEmail": "contato@univ.edu.br",
  "contactPhone": "(11) 99999-9999",
  "teamMembers": [
    {
      "name": "João Lima",
      "role": "Líder",
      "photo": null
    },
    {
      "name": "Maria Silva",
      "role": "Desenvolvedora",
      "photo": null
    }
  ]
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `title` | string | ✅ | 1–200 caracteres |
| `description` | string | ✅ | Min 1 caractere |
| `category` | string | ✅ | 1–100 caracteres |
| `image` | string | ❌ | Base64 da imagem |
| `status` | string | ✅ | `IN_PROGRESS` \| `COMPLETED` \| `OPEN_FOR_APPLICATIONS` (case-insensitive) |
| `contactEmail` | string | ⚠️ | Obrigatório se `status = OPEN_FOR_APPLICATIONS` |
| `contactPhone` | string | ⚠️ | Obrigatório se `status = OPEN_FOR_APPLICATIONS` |
| `teamMembers` | array | ✅ | Pelo menos 1 membro |
| `teamMembers[].name` | string | ✅ | 1–100 caracteres |
| `teamMembers[].role` | string | ✅ | 1–100 caracteres |
| `teamMembers[].photo` | string | ❌ | Base64 ou null |

**Response `201 Created`:** Objeto completo do projeto com `teamMembers`.

---

### `PUT /projects/:id` 🔐

Atualiza um projeto. Somente o dono pode editar.

**Request body (todos opcionais):**
```json
{
  "title": "Novo título",
  "description": "Nova descrição",
  "image": "data:image/jpeg;base64,...",
  "status": "COMPLETED",
  "contactEmail": "novo@email.com",
  "contactPhone": "(11) 88888-8888"
}
```

> **Atenção:** Esta rota NÃO atualiza `teamMembers`.

**Response `200 OK`:** Projeto atualizado com `teamMembers` (formato raw do Prisma, não o formato formatado de `GET /projects/:id`).

**Erros:**
| Status | Mensagem |
|--------|----------|
| `403` | `"You are not authorized to update this project."` |
| `404` | `"Project not found."` |

---

### `DELETE /projects/:id` 🔐

Deleta um projeto e todos os seus membros de equipe. Somente o dono pode deletar.

**Response `204 No Content`**

**Erros:**
| Status | Mensagem |
|--------|----------|
| `403` | `"You are not authorized to delete this project."` |
| `404` | `"Project not found."` |

---

## 8. Trabalhos Acadêmicos

### `GET /works` 🔓

Lista trabalhos acadêmicos com paginação e filtros.

**Query params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `cursor` | string | Cursor de paginação |
| `search` | string | Busca por título, resumo, nome do autor ou keyword |
| `workType` | string | `TCC` \| `ARTICLE` \| `THESIS` \| `DISSERTATION` |
| `year` | string | Filtra por ano (ex: `"2024"`) |
| `area` | string | Filtra por instituição (contém, case-insensitive) |

**Response `200 OK`:**
```json
{
  "works": [
    {
      "id": "clwww...",
      "title": "Redes Neurais Aplicadas à Medicina",
      "author": "João Lima",
      "type": "TCC",
      "area": "Universidade Federal",
      "year": "2024",
      "abstract": "Resumo do trabalho...",
      "keywords": ["ia", "medicina", "redes neurais"],
      "downloads": 42,
      "image": null
    }
  ],
  "nextCursor": "clxxx..."
}
```

> Limite: 20 works por página.

---

### `GET /works/:id` 🔓

Retorna detalhes completos de um trabalho acadêmico.

**Response `200 OK`:**
```json
{
  "id": "clwww...",
  "title": "Redes Neurais Aplicadas à Medicina",
  "author": "João Lima",
  "authorUsername": "joao_lima",
  "type": "TCC",
  "area": "Universidade Federal",
  "year": "2024",
  "abstract": "Resumo do trabalho...",
  "detailedDescription": "Descrição completa e detalhada...",
  "keywords": ["ia", "medicina", "redes neurais"],
  "downloads": 42,
  "fileUrl": "data:application/pdf;base64,...",
  "image": null,
  "advisor": "Prof. Dr. Carlos",
  "institution": "Universidade Federal",
  "department": "Computação",
  "references": ["Referência 1", "Referência 2"]
}
```

---

### `GET /works/:id/download` 🔐

Incrementa o contador de downloads e retorna o arquivo PDF em base64.

**Response `200 OK`:**
```json
{
  "pdfFile": "data:application/pdf;base64,...",
  "title": "Redes Neurais Aplicadas à Medicina"
}
```

> **Como usar no front-end:** Converta o base64 para um Blob e use `FileSystem` (Expo) para salvar no dispositivo.

---

### `POST /works` 🔐

Publica um novo trabalho acadêmico.

**Request body:**
```json
{
  "title": "Redes Neurais Aplicadas à Medicina",
  "workType": "TCC",
  "coverImage": "data:image/jpeg;base64,...",
  "summary": "Resumo do trabalho (abstract)...",
  "description": "Descrição completa e detalhada do trabalho...",
  "keywords": ["ia", "medicina", "redes neurais"],
  "references": ["Autor A. Título. Ano.", "Autor B. Título. Ano."],
  "advisor": "Prof. Dr. Carlos Silva",
  "institution": "Universidade Federal",
  "department": "Ciência da Computação",
  "pdfFile": "data:application/pdf;base64,..."
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `title` | string | ✅ | 1–300 caracteres |
| `workType` | string | ✅ | `TCC` \| `ARTICLE` \| `THESIS` \| `DISSERTATION` (case-insensitive) |
| `coverImage` | string | ❌ | Base64 da imagem de capa |
| `summary` | string | ✅ | Abstract/resumo |
| `description` | string | ✅ | Descrição completa |
| `keywords` | string[] | ✅ | 3 a 5 palavras-chave |
| `references` | string[] | ✅ | Array de strings com referências |
| `advisor` | string | ✅ | 1–200 caracteres |
| `institution` | string | ✅ | 1–200 caracteres |
| `department` | string | ❌ | Departamento/área |
| `pdfFile` | string | ✅ | PDF em base64 |

**Response `201 Created`:** Objeto completo do work criado.

---

### `PUT /works/:id` 🔐

Atualiza um trabalho acadêmico. Somente o autor pode editar.

**Request body:** Mesmos campos do `POST`, todos opcionais.

**Response `200 OK`:** Objeto do work atualizado (formato raw do Prisma).

**Erros:**
| Status | Mensagem |
|--------|----------|
| `403` | `"You are not authorized to update this work."` |
| `404` | `"Work not found."` |

---

### `DELETE /works/:id` 🔐

Deleta um trabalho acadêmico. Somente o autor pode deletar.

**Response `204 No Content`**

**Erros:**
| Status | Mensagem |
|--------|----------|
| `403` | `"You are not authorized to delete this work."` |
| `404` | `"Work not found."` |

---

## 9. Chat (REST)

> O chat em tempo real usa **Socket.IO**. As rotas REST abaixo são usadas para gestão de conversas e histórico de mensagens. Consulte o documento `CHAT_GUIDE.md` para a implementação completa.

### `POST /conversations` 🔐

Inicia ou encontra uma conversa direta (DM) entre dois usuários.

**Request body:**
```json
{
  "recipientId": "clyyy..."
}
```

**Response:**
- `200 OK` — Conversa já existente
- `201 Created` — Nova conversa criada

```json
{
  "id": "clccc...",
  "createdAt": "2024-06-01T10:00:00.000Z",
  "updatedAt": "2024-06-01T10:00:00.000Z",
  "participants": [
    {
      "id": "clyyy...",
      "username": "maria_silva",
      "avatar": null,
      "fullName": "Maria Silva"
    }
  ]
}
```

> **Atenção:** `participants` retorna apenas o **outro** participante (não o usuário autenticado).

**Erros:**
| Status | Mensagem |
|--------|----------|
| `400` | `"Recipient ID is required."` |
| `400` | `"Cannot start a conversation with yourself."` |

---

### `GET /conversations` 🔐

Lista todas as conversas do usuário autenticado, ordenadas da mais recente à mais antiga.

**Response `200 OK`:**
```json
[
  {
    "id": "clccc...",
    "createdAt": "2024-06-01T10:00:00.000Z",
    "updatedAt": "2024-06-02T15:30:00.000Z",
    "participants": [
      {
        "id": "clyyy...",
        "username": "maria_silva",
        "avatar": null,
        "fullName": "Maria Silva"
      }
    ],
    "messages": [
      {
        "id": "clmmm...",
        "text": "Última mensagem enviada",
        "createdAt": "2024-06-02T15:30:00.000Z",
        "senderId": "clyyy..."
      }
    ]
  }
]
```

> `messages` contém apenas a **última mensagem** (preview para a lista de conversas).

---

### `GET /conversations/:conversationId` 🔐

Retorna dados de uma conversa específica.

**Response `200 OK`:**
```json
{
  "id": "clccc...",
  "createdAt": "2024-06-01T10:00:00.000Z",
  "updatedAt": "2024-06-02T15:30:00.000Z",
  "participants": [
    {
      "id": "clyyy...",
      "username": "maria_silva",
      "avatar": null,
      "fullName": "Maria Silva"
    }
  ]
}
```

> Somente participantes da conversa têm acesso. `participants` retorna apenas o **outro** participante.

**Erros:**
| Status | Mensagem |
|--------|----------|
| `403` | `"Access denied."` (não é participante) |
| `404` | `"Conversation not found."` |

---

### `GET /conversations/:conversationId/messages` 🔐

Retorna o histórico completo de mensagens de uma conversa.

**Response `200 OK`:**
```json
[
  {
    "id": "clmmm...",
    "text": "Olá, tudo bem?",
    "createdAt": "2024-06-01T10:00:00.000Z",
    "senderId": "clxxx...",
    "conversationId": "clccc...",
    "sender": {
      "id": "clxxx...",
      "username": "joao_lima",
      "avatar": null
    }
  }
]
```

> Mensagens ordenadas da mais antiga à mais nova. Somente participantes têm acesso. Conversa inexistente ou usuário não-participante retorna `403 "Access denied."`

---

## Endpoints de Saúde

### `GET /` 🔓
Retorna `"Lumioo API rodando com sucesso 🚀"` (texto simples)

### `GET /health` 🔓
```json
{ "status": "ok", "timestamp": "2024-06-01T10:00:00.000Z" }
```

---

## Tratamento de Erros

Todos os erros seguem o padrão:
```json
{ "error": "Mensagem de erro descritiva." }
```

| Status | Significado |
|--------|-------------|
| `400` | Bad Request — dados inválidos ou ausentes |
| `401` | Unauthorized — credenciais inválidas |
| `403` | Forbidden — não autenticado ou sem permissão |
| `404` | Not Found — recurso não encontrado |
| `409` | Conflict — dado duplicado (email, username) |
| `429` | Too Many Requests — rate limit excedido |
| `500` | Internal Server Error — erro interno |

---

## Enums

```typescript
// Nível acadêmico
AcademicLevel: 'UNDERGRADUATE' | 'MASTER' | 'PHD' | 'PROFESSOR'

// Status do projeto
ProjectStatus: 'IN_PROGRESS' | 'COMPLETED' | 'OPEN_FOR_APPLICATIONS'

// Tipo de trabalho acadêmico
WorkType: 'TCC' | 'ARTICLE' | 'THESIS' | 'DISSERTATION'
```
