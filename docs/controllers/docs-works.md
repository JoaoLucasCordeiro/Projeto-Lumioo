# Documentação — Work Controller

Este documento descreve o comportamento do controller de trabalhos acadêmicos localizado em `backendserver/src/controllers/work.controller.ts`. Ele expõe handlers para criação, listagem com filtros, leitura por ID, contagem de download, atualização e exclusão de trabalhos.

Observações:
- A interface `AuthenticatedRequest` foi removida, mas o controller ainda espera que um middleware de autenticação adicione `user` ao `req` (ex.: `req.user = { userId: '...' }`).
- Autenticação e autorização:
  - `createWork`, `updateWork` e `deleteWork` exigem usuário autenticado; `updateWork` e `deleteWork` também checam autoria (somente o autor pode alterar/excluir).
  - `getAllWorks`, `getWorkById` e `downloadWorkById` não exigem autenticação no controller.
- `workType` é validado contra o enum `WorkType` do Prisma; o valor recebido é convertido para maiúsculas antes de salvar.
- `keywords` deve conter entre 3 e 5 itens; `references` deve ser um array.
- As rotas abaixo são sugestões baseadas nos parâmetros utilizados. Ajuste conforme o `Router` do seu projeto.

## Dependências e contexto

- Framework: Express
- ORM: Prisma (`@prisma/client`)
- Autenticação: endpoints que usam `req.user?.userId` dependem de um middleware (por exemplo, baseado em JWT) que popula `req.user`. O tipo padrão de `Request` do Express não possui `user`; veja “Notas de implementação”.
- Modelos Prisma referenciados:
  - `work` (principal)
  - relacionamento `author` (seleciona `fullName` em consultas)

## Regras gerais de autorização e validação

- Autenticação obrigatória para:
  - `createWork`
  - `updateWork` (também valida se `authorId` do trabalho é o do usuário autenticado)
  - `deleteWork` (idem)
- Sem autenticação explícita no controller:
  - `getAllWorks`
  - `getWorkById`
  - `downloadWorkById`
- Validações mínimas implementadas em `createWork`:
  - obrigatórios: `title`, `workType`, `summary`, `description`, `keywords`, `references`, `advisor`, `institution`, `pdfFile`
  - `workType`: deve existir no enum `WorkType` (comparação com valor em maiúsculas)
  - `keywords`: array com tamanho entre 3 e 5
  - `references`: deve ser array
- Em erros internos, retorna 500 com mensagem genérica.

## Handlers

### Criar trabalho — `createWork`

- Método sugerido: POST
- Rota sugerida: `/works`
- Autenticação: obrigatória (usa `req.user?.userId`)
- Corpo (JSON):
  - `title` (string) — obrigatório
  - `workType` (string — enum, ex.: TCC, DISSERTATION, etc.) — obrigatório
  - `coverImage` (string URL) — opcional
  - `summary` (string) — obrigatório
  - `description` (string) — obrigatório
  - `keywords` (string[]) — obrigatório, entre 3 e 5 itens
  - `references` (string[]) — obrigatório
  - `advisor` (string) — obrigatório
  - `institution` (string) — obrigatório
  - `department` (string) — opcional
  - `pdfFile` (string URL) — obrigatório

Comportamento:
- Valida campos obrigatórios, tipo de `workType`, tamanho de `keywords` e que `references` é array.
- Converte `workType` para maiúsculas e persiste como `WorkType`.
- Define `downloads` inicial como 0.
- Associa o trabalho ao `authorId` do usuário autenticado.

Resposta de sucesso:
- Status: 201
- Corpo: objeto `Work` criado (conforme modelo Prisma do projeto).

Possíveis erros:
- 400: `All required fields must be provided.`
- 400: `Invalid workType value.`
- 400: `You must provide between 3 and 5 keywords.`
- 400: `References must be an array.`
- 403: `User not authenticated.`
- 500: `An error occurred while creating the work.`

Exemplo cURL:
```bash
curl -X POST "https://seu-dominio/api/works" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Aplicação de IA em Educação",
    "workType": "tcc",
    "coverImage": "https://cdn.exemplo.com/capas/ia-edu.png",
    "summary": "Resumo do trabalho...",
    "description": "Descrição detalhada...",
    "keywords": ["IA", "Educação", "Aprendizado de Máquina"],
    "references": ["Autor A (2020)", "Autor B (2021)"],
    "advisor": "Prof. Dr. Silva",
    "institution": "Universidade X",
    "department": "Computação",
    "pdfFile": "https://cdn.exemplo.com/pdfs/ia-edu.pdf"
  }'
```

---

### Listar trabalhos com filtros — `getAllWorks`

- Método sugerido: GET
- Rota sugerida: `/works`
- Query params (todos opcionais):
  - `search` (string): busca em `title`, `summary`, `author.fullName` (case-insensitive) e `keywords` (via operador `has`)
  - `workType` (string): filtrado contra enum (case-insensitive via `.toUpperCase()`)
  - `year` (number/string): filtra por intervalo de data em `createdAt` do ano especificado
  - `area` (string): aplicado como `contains` em `institution` (case-insensitive)

Comportamento:
- Monta `whereClause` dinamicamente com OR/AND conforme filtros.
- Ordena por `createdAt desc`.
- Inclui `author.fullName`.
- Retorna lista formatada com os campos:
  - `id`, `title`, `author` (string), `type` (enum), `area` (mapeado de `institution`), `year` (derivado de `createdAt`), `abstract` (de `summary`), `keywords`, `downloads`, `image` (de `coverImage`).

Resposta de sucesso:
- Status: 200
- Corpo: `Array<{
    id: string
    title: string
    author: string
    type: WorkType
    area: string
    year: string
    abstract: string
    keywords: string[]
    downloads: number
    image?: string
  }>`.

Possíveis erros:
- 500: `An error occurred while fetching works.`

Exemplo cURL:
```bash
# Busca por "IA" no ano de 2025 e tipo TCC
curl -X GET "https://seu-dominio/api/works?search=IA&year=2025&workType=TCC"
```

Exemplo de resposta (parcial):
```json
[
  {
    "id": "WORK_ID",
    "title": "Aplicação de IA em Educação",
    "author": "João da Silva",
    "type": "TCC",
    "area": "Universidade X",
    "year": "2025",
    "abstract": "Resumo do trabalho...",
    "keywords": ["IA", "Educação", "Aprendizado de Máquina"],
    "downloads": 12,
    "image": "https://cdn.exemplo.com/capas/ia-edu.png"
  }
]
```

---

### Buscar trabalho por ID — `getWorkById`

- Método sugerido: GET
- Rota sugerida: `/works/:id`
- Parâmetros de rota:
  - `id` (string)

Comportamento:
- Busca via `findUnique` com `include: { author: { select: { fullName: true } } }`.
- Se não encontrado, retorna 404.
- Retorna objeto formatado com:
  - `id`, `title`, `author` (fullName), `type`, `area` (institution), `year` (de `createdAt`)
  - `abstract` (summary), `detailedDescription` (description)
  - `keywords`, `downloads`, `fileUrl` (pdfFile), `image` (coverImage)
  - `advisor`, `institution`, `department`, `references`.

Respostas:
- 200: objeto detalhado formatado
- 404: `Work not found.`
- 500: `An error occurred while fetching the work.`

Exemplo cURL:
```bash
curl -X GET "https://seu-dominio/api/works/WORK_ID"
```

Exemplo de resposta (parcial):
```json
{
  "id": "WORK_ID",
  "title": "Aplicação de IA em Educação",
  "author": "João da Silva",
  "type": "TCC",
  "area": "Universidade X",
  "year": "2025",
  "abstract": "Resumo do trabalho...",
  "detailedDescription": "Descrição detalhada...",
  "keywords": ["IA", "Educação", "Aprendizado de Máquina"],
  "downloads": 12,
  "fileUrl": "https://cdn.exemplo.com/pdfs/ia-edu.pdf",
  "image": "https://cdn.exemplo.com/capas/ia-edu.png",
  "advisor": "Prof. Dr. Silva",
  "institution": "Universidade X",
  "department": "Computação",
  "references": ["Autor A (2020)", "Autor B (2021)"]
}
```

---

### Registrar download e obter arquivo — `downloadWorkById`

- Método sugerido: POST
- Rota sugerida: `/works/:id/download`

Comportamento:
- Utiliza transação Prisma para incrementar `downloads` em 1 de forma atômica.
- Retorna `pdfFile` e `title` do trabalho.

Respostas:
- 200: `{ "pdfFile": "URL", "title": "..." }`
- 404: `Work not found.` (após tentativa de update falhar com id inexistente)
- 500: `An error occurred while downloading the work.`

Exemplo cURL:
```bash
curl -X POST "https://seu-dominio/api/works/WORK_ID/download"
```

---

### Atualizar trabalho — `updateWork`

- Método sugerido: PATCH
- Rota sugerida: `/works/:id`
- Autenticação: obrigatória (usa `req.user?.userId`)
- Autorização: somente o autor do trabalho
- Corpo (JSON — todos opcionais):
  - `title`, `workType`, `coverImage`, `summary`, `description`,
  - `keywords` (string[]), `references` (string[]),
  - `advisor`, `institution`, `department`, `pdfFile`.

Comportamento:
- Verifica existência do trabalho e se `authorId` é igual ao usuário autenticado.
- Converte `workType` para maiúsculas se fornecido.
- Atualiza apenas os campos enviados (outros ficam `undefined` e não são alterados).
- Não refaz validações de quantidade de `keywords` e formato de `references` (avaliar adicionar).

Respostas:
- 200: trabalho atualizado (modelo Prisma)
- 403: `User not authenticated.` ou `You are not authorized to update this work.`
- 404: `Work not found.`
- 500: `An error occurred while updating the work.`

Exemplo cURL:
```bash
curl -X PATCH "https://seu-dominio/api/works/WORK_ID" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Novo título", "workType": "DISSERTATION" }'
```

---

### Excluir trabalho — `deleteWork`

- Método sugerido: DELETE
- Rota sugerida: `/works/:id`
- Autenticação: obrigatória (usa `req.user?.userId`)
- Autorização: somente o autor do trabalho

Comportamento:
- Verifica existência do trabalho e se `authorId` é igual ao usuário autenticado.
- Exclui o trabalho pelo `id`.

Respostas:
- 204: sem corpo
- 403: `User not authenticated.` ou `You are not authorized to delete this work.`
- 404: `Work not found.`
- 500: `An error occurred while deleting the work.`

Exemplo cURL:
```bash
curl -X DELETE "https://seu-dominio/api/works/WORK_ID" \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

---

## Estruturas de dados

### work (modelo Prisma — inferido do código; depende do schema)
Campos típicos:
- id: string
- title: string
- workType: WorkType (enum)
- coverImage?: string
- summary: string
- description: string
- keywords: string[]
- references: string[]
- advisor: string
- institution: string
- department?: string
- pdfFile: string
- authorId: string
- downloads: number
- createdAt: Date
- updatedAt: Date

Relacionamentos utilizados:
- author: { fullName: string }

### Objeto de resposta formatado em `getAllWorks`
- `id`: string
- `title`: string
- `author`: string (fullName)
- `type`: WorkType
- `area`: string (institution)
- `year`: string (derivado de `createdAt`)
- `abstract`: string (summary)
- `keywords`: string[]
- `downloads`: number
- `image?`: string (coverImage)

### Objeto de resposta formatado em `getWorkById`
- `id`, `title`, `author`, `type`, `area`, `year`
- `abstract`, `detailedDescription`
- `keywords`, `downloads`
- `fileUrl`, `image`
- `advisor`, `institution`, `department`, `references`

---

## Notas de implementação

- Tipagem de `req.user` no Express:
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
  Garanta que o middleware de autenticação popula `req.user`.

- Validação de enum `WorkType`:
  - O código usa `Object.values(WorkType).includes(typeString as WorkType)` após `toUpperCase()`. Certifique-se que os valores do enum no Prisma são em maiúsculas ou normalize no controller.

- Transação em `downloadWorkById`:
  - O incremento de `downloads` é feito em transação para evitar condições de corrida. Alternativamente, pode-se usar `update` simples com `increment` se não houver outras operações dependentes.

- Busca e performance:
  - `getAllWorks` não implementa paginação. Considere adicionar `page`/`limit` e índices nos campos `createdAt`, `title`, e possivelmente `institution`.
  - O filtro `keywords` usa `has` (array). Avalie cardinalidade e índices (PostgreSQL: GIN em arrays).

- Internacionalização:
  - Mensagens atualmente em inglês. Considere padronizar idioma de respostas conforme a aplicação (pt-BR vs en-US).

- Segurança:
  - URLs em `pdfFile` e `coverImage` são retornadas diretamente. Caso os arquivos sejam privados, utilize URLs assinadas temporárias em vez de links públicos.

---

## Exemplo de uso em Router (ilustrativo)

```ts
import { Router } from 'express';
import {
  createWork,
  getAllWorks,
  getWorkById,
  downloadWorkById,
  updateWork,
  deleteWork
} from './controllers/work.controller';
import { authMiddleware } from './middlewares/auth';

const router = Router();

router.get('/works', getAllWorks);
router.get('/works/:id', getWorkById);
router.post('/works/:id/download', downloadWorkById);

router.post('/works', authMiddleware, createWork);
router.patch('/works/:id', authMiddleware, updateWork);
router.delete('/works/:id', authMiddleware, deleteWork);

export default router;
```

Ajuste caminhos e middlewares conforme a estrutura e a política de acesso do seu projeto.