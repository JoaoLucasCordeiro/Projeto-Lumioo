# Documentação — Posts Controller

Este documento descreve o comportamento do controller de postagens localizado em `backendserver/src/controllers/post.controller.ts`. Ele expõe handlers para criar, listar, paginar feed, detalhar, atualizar e excluir posts.

Observações:
- A interface `AuthenticatedRequest` foi removida; porém, os handlers esperam que um middleware de autenticação adicione `user` ao `req` (ex.: `req.user = { userId: '...' }`).
- As rotas abaixo são sugestões baseadas nos parâmetros utilizados. Ajuste conforme o `Router` do seu projeto.

## Dependências e contexto

- Framework: Express
- ORM: Prisma (`@prisma/client`)
- Autenticação: vários endpoints dependem de `req.user?.userId` preenchido por um middleware (ex.: JWT). O tipo padrão de `Request` do Express não possui `user`; veja “Notas de implementação”.
- Modelos Prisma referenciados: `post`, com relações `author`, `likes`, `savedBy`, `comments`.

## Regras gerais de autorização e validação

- Autenticação obrigatória para: feed (`getFeedPosts`), criação (`createPost`), atualização (`updatePost`) e exclusão (`deletePost`).
- Em endpoints públicos (`getAllPosts`, `getPostById`), a autenticação é opcional; quando presente, é usada para computar `isLiked` e `isSaved`.
- Em criação, `caption` e `image` são obrigatórios (400 quando ausentes).
- Atualização e exclusão só são permitidas ao autor do post (403 quando não autorizado).
- Em erros internos, retorna 500.

## Handlers

### 1) Listar feed paginado do usuário autenticado

- Método sugerido: GET
- Rota sugerida: `/posts/feed`
- Query params:
  - `cursor` (string, opcional): ID do último post da página anterior (paginação baseada em cursor).
- Regras:
  - Requer autenticação (`req.user?.userId`).
  - Limite fixo de 5 itens por página.

Comportamento:
- Busca posts ordenados por `createdAt` desc.
- Aplica paginação com `cursor` e `skip` apropriados.
- Inclui `author.username`, `author.avatar`, `likes.userId`, `_count.comments`, e `savedBy` filtrado pelo `userId` do usuário atual.
- Normaliza os posts no formato “formatado” e retorna `nextCursor` quando houver próxima página.

Resposta de sucesso:
- Status: 200
- Corpo:
  ```json
  {
    "posts": [
      {
        "id": "post_id",
        "username": "autor",
        "authorId": "user_id_autor",
        "userImage": "/avatar.png",
        "image": "/image.jpg",
        "caption": "Legenda",
        "likes": 10,
        "comments": 2,
        "timePosted": "2025-08-26T14:00:00.000Z",
        "isLiked": true,
        "isSaved": false
      }
    ],
    "nextCursor": "ultimo_post_id_esta_pagina_ou_null"
  }
  ```

Possíveis erros:
- 403: `User not authenticated.`
- 500: `Could not fetch feed posts.`

Exemplo cURL:
```bash
curl -X GET "https://seu-dominio/api/posts/feed?cursor=POST_ID" \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

---

### 2) Criar post

- Método sugerido: POST
- Rota sugerida: `/posts`
- Body JSON:
  - `caption` (string, obrigatório)
  - `image` (string, obrigatório)
  - `location` (string, opcional)
  - `hashtags` (string[] | opcional, conforme schema)
- Regras:
  - Requer autenticação.
  - `caption` e `image` obrigatórios (retorna 400 quando ausentes).

Comportamento:
- Cria o post com `authorId` = `req.user.userId`.
- Retorna o objeto “cru” do Prisma (não formatado).

Resposta de sucesso:
- Status: 201
- Corpo (exemplo representativo; campos exatos dependem do schema):
  ```json
  {
    "id": "post_id",
    "caption": "Minha legenda",
    "image": "/image.jpg",
    "location": "São Paulo, BR",
    "hashtags": ["travel", "food"],
    "authorId": "user_id_autor",
    "createdAt": "2025-08-26T14:00:00.000Z",
    "updatedAt": "2025-08-26T14:00:00.000Z"
  }
  ```

Possíveis erros:
- 400: `Caption and image are required.`
- 403: `User not authenticated.`
- 500: `An error occurred while creating the post.`

Exemplo cURL:
```bash
curl -X POST "https://seu-dominio/api/posts" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"caption":"Nova foto","image":"https://cdn/img.jpg","location":"BR","hashtags":["travel","brasil"]}'
```

---

### 3) Listar todos os posts (com busca)

- Método sugerido: GET
- Rota sugerida: `/posts`
- Query params:
  - `search` (string, opcional): termo para busca em `caption`, `author.username` (insensitive) ou `hashtags` (match exato no array).
- Regras:
  - Autenticação opcional. Quando presente, `isLiked` e `isSaved` são calculados para o usuário; quando ausente, ambos retornam `false`.

Comportamento:
- Aplica filtro OR sobre `caption`, `author.username` e `hashtags`.
- Ordena por `createdAt` desc.
- Inclui `author.username`, `author.avatar`, `likes.userId`, `_count.comments`, e `savedBy` filtrado por `userId` (quando houver).
- Retorna um array de posts no formato “formatado”.

Resposta de sucesso:
- Status: 200
- Corpo:
  ```json
  [
    {
      "id": "post_id",
      "username": "autor",
      "authorId": "user_id_autor",
      "userImage": "/avatar.png",
      "image": "/image.jpg",
      "caption": "Legenda",
      "likes": 3,
      "comments": 1,
      "timePosted": "2025-08-26T14:00:00.000Z",
      "isLiked": false,
      "isSaved": false
    }
  ]
  ```

Possíveis erros:
- 500: `Could not fetch posts.`

Exemplo cURL:
```bash
curl -X GET "https://seu-dominio/api/posts?search=brasil"
```

---

### 4) Obter post por ID (com comentários)

- Método sugerido: GET
- Rota sugerida: `/posts/:id`
- Parâmetros de rota:
  - `id` (string): ID do post.
- Regras:
  - Autenticação opcional. Quando presente, `isLiked`/`isSaved` e `isLiked` de comentários são calculados para o usuário autenticado.

Comportamento:
- Busca o post por `id`.
- Inclui:
  - `author.username`, `author.avatar`
  - `likes.userId`
  - `savedBy` filtrado pelo `userId` (quando houver)
  - `comments` ordenados por `createdAt` asc, com `author.username`, `author.avatar` e `likes.userId`
- Retorna um objeto “formatado” com o post e comentários.

Resposta de sucesso:
- Status: 200
- Corpo:
  ```json
  {
    "id": "post_id",
    "username": "autor",
    "authorId": "user_id_autor",
    "userImage": "/avatar.png",
    "image": "/image.jpg",
    "caption": "Legenda",
    "likes": 12,
    "timePosted": "2025-08-26T14:00:00.000Z",
    "isLiked": true,
    "isSaved": false,
    "comments": [
      {
        "id": "comment_id",
        "username": "comentarista",
        "authorId": "user_id_comentarista",
        "userImage": "/avatar2.png",
        "text": "Muito bom!",
        "timePosted": "2025-08-26T14:05:00.000Z",
        "likes": 2,
        "isLiked": false
      }
    ]
  }
  ```

Possíveis erros:
- 404: `Post not found.`
- 500: `Could not fetch post details.`

Exemplo cURL:
```bash
curl -X GET "https://seu-dominio/api/posts/POST_ID" \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

---

### 5) Atualizar post

- Método sugerido: PUT ou PATCH
- Rota sugerida: `/posts/:id`
- Parâmetros de rota:
  - `id` (string): ID do post.
- Body JSON:
  - `caption` (string, opcional)
  - `image` (string, opcional)
  - `location` (string, opcional)
  - `hashtags` (string[] | opcional)

Validações:
- Requer autenticação.
- O post deve existir.
- Somente o autor pode atualizar.

Comportamento:
- Atualiza os campos fornecidos.
- Retorna o objeto “cru” do Prisma (não formatado).

Resposta de sucesso:
- Status: 200
- Corpo (exemplo representativo):
  ```json
  {
    "id": "post_id",
    "caption": "Legenda atualizada",
    "image": "/image-atualizada.jpg",
    "location": "Rio de Janeiro",
    "hashtags": ["praia"],
    "authorId": "user_id_autor",
    "createdAt": "2025-08-26T14:00:00.000Z",
    "updatedAt": "2025-08-26T14:10:00.000Z"
  }
  ```

Possíveis erros:
- 403: `User not authenticated.` ou `You are not authorized to update this post.`
- 404: `Post not found.`
- 500: `An error occurred while updating the post.`

Exemplo cURL:
```bash
curl -X PUT "https://seu-dominio/api/posts/POST_ID" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"caption":"Nova legenda","location":"RJ"}'
```

---

### 6) Excluir post

- Método sugerido: DELETE
- Rota sugerida: `/posts/:id`
- Parâmetros de rota:
  - `id` (string): ID do post.

Validações:
- Requer autenticação.
- O post deve existir.
- Somente o autor pode excluir.

Comportamento:
- Exclui o post pelo `id`.

Resposta de sucesso:
- Status: 204 (sem corpo)

Possíveis erros:
- 403: `User not authenticated.` ou `You are not authorized to delete this post.`
- 404: `Post not found.`
- 500: `An error occurred while deleting the post.`

Exemplo cURL:
```bash
curl -X DELETE "https://seu-dominio/api/posts/POST_ID" \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

---

## Estruturas de dados

### Post formatado (feed e listagem geral)
- id: string
- username: string (de `author.username`)
- authorId: string
- userImage: string (de `author.avatar`)
- image: string
- caption: string
- likes: number (tamanho de `likes`)
- comments: number (quantidade via `_count.comments`) — somente em feed e listagem geral
- timePosted: string (ISO; `createdAt`)
- isLiked: boolean (true se algum `like.userId === userId` autenticado)
- isSaved: boolean (true se `savedBy` tiver registro para o `userId` autenticado)

### Post detalhado formatado (get by id)
- id, username, authorId, userImage, image, caption, likes, timePosted, isLiked, isSaved
- comments: CommentDetalhado[]

CommentDetalhado:
- id: string
- username: string (autor do comentário)
- authorId: string
- userImage: string (avatar do autor do comentário)
- text: string
- timePosted: string (ISO; `createdAt`)
- likes: number (tamanho de `likes`)
- isLiked: boolean (true se algum `like.userId === userId` autenticado)

### Post “cru” do Prisma (create/update)
- id: string
- caption: string
- image: string
- location?: string
- hashtags?: string[]
- authorId: string
- createdAt: string (ISO)
- updatedAt: string (ISO)

Observação: os campos exatos dependem do schema Prisma do projeto.

---

## Notas de implementação

- Tipagem de `req.user`:
  - O tipo `Request` do Express não possui `user` por padrão. Recomenda-se estender a tipagem global:
    ```ts
    // types/express.d.ts
    import 'express';
    declare global {
      namespace Express {
        interface UserPayload {
          userId: string;
        }
        interface Request {
          user?: UserPayload;
        }
      }
    }
    ```
  - Garanta que o middleware de autenticação popula `req.user`.

- Paginação (feed):
  - Implementada com cursor (`cursor` = último `post.id` da página anterior), `take = 5`, `skip = cursor ? 1 : 0`, `orderBy createdAt desc`.
  - Retorno inclui `nextCursor` quando houver mais resultados.

- Consistência de formato:
  - `createPost` e `updatePost` retornam o objeto “cru”; os demais retornam “formatado”.
  - Para consistência, considere padronizar o formato das respostas.

- Cálculo de `isLiked` e `isSaved`:
  - Depende da presença de `req.user?.userId`. Sem autenticação, ambos serão `false` na listagem geral; no feed, a autenticação é obrigatória.

- Exclusão e integridade:
  - A exclusão de post não trata explicitamente relacionamentos (likes, comentários, saves). Avalie:
    - Configurar `onDelete: Cascade` no schema do Prisma.
    - Usar `prisma.$transaction` para excluir relações e o post de forma atômica se necessário.

- Validação:
  - `createPost` valida campos obrigatórios; `updatePost` aceita campos parciais (valores `undefined` não sobrescrevem).
  - Considere usar Zod/Joi para validar `req.body`/`req.params`/`req.query` e melhorar mensagens de erro.

- Performance:
  - Índices em `createdAt` e em colunas de busca (`caption`, `author.username`, `hashtags`) podem melhorar desempenho.
  - Em `getAllPosts`, avaliar paginação quando o volume crescer.

---

## Exemplos de uso em Router (ilustrativo)

```ts
import { Router } from 'express';
import {
  getFeedPosts,
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost
} from './controllers/post.controller';
import { authMiddleware } from './middlewares/auth';

const router = Router();

// Público (auth opcional)
router.get('/posts', getAllPosts);
router.get('/posts/:id', getPostById);

// Feed (somente autenticado)
router.get('/posts/feed', authMiddleware, getFeedPosts);

// CRUD (somente autenticado)
router.post('/posts', authMiddleware, createPost);
router.put('/posts/:id', authMiddleware, updatePost);   // ou PATCH
router.delete('/posts/:id', authMiddleware, deletePost);

export default router;
```

Ajuste caminhos e middlewares conforme a estrutura do seu projeto.