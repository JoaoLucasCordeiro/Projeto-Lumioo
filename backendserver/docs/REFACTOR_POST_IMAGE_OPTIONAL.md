# Refatoração: Imagem opcional em Posts

> **Data:** 2026-03-31
> **Escopo:** Backend + Prisma schema
> **Status:** Aplicado em dev — migration `20260331003638_make_post_image_optional`

---

## O que mudou

Antes desta alteração, a entidade `Post` exigia uma imagem para todo e qualquer post. Isso impedia que usuários publicassem conteúdo puramente textual — um fluxo comum em redes sociais acadêmicas (dúvidas, atualizações, discussões).

### Schema Prisma (`prisma/schema.prisma`)

```diff
 model Post {
   id        String   @id @default(cuid())
   caption   String
-  image     String
+  image     String?   // agora opcional
   location  String?
   hashtags  String[]
   ...
 }
```

### Controller (`src/controllers/post.controller.ts`)

```diff
- if (!caption || !image) {
-   return res.status(400).json({ error: 'Caption and image are required.' });
- }
+ if (!caption) {
+   return res.status(400).json({ error: 'Caption is required.' });
+ }
```

---

## Contrato atualizado da API

### `POST /posts` 🔐

Cria um novo post. Somente `caption` é obrigatório.

**Body:**

```json
{
  "caption": "string (obrigatório)",
  "image":   "string base64 (opcional) — ex: \"data:image/jpeg;base64,/9j/...\"",
  "location": "string (opcional)",
  "hashtags": ["string"] // opcional
}
```

**Exemplos válidos:**

```jsonc
// Post só com texto
{ "caption": "Alguém tem material sobre redes neurais convolucionais?" }

// Post com imagem
{
  "caption": "Resultado do meu experimento de hoje",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgAB...",
  "hashtags": ["ciencia", "pesquisa"]
}
```

**Resposta `201`:**

```json
{
  "id": "cuid",
  "caption": "...",
  "image": "data:image/jpeg;base64,..." ,  // null se não enviado
  "location": null,
  "hashtags": [],
  "authorId": "cuid",
  "createdAt": "2026-03-31T00:00:00.000Z"
}
```

> O campo `image` na resposta será `null` quando não enviado — trate isso no componente de exibição com renderização condicional.

---

## Implementação no React Native / Expo

O `create-post.tsx` **já está correto** — nenhuma alteração necessária no mobile.
A tela usa spread condicional para só enviar `image` quando o usuário selecionou uma:

```tsx
// app/(app)/create-post.tsx — handleSubmit (linha ~86)
await api.post('/posts', {
  caption: caption.trim(),
  ...(image    ? { image: image.base64 }         : {}),
  ...(location ? { location: location.trim() }   : {}),
  ...(hashtags.length > 0 ? { hashtags }         : {}),
});
```

O botão "Publicar" já era habilitado apenas com `caption`:

```tsx
const canSubmit = caption.trim().length > 0 && !isSubmitting;
```

### O que verificar nos componentes de exibição

Qualquer componente que renderiza posts **deve tratar `image` como nullable**. Exemplo:

```tsx
// Antes — assumia que image sempre existe
<Image source={{ uri: post.image }} style={styles.postImage} />

// Depois — renderização condicional
{post.image ? (
  <Image source={{ uri: post.image }} style={styles.postImage} />
) : null}
```

Se você usa um componente `PostCard`, verifique se o tipo `Post` já reflete isso:

```ts
// types/post.ts (ou onde estiver definido)
export interface Post {
  id: string;
  caption: string;
  image: string | null;  // era string, agora string | null
  location: string | null;
  hashtags: string[];
  // ...
}
```

---

## Checklist de integração

- [x] Backend — campo `image` opcional no schema
- [x] Backend — validação do controller atualizada
- [x] Backend — migration aplicada no banco dev
- [x] Mobile — `create-post.tsx` já usa spread condicional (nenhuma mudança necessária)
- [ ] Mobile — verificar componentes que **exibem** posts (`PostCard`, `feed.tsx`, `post/[id].tsx`) e garantir renderização condicional de `image`
- [ ] Mobile/Web — atualizar o tipo `Post` para `image: string | null` se definido explicitamente
