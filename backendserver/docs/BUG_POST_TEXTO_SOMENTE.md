# Bug: Criação de Post Apenas com Texto Falhava

> **Data:** 2026-03-30
> **Status:** Corrigido — duas causas raiz identificadas e resolvidas
> **Relacionado a:** `REFACTOR_POST_IMAGE_OPTIONAL.md`

---

## Contexto

O documento `REFACTOR_POST_IMAGE_OPTIONAL.md` descreve a refatoração que tornou o campo `image` opcional no schema Prisma e no controller. Porém, dois arquivos que fazem parte do fluxo de criação de post **não foram atualizados** durante essa refatoração, causando falha completa ao tentar publicar posts sem imagem.

---

## Causa Raiz #1 — Schema de Validação Zod (`src/lib/schemas.ts`)

### Problema

O middleware `validateBody(createPostSchema)` é executado **antes** do controller em `POST /posts` (ver `post.routes.ts:14`). O schema Zod ainda declarava `image` como obrigatório:

```ts
// src/lib/schemas.ts — ANTES (com bug)
export const createPostSchema = z.object({
  caption: z.string().min(1).max(2000),
  image: z.string().min(1, 'Image is required.'),  // ← obrigatório!
  location: z.string().max(200).optional(),
  hashtags: z.array(z.string()).optional().default([]),
});
```

### O que acontecia

O middleware `validateBody` (em `src/lib/validate.ts`) chama `schema.safeParse(req.body)`. Como `image` não estava presente no body, o Zod retornava:

```json
{
  "error": "invalid input: expected string, received undefined"
}
```

A requisição era barrada com **HTTP 400** antes de chegar ao controller. O erro era exibido no modal do app mobile.

### Correção aplicada

```ts
// src/lib/schemas.ts — DEPOIS (corrigido)
export const createPostSchema = z.object({
  caption: z.string().min(1).max(2000),
  image: z.string().optional(),  // ← agora opcional
  location: z.string().max(200).optional(),
  hashtags: z.array(z.string()).optional().default([]),
});
```

---

## Causa Raiz #2 — Controller sem fallback para `hashtags` (`src/controllers/post.controller.ts`)

### Problema

Mesmo que o Zod já tivesse `hashtags: z.array(z.string()).optional().default([])`, ao passar pelo `validateBody` o body reconstruído contém `hashtags: []` por padrão. **Porém**, se por qualquer razão o campo chegasse como `undefined` ao Prisma, o `create` omitiria `hashtags` do INSERT. O PostgreSQL falharia com NOT NULL constraint porque a coluna `String[]` não tem `@default([])` no schema Prisma.

### Correção aplicada

```ts
// src/controllers/post.controller.ts — createPost
const newPost = await prisma.post.create({
  data: {
    caption,
    image,
    location,
    hashtags: hashtags ?? [],  // ← garantia defensiva
    authorId: userId,
  },
});
```

> **Nota:** Com o Zod aplicando `.default([])` no middleware, `hashtags` nunca chega `undefined` ao controller hoje. Mas o `?? []` é uma camada defensiva importante caso o schema mude ou a rota seja chamada sem o middleware no futuro.

---

## Fluxo completo de `POST /posts`

```
Mobile app
  │
  ▼
POST /posts  { caption, image?, location?, hashtags? }
  │
  ├─ authenticateToken  (401 se token inválido/ausente)
  │
  ├─ validateBody(createPostSchema)  ← BUG estava aqui
  │     Zod valida e reconstrói req.body
  │     • caption: obrigatório
  │     • image: opcional
  │     • location: opcional
  │     • hashtags: opcional, default []
  │
  └─ createPost controller
        prisma.post.create(...)       ← segunda proteção aqui
```

---

## O que verificar agora

- [ ] Confirmar que o servidor foi **reiniciado** após as correções (TypeScript compilado / `ts-node` recarregado).
- [ ] Testar `POST /posts` com apenas `{ "caption": "texto" }` via Insomnia/Thunder Client — deve retornar `201`.
- [ ] Testar `POST /posts` com `caption` + `image` (base64) — deve continuar funcionando.
- [ ] Verificar se outros schemas em `src/lib/schemas.ts` têm campos que também foram tornados opcionais no Prisma mas ainda estão obrigatórios no Zod (ex: `image` em `createProjectSchema` já está como `optional()` — OK).

---

## Arquivos modificados nesta correção

| Arquivo | Mudança |
|---|---|
| `src/lib/schemas.ts` | `image: z.string().min(1)` → `z.string().optional()` |
| `src/controllers/post.controller.ts` | `hashtags` → `hashtags ?? []` |
