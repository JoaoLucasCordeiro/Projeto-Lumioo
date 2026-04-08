# Prompt: Suportar posts de texto puro no feed web

## Contexto

O app mobile (Expo/React Native) já suporta dois tipos de post:

- **Texto puro** — apenas `caption`, sem imagem
- **Texto + foto** — `caption` com `image` (base64 salva no backend)

O frontend web ainda trata `image` como campo obrigatório em todo o sistema. Isso causa bugs silenciosos quando a API retorna posts sem imagem, e impede a criação de posts somente de texto.

A referência de comportamento é o mobile (`mobileclient/Lumioo/app/(app)/feed.tsx` e `create-post.tsx`). O frontend web precisa replicar essa lógica usando sua própria stack (React + Tailwind + TanStack Query + Framer Motion).

---

## Arquivos afetados

### 1. `src/types/feed.ts`

**Problema:** `Post.image` declarado como `string` (não-nulo).

**Fix:** Tornar o campo nullable em toda a interface.

```ts
// ANTES
image: string;

// DEPOIS
image: string | null;
```

Faça o mesmo em `PostDetailsData` e `Comment.userImage` em `src/types/post.ts`:

```ts
// src/types/post.ts
export interface Comment {
  // ...
  userImage: string | null;   // era string
}

export interface PostDetailsData {
  // ...
  image: string | null;       // era string
  // ...
}
```

---

### 2. `src/api/posts.ts`

**Problema:** `createPost` exige `image: string` no payload.

**Fix:** Tornar a imagem opcional.

```ts
// ANTES
export function createPost(payload: {
  caption: string;
  image: string;
  location?: string | null;
  hashtags?: string[];
}): Promise<Post>

// DEPOIS
export function createPost(payload: {
  caption: string;
  image?: string | null;
  location?: string | null;
  hashtags?: string[];
}): Promise<Post>
```

---

### 3. `src/components/shared/Post.tsx`

**Problema:** O componente sempre renderiza um `<div className="aspect-square">` com `<img>`, quebrando quando `image` é `null`.

**Regras de layout:**

- `image: string | null` na interface `PostProps`
- Quando `image` é `null` → **não renderizar o bloco de imagem**; exibir a `caption` de forma mais destacada (fonte maior, mais padding)
- Quando `image` existe → layout atual está ok (imagem em `aspect-square`, caption abaixo)

**Estrutura do card para texto puro** (referência do mobile):
```
┌────────────────────────────────┐
│ [Avatar] @username · Xmin  [⋯] │  ← header igual ao atual
├────────────────────────────────┤
│                                │
│  Texto do post aqui, podendo   │  ← caption em destaque
│  ser longo e com múltiplas     │    (text-base ou text-lg, leading-relaxed)
│  linhas sem limite visual.     │
│                                │
├────────────────────────────────┤
│ ♥ 12  💬 3  ↩   [bookmark]    │  ← actions iguais ao atual
└────────────────────────────────┘
```

**Estrutura do card com foto** (igual ao atual, apenas garantir que só aparece se image != null):
```
┌────────────────────────────────┐
│ [Avatar] @username · Xmin  [⋯] │
├────────────────────────────────┤
│         [imagem 1:1]           │
├────────────────────────────────┤
│ ♥ 12  💬 3  ↩   [bookmark]    │
├────────────────────────────────┤
│ username  caption do post      │
└────────────────────────────────┘
```

**Trecho de referência** (adaptar para o padrão Tailwind do web):
```tsx
// Renderização condicional da imagem
{post.image && (
  <Link to={`/post/${post.id}`} className="block">
    <div className="aspect-square overflow-hidden bg-slate-800">
      <img
        src={post.image}
        alt={post.caption}
        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
      />
    </div>
  </Link>
)}

// Caption: destacada em posts de texto puro
<div className={`px-4 pb-4 ${!post.image ? 'pt-3' : ''}`}>
  {!post.image ? (
    // texto puro: caption grande, clicável para o detalhe
    <Link to={`/post/${post.id}`} className="block">
      <p className="text-base text-slate-100 leading-relaxed whitespace-pre-wrap">
        {post.caption}
      </p>
    </Link>
  ) : (
    // foto+texto: caption compacta abaixo da imagem (layout atual)
    <p className="text-sm text-slate-300 leading-relaxed">
      <Link to={`/perfil/${post.username}`} className="font-semibold text-slate-100 hover:text-red-400 transition-colors mr-1.5">
        {post.username}
      </Link>
      {post.caption}
    </p>
  )}
  {post.comments > 0 && (
    <Link to={`/post/${post.id}`} className="mt-1.5 inline-block text-xs text-slate-500 hover:text-red-400 transition-colors">
      Ver todos os {post.comments.toLocaleString()} comentários
    </Link>
  )}
</div>
```

---

### 4. `src/pages/NewPost.tsx`

**Problema:** O submit é bloqueado quando não há imagem (`if (!image) { setFormError(...) }`). A imagem deve ser **opcional**.

**Regras:**

- Remover a validação que exige imagem
- O botão "Publicar Post" deve ser habilitado quando `caption.trim().length > 0` (independente de imagem)
- O campo de imagem permanece presente — apenas deixa de ser obrigatório
- Manter contador de caracteres visível (limite: 2000 chars, igual ao mobile)
- Atualizar a chamada `mutation.mutate()` para não passar `image` quando for `null`

```tsx
// ANTES
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!image) {
    setFormError("Por favor, selecione uma imagem para o post.");
    return;
  }
  setFormError(null);
  mutation.mutate();
};

// DEPOIS
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!caption.trim()) {
    setFormError("Escreva algo para publicar.");
    return;
  }
  setFormError(null);
  mutation.mutate();
};

// Botão Publicar:
// disabled={!caption.trim() || isLoading}   ← antes era: !image || isLoading

// Payload da mutation:
const mutation = useMutation({
  mutationFn: () =>
    createPost({
      caption,
      ...(image ? { image } : {}),
      location: location || null,
      hashtags,
    }),
  // ...
});
```

---

### 5. `src/components/shared/post-details/PostImage.tsx`

**Problema:** Prop `image: string` (não-nulo); componente sempre renderiza.

**Fix:** Retornar `null` quando não há imagem.

```tsx
interface PostImageProps {
  image: string | null;
  caption: string;
}

export function PostImage({ image, caption }: PostImageProps) {
  if (!image) return null;

  return (
    <div className="md:w-1/2 flex-shrink-0 bg-slate-950 overflow-hidden">
      <div className="aspect-square md:aspect-auto md:h-full">
        <img src={image} alt={caption} className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
```

---

### 6. `src/pages/PostDetails.tsx`

**Problema:** O layout divide a modal em dois painéis (esquerdo = imagem, direito = comentários). Quando não há imagem, o painel esquerdo some mas o direito ainda ocupa apenas `md:w-1/2`, deixando metade da tela vazia.

**Fix:** Layout condicional — sem imagem, o painel de comentários ocupa 100% da largura.

```tsx
// ANTES (sempre dividido)
<motion.div className="... max-w-5xl w-full ... flex flex-col md:flex-row">
  <PostImage image={post.image} caption={post.caption} />
  <div className="md:w-1/2 flex flex-col ...">
    ...
  </div>
</motion.div>

// DEPOIS (adapta ao tipo de post)
<motion.div className={`... w-full flex flex-col ${post.image ? 'md:flex-row max-w-5xl' : 'max-w-xl'}`}>
  {post.image && <PostImage image={post.image} caption={post.caption} />}
  <div className={`flex flex-col ${post.image ? 'md:w-1/2' : 'w-full'} ...`}>
    ...
  </div>
</motion.div>
```

---

## Ordem de execução recomendada

1. Corrigir tipos em `src/types/feed.ts` e `src/types/post.ts`
2. Atualizar `src/api/posts.ts`
3. Atualizar `src/components/shared/post-details/PostImage.tsx`
4. Atualizar `src/pages/PostDetails.tsx`
5. Atualizar `src/components/shared/Post.tsx`
6. Atualizar `src/pages/NewPost.tsx`

Ao final, verificar se há outros arquivos que usem `Post.image` ou `PostDetailsData.image` como não-nulo e corrigi-los da mesma forma (ex: `AllPosts.tsx`, `EditPosts.tsx`, `Profile.tsx`).

---

## Paleta e padrão visual (não alterar)

Manter todos os estilos Tailwind existentes. Não introduzir novas dependências. A cor de acento primária é `#ff3131` (vermelho Lumioo). Background dark: `slate-900`, containers: `slate-800/50`, bordas: `white/[0.06]`.
