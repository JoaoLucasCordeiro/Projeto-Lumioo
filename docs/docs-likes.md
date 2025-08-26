# Documentação — Likes Controller

Este documento descreve o comportamento do controller de likes localizado em `backendserver/src/controllers/like.controller.ts`. Ele expõe handlers para alternar (toggle) curtidas em posts e comentários.

Observação: os exemplos de rotas abaixo são sugeridos com base nos parâmetros utilizados (`postId` e `commentId`). Ajuste para o caminho real configurado no seu `Router`.

## Dependências e contexto

- Framework: Express
- ORM: Prisma (`@prisma/client`)
- Autenticação: requer `req.user?.userId` preenchido por um middleware de autenticação (ex.: JWT). O tipo padrão de `Request` do Express não possui `user`, portanto é necessário estender a tipagem (ver seção “Notas de implementação”).

## Regras gerais de autorização e validação

- Autenticação obrigatória para curtir/descurtir. Caso `req.user?.userId` não exista, retorna 403.
- O comportamento é de alternância (toggle): se já existe like do usuário para o recurso, ele é removido; se não existe, é criado.
- Requisitos de unicidade no banco:
  - Para posts: índice único composto `(userId, postId)` (referenciado como `userId_postId` no Prisma).
  - Para comentários: índice único composto `(userId, commentId)` (referenciado como `userId_commentId` no Prisma).
- Em caso de erros internos, retorna 500.

## Handlers

### 1) Alternar like de um Post

- Método sugerido: POST
- Rota sugerida: `/posts/:postId/like`
- Parâmetros de rota:
  - `postId` (string): ID do post a ser curtido/descurtido.

Comportamento:
- Verifica se existe um like com a combinação `(userId, postId)`.
  - Se existir, remove o like (descurtir).
  - Se não existir, cria o like (curtir).

Respostas de sucesso:
- Status: 201
- Corpo:
  ```json
  { "message": "Post liked successfully." }
  ```
- Status: 200
- Corpo:
  ```json
  { "message": "Post unliked successfully." }
  ```

Possíveis erros:
- 403: `User not authenticated.`
- 500: `Could not process like action.`

Exemplo cURL:
```bash
curl -X POST "https://seu-dominio/api/posts/POST_ID/like" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json"
```

---

### 2) Alternar like de um Comentário

- Método sugerido: POST
- Rota sugerida: `/comments/:commentId/like`
- Parâmetros de rota:
  - `commentId` (string): ID do comentário a ser curtido/descurtido.

Comportamento:
- Verifica se existe um like com a combinação `(userId, commentId)`.
  - Se existir, remove o like (descurtir).
  - Se não existir, cria o like (curtir).

Respostas de sucesso:
- Status: 201
- Corpo:
  ```json
  { "message": "Comment liked successfully." }
  ```
- Status: 200
- Corpo:
  ```json
  { "message": "Comment unliked successfully." }
  ```

Possíveis erros:
- 403: `User not authenticated.`
- 500: `Could not process comment like action.`

Exemplo cURL:
```bash
curl -X POST "https://seu-dominio/api/comments/COMMENT_ID/like" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json"
```

---

## Estruturas de dados

### Respostas de sucesso
- Curtir Post: `{ "message": "Post liked successfully." }` (201)
- Descurtir Post: `{ "message": "Post unliked successfully." }` (200)
- Curtir Comentário: `{ "message": "Comment liked successfully." }` (201)
- Descurtir Comentário: `{ "message": "Comment unliked successfully." }` (200)

### Respostas de erro
- Não autenticado: `{ "error": "User not authenticated." }` (403)
- Erro interno ao processar Post: `{ "error": "Could not process like action." }` (500)
- Erro interno ao processar Comentário: `{ "error": "Could not process comment like action." }` (500)

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
          userId: string; // ou number, de acordo com seu schema
          // outros campos se necessário
        }
        interface Request {
          user?: UserPayload;
        }
      }
    }
    ```
  - Certifique-se de que o middleware de autenticação popula `req.user`.

- Unicidade (Prisma):
  - Garanta índices únicos compostos no modelo `Like`:
    - `@@unique([userId, postId])` para likes de posts.
    - `@@unique([userId, commentId])` para likes de comentários.
  - Os nomes compostos são usados no código como `userId_postId` e `userId_commentId`.

- Idempotência:
  - O padrão atual é “toggle” via POST. Se precisar de idempotência (garantir curtido ou descurtido), considere expor endpoints distintos:
    - `PUT /posts/:postId/like` para garantir curtido e `DELETE /posts/:postId/like` para garantir descurtido.
    - `PUT /comments/:commentId/like` e `DELETE /comments/:commentId/like` de forma análoga.

- Validação e integridade:
  - Opcionalmente, valide a existência do Post/Comentário antes de criar o like (evita referências inválidas).
  - Considere usar uma biblioteca de validação (Zod/Joi) para `req.params`.
  - Se necessário, utilize transações (`prisma.$transaction`) em fluxos mais complexos.

- Observabilidade:
  - Em caso de erro (500), registre logs (`console.error(error)`) para depuração, ou use um middleware centralizado de tratamento de erros.

---

## Exemplos de uso em Router (ilustrativo)

```ts
import { Router } from 'express';
import { togglePostLike, toggleCommentLike } from './controllers/like.controller';
import { authMiddleware } from './middlewares/auth';

const router = Router();

router.post('/posts/:postId/like', authMiddleware, togglePostLike);
router.post('/comments/:commentId/like', authMiddleware, toggleCommentLike);

export default router;
```

Ajuste caminhos e middlewares conforme a estrutura do seu projeto.