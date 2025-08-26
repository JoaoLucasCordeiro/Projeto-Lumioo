# Documentação — Projects Controller

Este documento descreve o comportamento do controller de projetos localizado em `backendserver/src/controllers/project.controller.ts`. Ele expõe handlers para criar, listar, detalhar, atualizar e excluir projetos.

Observações:
- As interfaces `AuthenticatedRequest` e `TeamMemberInput` foram removidas; porém, os handlers esperam que um middleware de autenticação adicione `user` ao `req` (ex.: `req.user = { userId: '...' }`).
- As rotas abaixo são sugestões baseadas nos parâmetros utilizados. Ajuste conforme o `Router` do seu projeto.

## Dependências e contexto

- Framework: Express
- ORM: Prisma (`@prisma/client`)
- Enum: `ProjectStatus` (ex.: inclui `OPEN_FOR_APPLICATIONS`, `IN_PROGRESS`, `COMPLETED`, entre outros definidos no schema Prisma)
- Autenticação: vários endpoints dependem de `req.user?.userId` preenchido por um middleware (ex.: JWT). O tipo padrão de `Request` do Express não possui `user`; veja “Notas de implementação”.
- Modelos Prisma referenciados: `project`, com relações `owner` (usa `owner.fullName`) e `teamMembers`.

## Regras gerais de autorização e validação

- Autenticação obrigatória para: criação (`createProject`), atualização (`updateProject`) e exclusão (`deleteProject`).
- Endpoints públicos: listagem geral (`getAllProjects`) e detalhamento (`getProjectById`).
- Criação:
  - Campos obrigatórios: `title`, `description`, `category`, `status`, `teamMembers` (array não vazio).
  - `status` deve pertencer ao enum `ProjectStatus` (validação com `status.toUpperCase()`).
  - Quando `status === 'OPEN_FOR_APPLICATIONS'`, `contactEmail` e `contactPhone` são obrigatórios.
- Atualização e exclusão:
  - Somente o dono do projeto (`ownerId`) pode atualizar/excluir (403 quando não autorizado).
- Em erros internos, retorna 500.

## Handlers

### 1) Criar projeto

- Método sugerido: POST
- Rota sugerida: `/projects`
- Body JSON:
  - `title` (string, obrigatório)
  - `description` (string, obrigatório)
  - `category` (string, obrigatório)
  - `image` (string, opcional)
  - `status` (string, obrigatório; convertido para enum via `toUpperCase()`)
  - `contactEmail` (string, obrigatório quando `status === 'OPEN_FOR_APPLICATIONS'`)
  - `contactPhone` (string, obrigatório quando `status === 'OPEN_FOR_APPLICATIONS'`)
  - `teamMembers` (array não vazio, obrigatório) — cada item: `{ name: string; role: string; photo?: string | null }`

Regras:
- Requer autenticação (`req.user?.userId`).
- Valida obrigatórios; valida `status` no enum; exige contato quando “aberto para inscrições”; valida `teamMembers` como array não vazio.

Comportamento:
- Cria o projeto com `ownerId` = `req.user.userId`.
- Cria membros da equipe via criação aninhada (`teamMembers.create`).
- Inclui `teamMembers` na resposta.

Resposta de sucesso:
- Status: 201
- Corpo (exemplo representativo; campos exatos dependem do schema):
```json
{
  "id": "project_id",
  "title": "Título do projeto",
  "description": "Descrição",
  "category": "Educação",
  "image": "https://cdn/img.jpg",
  "status": "OPEN_FOR_APPLICATIONS",
  "contactEmail": "contato@exemplo.com",
  "contactPhone": "+55 11 99999-9999",
  "ownerId": "user_id_dono",
  "createdAt": "2025-08-26T14:00:00.000Z",
  "updatedAt": "2025-08-26T14:00:00.000Z",
  "teamMembers": [
    { "id": "tm1", "name": "Fulana", "role": "Designer", "photo": null, "projectId": "project_id" }
  ]
}
```

Possíveis erros:
- 400:
  - `Title, description, category, status, and teamMembers are required.`
  - `Invalid status value.`
  - `Contact email and phone are required when status is OPEN_FOR_APPLICATIONS.`
  - `teamMembers must be a non-empty array.`
- 403: `User not authenticated.`
- 500: `An error occurred while creating the project.`

Exemplo cURL:
```bash
curl -X POST "https://seu-dominio/api/projects" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Novo projeto",
    "description":"Descrição do projeto",
    "category":"Tecnologia",
    "image":"https://cdn/img.jpg",
    "status":"OPEN_FOR_APPLICATIONS",
    "contactEmail":"contato@exemplo.com",
    "contactPhone":"+55 11 90000-0000",
    "teamMembers":[
      {"name":"Alice","role":"PM"},
      {"name":"Bruno","role":"Dev","photo":"https://cdn/bruno.jpg"}
    ]
  }'
```

---

### 2) Listar todos os projetos (com busca e filtros)

- Método sugerido: GET
- Rota sugerida: `/projects`
- Query params:
  - `search` (string, opcional): termo para busca em `title`, `description`, `owner.fullName` (case-insensitive).
  - `category` (string, opcional): filtra por categoria (case-insensitive). Se `category=all`, não filtra.
  - `year` (string, opcional): ano de criação (ex.: `2024`). Se `year=all`, não filtra.

Comportamento:
- Monta `where` dinamicamente:
  - `OR` em `title`, `description`, `owner.fullName` quando `search` presente.
  - Igualdade de `category` (insensitive) quando diferente de `all`.
  - Intervalo de `createdAt` entre 01/01/ano e 01/01/ano+1 quando `year` válido.
- Ordena por `createdAt` desc.
- Inclui:
  - `owner` com `fullName`
  - `_count` de `teamMembers`
- Normaliza a resposta no formato “formatado”.

Resposta de sucesso:
- Status: 200
- Corpo:
```json
[
  {
    "id": "project_id",
    "title": "Título",
    "description": "Descrição",
    "category": "Tecnologia",
    "year": "2025",
    "image": "https://cdn/img.jpg",
    "members": 3,
    "institution": "Universidade X",
    "status": "OPEN_FOR_APPLICATIONS"
  }
]
```

Possíveis erros:
- 500: `Could not fetch projects.`

Exemplo cURL:
```bash
curl -X GET "https://seu-dominio/api/projects?search=educacao&category=Educação&year=2025"
```

---

### 3) Obter projeto por ID (detalhado)

- Método sugerido: GET
- Rota sugerida: `/projects/:id`
- Parâmetros de rota:
  - `id` (string): ID do projeto.

Comportamento:
- Busca o projeto por `id`.
- Inclui:
  - `owner.fullName`
  - `teamMembers`
- Retorna um objeto “formatado” com campos derivados.

Resposta de sucesso:
- Status: 200
- Corpo:
```json
{
  "id": "project_id",
  "title": "Título",
  "description": "Descrição",
  "detailedDescription": "Descrição",
  "category": "Tecnologia",
  "year": "2025",
  "image": "https://cdn/img.jpg",
  "members": 2,
  "institution": "Universidade X",
  "status": "IN_PROGRESS",
  "team": [
    { "name": "Alice", "role": "PM", "photo": null },
    { "name": "Bruno", "role": "Dev", "photo": "https://cdn/bruno.jpg" }
  ],
  "publications": [],
  "ownerId": "user_id_dono"
}
```

Possíveis erros:
- 404: `Project not found.`
- 500: `Could not fetch project details.`

Exemplo cURL:
```bash
curl -X GET "https://seu-dominio/api/projects/PROJECT_ID"
```

---

### 4) Atualizar projeto

- Método sugerido: PUT ou PATCH
- Rota sugerida: `/projects/:id`
- Parâmetros de rota:
  - `id` (string): ID do projeto.
- Body JSON:
  - `title` (string, opcional)
  - `description` (string, opcional)
  - `image` (string, opcional)
  - `status` (string, opcional; convertido para `ProjectStatus` via `toUpperCase()`)
  - `contactEmail` (string, opcional)
  - `contactPhone` (string, opcional)

Validações:
- Requer autenticação.
- O projeto deve existir.
- Somente o dono (`ownerId`) pode atualizar.

Comportamento:
- Atualiza os campos fornecidos (valores `undefined` não sobrescrevem).
- Retorna o objeto do Prisma com `teamMembers` incluído.

Resposta de sucesso:
- Status: 200
- Corpo (exemplo representativo):
```json
{
  "id": "project_id",
  "title": "Título atualizado",
  "description": "Descrição atualizada",
  "image": "https://cdn/novo.jpg",
  "status": "COMPLETED",
  "contactEmail": "contato@exemplo.com",
  "contactPhone": "+55 11 90000-0000",
  "ownerId": "user_id_dono",
  "createdAt": "2025-08-26T14:00:00.000Z",
  "updatedAt": "2025-08-26T14:10:00.000Z",
  "teamMembers": [
    { "id": "tm1", "name": "Alice", "role": "PM", "photo": null, "projectId": "project_id" }
  ]
}
```

Possíveis erros:
- 403: `User not authenticated.` ou `You are not authorized to update this project.`
- 404: `Project not found.`
- 500: `An error occurred while updating the project.`

Exemplo cURL:
```bash
curl -X PUT "https://seu-dominio/api/projects/PROJECT_ID" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"title":"Novo título","status":"COMPLETED"}'
```

---

### 5) Excluir projeto

- Método sugerido: DELETE
- Rota sugerida: `/projects/:id`
- Parâmetros de rota:
  - `id` (string): ID do projeto.

Validações:
- Requer autenticação.
- O projeto deve existir.
- Somente o dono pode excluir.

Comportamento:
- Exclui membros (`teamMember.deleteMany`) e o projeto em transação atômica (`prisma.$transaction`).

Resposta de sucesso:
- Status: 204 (sem corpo)

Possíveis erros:
- 403: `User not authenticated.` ou `You are not authorized to delete this project.`
- 404: `Project not found.`
- 500: `An error occurred while deleting the project.`

Exemplo cURL:
```bash
curl -X DELETE "https://seu-dominio/api/projects/PROJECT_ID" \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

---

## Estruturas de dados

### Projeto formatado (listagem geral)
- id: string
- title: string
- description: string
- category: string
- year: string (derivado de `createdAt`)
- image: string | null
- members: number (via `_count.teamMembers`)
- institution: string (de `owner.fullName`)
- status: ProjectStatus

### Projeto detalhado formatado (get by id)
- id, title, description, detailedDescription, category, year, image, members, institution, status, ownerId
- team: TeamMember[]
- publications: any[] (sempre `[]` na implementação atual)

TeamMember:
- name: string
- role: string
- photo: string | null

### Projeto “cru” do Prisma (create/update)
- id: string
- title: string
- description: string
- category: string
- image?: string | null
- status: ProjectStatus
- contactEmail?: string | null
- contactPhone?: string | null
- ownerId: string
- createdAt: string (ISO)
- updatedAt: string (ISO)
- teamMembers: { id: string; name: string; role: string; photo: string | null; projectId: string }[]

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

- Status e validações:
  - A validação do enum usa `status.toUpperCase()`. Contudo, a checagem que exige `contactEmail`/`contactPhone` compara `status === 'OPEN_FOR_APPLICATIONS'` de forma case-sensitive; se você enviar `open_for_applications`, a regra não dispara. Considere normalizar o valor antes desta checagem.

- Filtros de listagem:
  - Busca por `search` aplica `OR` em `title`, `description` e `owner.fullName` (insensitive).
  - Filtro de `category` ignora quando `category=all`.
  - Filtro de `year` cria intervalo entre 1º jan do ano e 1º jan do próximo ano quando o ano é válido.

- Exclusão e integridade:
  - A exclusão usa `prisma.$transaction` para remover `teamMembers` e o `project` de forma atômica. Se preferir, configure `onDelete: Cascade` nas relações.

- Consistência de formato:
  - `createProject` e `updateProject` retornam o objeto “cru” (com `teamMembers`); listagem e detalhe retornam objetos “formatados”. Padronize conforme a necessidade do front-end.

- Performance:
  - Índices em `createdAt`, `category` e campos buscados (`title`, `description`, `owner.fullName`) podem melhorar desempenho.
  - Avalie paginação em `getAllProjects` se o volume crescer (offset/cursor).

---

## Exemplos de uso em Router (ilustrativo)

```ts
import { Router } from 'express';
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject
} from './controllers/project.controller';
import { authMiddleware } from './middlewares/auth';

const router = Router();

// Público
router.get('/projects', getAllProjects);
router.get('/projects/:id', getProjectById);

// CRUD (somente autenticado)
router.post('/projects', authMiddleware, createProject);
router.put('/projects/:id', authMiddleware, updateProject);   // ou PATCH
router.delete('/projects/:id', authMiddleware, deleteProject);

export default router;
```

Ajuste caminhos e middlewares conforme a estrutura do seu projeto.