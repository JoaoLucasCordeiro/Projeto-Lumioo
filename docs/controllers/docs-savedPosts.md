# Documentação — Saved Post Controller

Este documento descreve o comportamento do controller de posts salvos localizado em `backendserver/src/controllers/savedPost.controller.ts`. Ele expõe um handler para alternar (salvar/des-salvar) um post para o usuário autenticado.

Observações:
- A interface `AuthenticatedRequest` foi removida; porém, o handler espera que um middleware de autenticação adicione `user` ao `req` (ex.: `req.user = { userId: '...' }`).
- As rotas abaixo são sugestões baseadas nos parâmetros utilizados. Ajuste conforme o `Router` do seu projeto.

## Dependências e contexto

- Framework: Express
- ORM: Prisma (`@prisma/client`)
- Autenticação: o endpoint depende de `req.user?.userId` preenchido por um middleware (ex.: JWT). O tipo padrão de `Request` do Express não possui `user`; veja “Notas de implementação”.
- Modelo Prisma referenciado: `savedPost`, com índice único composto `userId_postId` (unique constraint).

## Regras gerais de autorização e validação

- Autenticação obrigatória para: alternar o estado de salvamento de um post (`toggleSavePost`).
- Validações mínimas:
  - `postId` deve ser fornecido via parâmetro de rota.
  - Usuário deve estar autenticado (`req.user?.userId`).
- Em erros internos, retorna 500.

## Handlers

### Alternar salvamento de post

- Método sugerido: POST
- Rotas sugeridas (escolha uma):
  - `/posts/:postId/save` — semântica: operação de toggle via POST
  - `/saved-posts/:postId/toggle` — explicita o comportamento de alternância
- Parâmetros de rota:
  - `postId` (string): ID do post a ser salvo/des-salvo.

Comportamento:
- Obtém `userId` de `req.user.userId`.
- Verifica se já existe um registro em `savedPost` para a combinação (`userId`, `postId`) usando a unique key `userId_postId`.
  - Se existir, remove o registro (des-salva) e retorna 200.
  - Se não existir, cria o registro (salva) e retorna 201.

Resposta de sucesso (des-salvar):
- Status: 200
- Corpo:
```json
{ "message": "Post unsaved successfully." }
```

Resposta de sucesso (salvar):
- Status: 201
- Corpo:
```json
{ "message": "Post saved successfully." }
```

Possíveis erros:
- 403: `User not authenticated.`
- 500: `Could not process save action.`

Exemplo cURL (toggle):
```bash
curl -X POST "https://seu-dominio/api/posts/POST_ID/save" \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

---

## Estruturas de dados

### savedPost (modelo Prisma — “cru”, depende do schema)
Campos típicos (podem variar conforme seu schema):
- userId: string
- postId: string
- createdAt: string (ISO)
- [opcional] id: string (caso exista um ID próprio além da chave composta)

Índice/constraint relevante:
- Unique composto: `userId_postId` (garante que cada usuário salve no máximo uma vez cada post).

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

- Validação de entrada:
  - O handler não valida explicitamente `postId`; se `postId` estiver ausente/indefinido, o Prisma deve lançar erro e o endpoint retornará 500. É recomendável adicionar validação e retornar 400 quando `postId` estiver ausente ou inválido.
  - O handler não verifica a existência do `post` alvo. Se necessário, inclua uma checagem prévia para retornar 404 quando o post não existir.

- Semântica HTTP:
  - Aqui, um único endpoint com método POST realiza o “toggle”. Alternativamente, você pode expor dois endpoints idempotentes:
    - POST `/posts/:postId/save` → salva (409 se já salvo)
    - DELETE `/posts/:postId/save` → des-salva (204 ou 404 se não existia)
  - A abordagem atual é simples e prática para UI com botão “Salvar/Remover dos salvos”.

- Concorrência e integridade:
  - A unique key composta `userId_postId` evita duplicidades.
  - Em cenários altamente concorrentes, considere capturar erros de unique constraint ao criar, ou usar `upsert` com lógica adequada. Para toggle, a sequência `findUnique` → `create/delete` atende à maioria dos casos.

- Performance:
  - Índices nos campos `userId`, `postId` e na constraint composta ajudam em grandes volumes.
  - Se for necessário listar posts salvos, prefira paginação e seleções específicas (JOIN/relations) conforme o schema.

---

## Exemplo de uso em Router (ilustrativo)

```ts
import { Router } from 'express';
import { toggleSavePost } from './controllers/savedPost.controller';
import { authMiddleware } from './middlewares/auth';

const router = Router();

router.post('/posts/:postId/save', authMiddleware, toggleSavePost);
// ou
// router.post('/saved-posts/:postId/toggle', authMiddleware, toggleSavePost);

export default router;
```

Ajuste caminhos e middlewares conforme a estrutura do seu projeto.