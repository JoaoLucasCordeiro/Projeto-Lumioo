# Documentação — Comments Controller

Este documento descreve o comportamento do controller de comentários localizado em `backendserver/src/controllers/comments.controller.ts`. Ele expõe handlers para criar, listar, atualizar e excluir comentários associados a posts.

Observação: os exemplos de rotas abaixo são sugeridos com base nos parâmetros utilizados (`postId` e `commentId`). Ajuste para o caminho real configurado no seu `Router`.

## Dependências e contexto

- Framework: Express
- ORM: Prisma (`@prisma/client`)
- Autenticação: requer `req.user?.userId` preenchido por um middleware de autenticação (ex.: JWT). O tipo padrão de `Request` do Express não possui `user`, portanto é necessário estender a tipagem (ver seção “Notas de implementação”).

## Regras gerais de autorização e validação

- Autenticação obrigatória para criar, atualizar e excluir comentários. Caso `req.user?.userId` não exista, retorna 403.
- O campo `text` (conteúdo do comentário) é obrigatório em criação e atualização. Na ausência, retorna 400.
- Atualização e exclusão só são permitidas para o autor do comentário (comparação `comment.authorId === userId`). Caso contrário, retorna 403.
- Em caso de erros internos, retorna 500.

## Handlers

### 1) Criar comentário

- Método sugerido: POST
- Rota sugerida: `/posts/:postId/comments`
- Parâmetros de rota:
  - `postId` (string): ID do post ao qual o comentário pertence.
- Body JSON:
  - `text` (string): conteúdo do comentário.

Resposta de sucesso:
- Status: 201
- Corpo: objeto de comentário “formatado” (normalizado pelo controller):
  ```json
  {
    "id": "comment_id",
    "text": "Conteúdo do comentário",
    "authorId": "user_id",
    "username": "nome_de_usuario",
    "userImage": "/default-user.png",
    "timePosted": "2025-08-26T14:00:00.000Z",
    "likes": 0,
    "isLiked": false
  }
  ```

Possíveis erros:
- 400: `Comment text is required.`
- 403: `User not authenticated.`
- 500: `Could not create comment.`

Notas:
- O `username` vem de `author.username`.
- `userImage`, `likes` e `isLiked` são placeholders (os likes não são calculados aqui).
- `timePosted` é baseado em `createdAt` do registro.

Exemplo cURL:
```bash
curl -X POST "https://seu-dominio/api/posts/POST_ID/comments" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"text":"Primeiro!"}'
```

---

### 2) Listar comentários de um post

- Método sugerido: GET
- Rota sugerida: `/posts/:postId/comments`
- Parâmetros de rota:
  - `postId` (string): ID do post.

Comportamento:
- Busca todos os comentários do `postId`, inclui `author.username`, ordena por `createdAt` crescente.

Resposta de sucesso:
- Status: 200
- Corpo: array de comentários no formato retornado pelo Prisma (não formatado como no create/update):
  ```json
  [
    {
      "id": "comment_id_1",
      "text": "Comentário 1",
      "authorId": "user_id",
      "postId": "post_id",
      "createdAt": "2025-08-26T13:58:00.000Z",
      "author": { "username": "nome_de_usuario" }
    },
    {
      "id": "comment_id_2",
      "text": "Comentário 2",
      "authorId": "user_id_2",
      "postId": "post_id",
      "createdAt": "2025-08-26T14:00:00.000Z",
      "author": { "username": "outro_usuario" }
    }
  ]
  ```

Possíveis erros:
- 500: `Could not fetch comments.`

Observação importante:
- O formato de retorno aqui é diferente do formato “formatado” utilizado em criação/atualização. Se desejar padronização, veja “Melhorias sugeridas”.

Exemplo cURL:
```bash
curl -X GET "https://seu-dominio/api/posts/POST_ID/comments"
```

---

### 3) Atualizar comentário

- Método sugerido: PUT ou PATCH
- Rota sugerida: `/comments/:commentId`
- Parâmetros de rota:
  - `commentId` (string): ID do comentário a ser atualizado.
- Body JSON:
  - `text` (string): novo conteúdo do comentário.

Validações:
- Autenticação obrigatória.
- O comentário deve existir.
- Somente o autor pode editar.

Resposta de sucesso:
- Status: 200
- Corpo: objeto de comentário “formatado” (semelhante ao de criação):
  ```json
  {
    "id": "comment_id",
    "text": "Novo conteúdo",
    "authorId": "user_id",
    "username": "nome_de_usuario",
    "userImage": "/default-user.png",
    "timePosted": "2025-08-26T13:58:00.000Z",
    "likes": 0,
    "isLiked": false
  }
  ```

Possíveis erros:
- 400: `Comment text is required.`
- 403: `User not authenticated.` ou `User not authorized to edit this comment.`
- 404: `Comment not found.`
- 500: `Could not update comment.`

Exemplo cURL:
```bash
curl -X PUT "https://seu-dominio/api/comments/COMMENT_ID" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"text":"Atualizado!"}'
```

---

### 4) Excluir comentário

- Método sugerido: DELETE
- Rota sugerida: `/comments/:commentId`
- Parâmetros de rota:
  - `commentId` (string): ID do comentário a ser excluído.

Validações:
- Autenticação obrigatória.
- O comentário deve existir.
- Somente o autor pode excluir.

Comportamento:
- Exclui previamente todos os likes relacionados ao `commentId` (`prisma.like.deleteMany`) e depois exclui o comentário.

Resposta de sucesso:
- Status: 204 (sem corpo)

Possíveis erros:
- 403: `User not authenticated.` ou `User not authorized to delete this comment.`
- 404: `Comment not found.`
- 500: `Could not delete comment.`

Exemplo cURL:
```bash
curl -X DELETE "https://seu-dominio/api/comments/COMMENT_ID" \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

---

## Estruturas de dados

### Comentário formatado (create/update)
- id: string
- text: string
- authorId: string
- username: string
- userImage: string (placeholder)
- timePosted: string (ISO; baseado em `createdAt`)
- likes: number (placeholder 0)
- isLiked: boolean (placeholder false)

### Comentário retornado pelo GET
- id: string
- text: string
- authorId: string
- postId: string
- createdAt: string (ISO)
- author: { username: string }

---

## Notas de implementação

- Tipagem de `req.user`:
  - O tipo `Request` do Express não possui a propriedade `user` por padrão. Recomenda-se estender a tipagem global para evitar `any` e manter segurança de tipos:
    ```ts
    // types/express.d.ts
    import 'express';
    declare global {
      namespace Express {
        interface UserPayload {
          userId: string;
          // outros campos se necessário
        }
        interface Request {
          user?: UserPayload;
        }
      }
    }
    ```
  - Certifique-se de que o middleware de autenticação popula `req.user`.

- Consistência de resposta:
  - O `GET /posts/:postId/comments` retorna o objeto “cru” do Prisma, enquanto `POST` e `PUT` retornam um objeto formatado. Para uma API mais consistente, padronize o formato de saída em todos os endpoints.

- Likes:
  - `likes` e `isLiked` são valores estáticos no retorno de criação/atualização. Caso haja uma tabela de likes, considere:
    - Retornar a contagem real de likes por comentário.
    - Calcular `isLiked` com base no usuário autenticado.
    - Usar agregações do Prisma ou `count` e joins apropriados.

- Integridade referencial:
  - A exclusão de likes antes do comentário é feita manualmente. Avalie o uso de `onDelete: Cascade` no schema Prisma quando apropriado, ou envolva exclusões em uma transação (`prisma.$transaction`) para atomicidade.

- Validação de entrada:
  - Para melhorar mensagens de erro e segurança, considere usar uma biblioteca de validação (ex.: Zod, Joi) para validar `req.body` e `req.params`.

- Paginação e ordenação:
  - `getCommentsForPost` retorna todos os comentários ordenados por `createdAt` ascendente. Em cenários com muitos comentários, adicione paginação (`take`, `skip`, `cursor`) e parâmetros de ordenação configuráveis.

- Verificação de existência do post:
  - Opcionalmente, valide se o `postId` refere-se a um post existente antes de criar ou listar comentários, retornando 404 quando apropriado.

---

## Exemplos de uso em Router (ilustrativo)

```ts
import { Router } from 'express';
import { createComment, getCommentsForPost, updateComment, deleteComment } from './controllers/comments.controller';
import { authMiddleware } from './middlewares/auth';

const router = Router();

router.get('/posts/:postId/comments', getCommentsForPost);
router.post('/posts/:postId/comments', authMiddleware, createComment);
router.put('/comments/:commentId', authMiddleware, updateComment);
router.delete('/comments/:commentId', authMiddleware, deleteComment);

export default router;
```

Ajuste caminhos e middlewares conforme a estrutura do seu projeto.