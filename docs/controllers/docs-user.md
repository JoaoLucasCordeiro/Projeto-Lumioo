# Documentação — User Controller

Este documento descreve o comportamento do controller de usuários localizado em `backendserver/src/controllers/user.controller.ts`. Ele expõe handlers para criação, leitura, atualização, exclusão de usuário e operações de perfil/senha do usuário autenticado.

Observações:
- A interface `AuthenticatedRequest` foi removida; porém, alguns handlers esperam que um middleware de autenticação adicione `user` ao `req` (ex.: `req.user = { userId: '...' }`).
- Alguns endpoints não possuem checagem de autenticação/autorizaçao no controller (ex.: `getAllUsers`, `getUserById`, `deleteUser`). Recomenda-se protegê-los via middleware conforme a necessidade do projeto.
- As rotas abaixo são sugestões baseadas nos parâmetros utilizados. Ajuste conforme o `Router` do seu projeto.

## Dependências e contexto

- Framework: Express
- ORM: Prisma (`@prisma/client`)
- Criptografia: `bcryptjs` (hash/salt de senha com custo 10)
- Autenticação: endpoints que usam `req.user?.userId` dependem de um middleware (ex.: JWT) que popula `req.user`. O tipo padrão de `Request` do Express não possui `user`; veja “Notas de implementação”.
- Modelos Prisma referenciados: `user` (diretamente); relacionamentos em `getMyProfile` (ex.: `posts`, `likes`, `savedBy`).

## Regras gerais de autorização e validação

- Autenticação obrigatória para:
  - `getMyProfile`
  - `updateUser`
  - `changePassword`
- Sem autenticação explícita no controller (avaliar proteger):
  - `createUser` (aberto por natureza, cadastro)
  - `getAllUsers` (recomendado restringir e omitir campos sensíveis)
  - `getUserById` (avaliar política)
  - `deleteUser` (recomendado restringir a dono/admin)
- Validações mínimas implementadas:
  - `createUser`: exige `fullName`, `academicEmail`, `username`, `password`, `institution`, `academicLevel`, `dateOfBirth`.
  - `changePassword`: exige `currentPassword` e `newPassword`.
  - `updateUser`: valida unicidade de `username`.
- Tratamento de erros Prisma:
  - `P2002` (unique constraint) → 409 em `createUser`.
  - `P2025` (record not found) → 404 em `deleteUser`.
- Em erros internos, retorna 500.

## Handlers

### Criar usuário — `createUser`

- Método sugerido: POST
- Rota sugerida: `/users`
- Corpo (JSON):
  - `fullName` (string)
  - `academicEmail` (string)
  - `username` (string)
  - `password` (string)
  - `institution` (string)
  - `academicLevel` (string)
  - `dateOfBirth` (string ISO ou data parsável em `new Date()`)

Comportamento:
- Valida presença de todos os campos.
- Faz hash da senha com `bcrypt.hash(password, 10)`.
- Cria o usuário e retorna o objeto sem o campo `password`.
- Conflitos de unicidade (`P2002`) retornam 409 (`Email or username already exists.`).

Resposta de sucesso:
- Status: 201
- Corpo: usuário sem campo `password`.

Possíveis erros:
- 400: `All fields are required.`
- 409: `Email or username already exists.`
- 500: `An error occurred while creating the user.`

Exemplo cURL:
```bash
curl -X POST "https://seu-dominio/api/users" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Nome Completo",
    "academicEmail": "aluno@universidade.edu",
    "username": "aluno01",
    "password": "SenhaForte@123",
    "institution": "Universidade X",
    "academicLevel": "Graduação",
    "dateOfBirth": "2000-01-01"
  }'
```

---

### Listar usuários — `getAllUsers`

- Método sugerido: GET
- Rota sugerida: `/users`

Comportamento:
- Retorna lista de usuários via `prisma.user.findMany()`.
- Observação importante: conforme implementado, retorna todos os campos do modelo, inclusive `password` (hash). Recomenda-se usar `select`/`omit` para não expor campos sensíveis e proteger a rota.

Resposta de sucesso:
- Status: 200
- Corpo: `User[]` (atualmente inclui `password`).

Possíveis erros:
- 500: `An error occurred while fetching users.`

Exemplo cURL:
```bash
curl -X GET "https://seu-dominio/api/users" \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

---

### Buscar usuário por ID — `getUserById`

- Método sugerido: GET
- Rota sugerida: `/users/:id`
- Parâmetros de rota:
  - `id` (string)

Comportamento:
- Busca um usuário por `id`.
- Se não encontrado, retorna 404.
- Observação: conforme implementado, retorna todos os campos do usuário, inclusive `password`. Recomenda-se omitir campos sensíveis.

Resposta de sucesso:
- Status: 200
- Corpo: `User` (conforme modelo atual, inclusive `password`).

Possíveis erros:
- 404: `User not found.`
- 500: `An error occurred while fetching the user.`

Exemplo cURL:
```bash
curl -X GET "https://seu-dominio/api/users/USER_ID" \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

---

### Obter meu perfil (expandido) — `getMyProfile`

- Método sugerido: GET
- Rotas sugeridas:
  - `/me`
  - `/profile/me`
- Autenticação: obrigatória (usa `req.user?.userId`)

Comportamento:
- Carrega o perfil do usuário autenticado com seleções e relacionamentos:
  - Dados do usuário: `fullName`, `username`, `academicEmail`, `institution`, `academicLevel`, `dateOfBirth`, `createdAt`, `bio`, `avatar`, `coverPhoto`, contagem de `posts`.
  - `posts` do usuário: ordenados por `createdAt desc`, incluindo autor (username, avatar), `likes` (userId), `_count.comments`, e se está salvo pelo próprio usuário (`savedBy` filtrado por `userId`).
  - `savedPosts`: posts salvos pelo usuário, ordenados por `savedAt desc`, trazendo autor, likes, contagem de comentários e marcações `isLiked`/`isSaved`.
- Retorna um objeto formatado:
  - `fullName`, `username`, `email`, `institution`, `academicLevel`
  - `birthDate` (ISO), `joinDate` (ISO)
  - `bio`, `avatar`, `coverPhoto`
  - `followers` e `following`: 0 (placeholders)
  - `posts`: contagem
  - `userPosts`: array de posts do usuário enriquecidos
  - `savedPosts`: array de posts salvos enriquecidos

Respostas:
- 200: objeto de perfil formatado.
- 403: `User not authenticated.`
- 404: `Profile not found.`
- 500: `Could not fetch profile.`

Exemplo de resposta (parcial):
```json
{
  "fullName": "Nome Completo",
  "username": "aluno01",
  "email": "aluno@universidade.edu",
  "institution": "Universidade X",
  "academicLevel": "Graduação",
  "birthDate": "2000-01-01T00:00:00.000Z",
  "joinDate": "2025-01-01T12:00:00.000Z",
  "bio": "",
  "avatar": "https://.../avatar.png",
  "coverPhoto": "https://.../cover.jpg",
  "followers": 0,
  "following": 0,
  "posts": 3,
  "userPosts": [
    {
      "id": "POST_ID",
      "username": "aluno01",
      "authorId": "USER_ID",
      "userImage": "https://.../avatar.png",
      "image": "https://.../post1.jpg",
      "caption": "Legenda",
      "likes": 10,
      "comments": 2,
      "timePosted": "2025-08-20T10:00:00.000Z",
      "isLiked": true,
      "isSaved": false
    }
  ],
  "savedPosts": [
    {
      "id": "POST2_ID",
      "username": "autor2",
      "authorId": "USER2_ID",
      "userImage": "https://.../autor2.png",
      "image": "https://.../post2.jpg",
      "caption": "Outra legenda",
      "likes": 5,
      "comments": 1,
      "timePosted": "2025-08-18T09:00:00.000Z",
      "isLiked": false,
      "isSaved": true
    }
  ]
}
```

Exemplo cURL:
```bash
curl -X GET "https://seu-dominio/api/me" \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

---

### Atualizar meu perfil — `updateUser`

- Método sugerido: PATCH
- Rotas sugeridas:
  - `/me`
  - `/users/me`
- Autenticação: obrigatória (usa `req.user?.userId`)
- Corpo (JSON — todos opcionais):
  - `fullName` (string)
  - `username` (string) — validado para unicidade
  - `bio` (string)
  - `avatar` (string URL)
  - `coverPhoto` (string URL)

Comportamento:
- Se `username` for enviado, valida se já existe para outro usuário (retorna 409 se estiver em uso).
- Atualiza os campos enviados e retorna o usuário sem `password`.

Respostas:
- 200: usuário atualizado (sem `password`)
- 403: `User not authenticated.`
- 409: `Username already taken.`
- 500: `An error occurred while updating the user.`

Exemplo cURL:
```bash
curl -X PATCH "https://seu-dominio/api/me" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{ "fullName": "Novo Nome", "username": "novo_usuario", "bio": "Sobre mim" }'
```

---

### Deletar usuário por ID — `deleteUser`

- Método sugerido: DELETE
- Rota sugerida: `/users/:id`
- Parâmetros de rota:
  - `id` (string)
- Autorização: não há checagem no controller. Recomenda-se restringir a administrador ou ao próprio usuário.

Comportamento:
- Exclui o usuário por `id`.
- Respostas:
  - 204 (sem corpo) ao sucesso
  - 404 se o registro não existir (`P2025`)
  - 500 para demais erros

Exemplo cURL:
```bash
curl -X DELETE "https://seu-dominio/api/users/USER_ID" \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

---

### Alterar senha — `changePassword`

- Métodos sugeridos:
  - POST `/me/change-password`
  - ou PATCH `/me/password`
- Autenticação: obrigatória (usa `req.user?.userId`)
- Corpo (JSON):
  - `currentPassword` (string) — obrigatório
  - `newPassword` (string) — obrigatório

Comportamento:
- Valida presença de `currentPassword` e `newPassword` (400).
- Busca usuário autenticado; se não encontrado, 404.
- Compara `currentPassword` com hash salvo; se inválida, 401.
- Hash da `newPassword` com custo 10; atualiza registro.
- Mensagens de resposta estão em pt-BR.

Respostas:
- 200: `{ "message": "Senha alterada com sucesso." }`
- 400: `{ "error": "Senha atual e nova senha são obrigatórias." }`
- 401: `{ "error": "A senha atual está incorreta." }`
- 404: `{ "error": "Usuário não encontrado." }`
- 500: `{ "error": "Ocorreu um erro ao alterar a senha." }`

Exemplo cURL:
```bash
curl -X POST "https://seu-dominio/api/me/change-password" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{ "currentPassword": "SenhaAntiga@123", "newPassword": "SenhaNova@456" }'
```

---

## Estruturas de dados

### user (modelo Prisma — “cru”, depende do schema)
Campos típicos (inferidos pelo código; podem variar):
- id: string
- fullName: string
- academicEmail: string (único)
- username: string (único)
- password: string (hash)
- institution: string
- academicLevel: string
- dateOfBirth: Date
- createdAt: Date
- bio?: string
- avatar?: string
- coverPhoto?: string

Relacionamentos usados em `getMyProfile`:
- posts: Post[]
- savedPosts: { post: Post, savedAt: Date }[]
- likes em Post: { userId: string }[]
- _count em Post: { comments: number }
- author em Post: { username: string, avatar?: string }
- savedBy em Post: filtrado por `userId` atual

### Objeto de resposta formatado em `getMyProfile`
- fullName, username, email, institution, academicLevel
- birthDate (ISO), joinDate (ISO)
- bio, avatar, coverPhoto
- followers: number (0 atualmente)
- following: number (0 atualmente)
- posts: number (contagem de posts do usuário)
- userPosts: Array<{ id, username, authorId, userImage, image, caption, likes, comments, timePosted, isLiked, isSaved }>
- savedPosts: Array<{ id, username, authorId, userImage, image, caption, likes, comments, timePosted, isLiked, isSaved: true }>

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

- Segurança de dados:
  - `getAllUsers` e `getUserById` retornam o modelo completo (inclui `password` hash). Recomenda-se:
    - Restringir acesso a essas rotas via middleware (ex.: admin).
    - Usar `select` do Prisma para omitir `password` e outros campos sensíveis.

- Unicidade e erros Prisma:
  - `createUser` mapeia `P2002` para 409 (“Email or username already exists.”).
  - `deleteUser` mapeia `P2025` para 404 (“User not found.”).

- Semântica HTTP:
  - `createUser`: POST `/users`
  - `getAllUsers`: GET `/users`
  - `getUserById`: GET `/users/:id`
  - `getMyProfile`: GET `/me` ou `/profile/me`
  - `updateUser`: PATCH `/me` ou `/users/me`
  - `deleteUser`: DELETE `/users/:id` (restringir a admin/dono)
  - `changePassword`: POST `/me/change-password` ou PATCH `/me/password`

- Datas:
  - `getMyProfile` serializa `dateOfBirth` e `createdAt` para ISO via `toISOString()`.

- Performance:
  - `getMyProfile` faz `include` de relações e contagens; avalie paginação para `posts`/`savedPosts` em cenários com alto volume.

- Internacionalização:
  - Mensagens de erro/sucesso do `changePassword` estão em pt-BR; demais handlers usam inglês. Considere padronizar.

---

## Exemplo de uso em Router (ilustrativo)

```ts
import { Router } from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  getMyProfile,
  updateUser,
  deleteUser,
  changePassword
} from './controllers/user.controller';
import { authMiddleware, adminOnly } from './middlewares/auth';

const router = Router();

router.post('/users', createUser);
router.get('/users', authMiddleware, adminOnly, getAllUsers);
router.get('/users/:id', authMiddleware, adminOnly, getUserById);

router.get('/me', authMiddleware, getMyProfile);
router.patch('/me', authMiddleware, updateUser);
router.post('/me/change-password', authMiddleware, changePassword);

router.delete('/users/:id', authMiddleware, adminOnly, deleteUser);

export default router;
```

Ajuste caminhos e middlewares conforme a estrutura e a política de acesso do seu projeto.