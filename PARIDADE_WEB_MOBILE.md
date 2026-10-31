# Paridade Web × Mobile — Lumioo

**Data:** 20/10/2026
**Objetivo:** listar o que a web já tem, o que o app mobile já cobre e o que falta (telas + integrações com a API), para planejar o desenvolvimento.

Legenda: ✅ completo · 🟡 parcial · ❌ não existe

Base de comparação: rotas de `frontendclient/src/App.tsx`, funções de `frontendclient/src/api/`, telas de `mobileclient/Lumioo/app/` e rotas de `backendserver/src/routes/`.

---

## 1. Resumo

| Área | Web | Mobile | Esforço no mobile |
|---|---|---|---|
| Autenticação (login/cadastro) | ✅ | ✅ | — |
| Recuperação de senha | ❌ (backend também não tem endpoint) | 🟡 telas com `TODO`, sem API | Depende de backend |
| Feed | ✅ | ✅ | — |
| Posts (CRUD, curtir, salvar) | ✅ | ✅ | — |
| Comentários | ✅ | ✅ | — |
| Perfil (próprio e público) | ✅ | ✅ | — |
| Configurações / trocar senha | ✅ | ✅ (sem notificações/idioma, que na web são só visuais) | — |
| Seguir / bloquear | ✅ | ✅ | — |
| Chat / mensagens | ✅ | ✅ | — |
| Projetos | ✅ | ✅ (falta estatísticas/sugestões e contato) | Baixo |
| Trabalhos | ✅ | 🟡 falta fluxo de acesso privado, estatísticas e contato | Médio |
| Mapa acadêmico | ✅ | ❌ | Alto |
| Páginas institucionais (landing, nosso time) | ✅ | ❌ (só landing básica) | Baixo/opcional |

---

## 2. Comparação por funcionalidade

### 2.1 Autenticação

| Item | Web | Mobile | Endpoint |
|---|---|---|---|
| Login | ✅ `/login` | ✅ `auth/login` | `POST /auth/signin` |
| Cadastro | ✅ `/cadastro` | ✅ `auth/register` | `POST /users` |
| Esqueci a senha / código | ❌ | 🟡 `forgot-password`, `recovery-code` (TODO, sem lógica) | **Não existe no backend** |
| Alterar senha logado | ✅ em `/configuracoes` | ✅ `change-password.tsx` | `POST /profile/password` |

Observação: as duas telas de recuperação do mobile não têm nenhum endpoint correspondente. Ou o backend ganha o fluxo (gerar código, enviar e-mail, validar, redefinir), ou as telas devem ser removidas/escondidas.

### 2.2 Feed e posts

| Item | Web | Mobile | Endpoint |
|---|---|---|---|
| Feed com cursor | ✅ | ✅ | `GET /feed?cursor=` |
| Lista geral de posts com filtros por tipo | ✅ `/posts` | ❌ | `GET /posts` |
| Detalhe do post | ✅ | ✅ | `GET /posts/:id` |
| Criar post (imagem opcional / texto puro) | ✅ | ✅ | `POST /posts` |
| Editar post | ✅ `/post/:id/edit` | ✅ `edit-post.tsx` (legenda e imagem; o detalhe da API não devolve local/hashtags) | `PUT /posts/:id` |
| Excluir post | ✅ | ✅ | `DELETE /posts/:id` |
| Curtir / salvar | ✅ | ✅ | `POST /posts/:id/like`, `/save` |
| Comentar, editar, excluir comentário | ✅ | ✅ | `/posts/:id/comments`, `/comments/:id` |
| Curtir comentário | ✅ | ✅ | `POST /comments/:id/like` |
| Lista de posts salvos | ❌ (nenhum endpoint de listagem) | ❌ | — |

### 2.3 Perfil, configurações e social

| Item | Web | Mobile | Endpoint |
|---|---|---|---|
| Meu perfil | ✅ `/perfil` | ✅ aba Perfil (`ProfileView`) | `GET /profile` |
| Perfil público | ✅ `/perfil/:username` | ✅ `user/[username]`; autor do post no feed e no detalhe é clicável | `GET /profile/:username` |
| Editar perfil (nome, usuário, bio, foto, capa) | ✅ | ✅ `edit-profile.tsx` | `PUT /profile` |
| Configurações | ✅ | ✅ `settings.tsx` (editar perfil, senha, bloqueados, sair) | `PUT /profile`, `POST /profile/password` |
| Seguir / deixar de seguir | ✅ | ✅ | `POST/DELETE /follow/:userId` |
| Seguidores / seguindo (lista) | ✅ | ✅ modal paginado por cursor | `GET /users/:userId/followers`, `/following` |
| Bloquear / desbloquear / listar bloqueados | ✅ | ✅ bloquear no menu do perfil; desbloquear em `blocked-users.tsx` | `POST/DELETE /block/:userId`, `GET /blocked` |
| Posts do usuário no perfil (abas) | ✅ | ✅ posts e salvos (salvos só no próprio perfil) | dados de `/profile` (até 20 posts) |

### 2.4 Chat

| Item | Web | Mobile | Endpoint |
|---|---|---|---|
| Lista de conversas | ✅ `/mensagens` | ✅ `messages.tsx` (ícone de chat no canto superior direito da home) | `GET /conversations` |
| Iniciar conversa | ✅ | ✅ por @usuário, pelo botão "Mensagem" no perfil, no autor do trabalho e no contato do projeto | `POST /conversations` |
| Histórico de mensagens | ✅ | ✅ `chat/[id].tsx` | `GET /conversations/:id/messages` |
| Envio/recebimento em tempo real | ✅ Socket.IO | ✅ `socket.io-client` (lib/socket.ts), com reconexão e recarga do histórico | Socket.IO: `joinConversation`, `sendMessage`, `receiveMessage` |

### 2.5 Projetos

| Item | Web | Mobile | Endpoint |
|---|---|---|---|
| Listagem com filtros | ✅ `/projetos`, `/explorar-projetos` | ✅ `projects.tsx` | `GET /projects` |
| Estatísticas | ✅ | ❌ (não consome) | `GET /projects/stats` |
| Sugestões (autocomplete/busca) | ✅ | ❌ | `GET /projects/suggestions` |
| Detalhe | ✅ | ✅ `project/[id]` | `GET /projects/:id` |
| Criar | ✅ | ✅ (envia cidade/UF/país/campus, exigidos pela API) | `POST /projects` |
| Editar / excluir | 🟡 só funções de API, **sem tela** | ✅ menu do dono no detalhe; edição não altera categoria nem equipe (a API ignora) | `PUT/DELETE /projects/:id` |
| Localização | ✅ (commit `895aa3a`) | ✅ | campos em `POST/PUT /projects` (projetos não têm visibilidade nem área no schema) |
| Botão "Contato" (abre conversa) | ✅ | ✅ envia a primeira mensagem e abre a conversa | `POST /conversations` |

### 2.6 Trabalhos acadêmicos

| Item | Web | Mobile | Endpoint |
|---|---|---|---|
| Listagem com filtro por tipo e área | ✅ | ✅ `jobs.tsx` (tipo + área) | `GET /works` |
| Estatísticas | ✅ | ❌ | `GET /works/stats` |
| Sugestões | ✅ | ❌ | `GET /works/suggestions` |
| Detalhe | ✅ | ✅ `work/[id]` | `GET /works/:id` |
| Criar (PDF + capa) | ✅ | ✅ visibilidade, área e localização | `POST /works` |
| Editar / excluir | 🟡 só funções de API, **sem tela** | ✅ menu do dono no detalhe | `PUT/DELETE /works/:id` |
| Download do PDF | ✅ | ✅ grava no cache e abre a folha de compartilhar (`expo-file-system` + `expo-sharing`); "Visualizar" usa o PDF do detalhe, sem contar download | `GET /works/:id/download` (retorna `{ pdfFile, title }` em base64) |
| **Trabalho privado: solicitar acesso** | ✅ | ❌ | `POST /works/:id/access-requests` |
| **Autor: ver e responder pedidos** | ✅ | ❌ | `GET /works/:id/access-requests`, `PATCH /works/:id/access-requests/:requestId` |
| **Meus pedidos de acesso** | ✅ | ❌ | `GET /works/access-requests/mine` |
| Botão "Contato" | ✅ | ✅ botão "Mensagem" no cartão do autor | `POST /conversations` |

### 2.7 Mapa acadêmico e institucional

| Item | Web | Mobile |
|---|---|---|
| Mapa de trabalhos e projetos por localidade (`/mapa`) | ✅ (`Map.tsx`, `lib/mapCoordinates.ts`) | ❌ |
| Landing page, Nosso time, UniversityRecognition | ✅ | ❌ (só `index.tsx` simples) |

O mapa depende de localização nos itens (país/UF) e das coordenadas em `mapCoordinates.ts`. No mobile, a opção mais barata é reaproveitar essa tabela de coordenadas e usar `react-native-maps`, ou uma lista agrupada por UF como primeira versão.

---

## 3. Lacunas de integração (camada de dados)

O mobile usa `axios` (`lib/api.ts`) e só dois hooks de React Query (`lib/hooks/useProjects.ts`, `useWorks.ts`); o restante das telas chama `api.get/post` direto dentro do componente. A web já organiza tudo em `src/api/*.ts` + `queryKeys.ts`.

Sugestão para o mobile, espelhando a web:

```
lib/api/
├── posts.ts          # feed, posts, comentários, curtir/salvar
├── profile.ts        # perfil, senha
├── follow.ts         # follow/block/followers
├── conversations.ts  # conversas e mensagens (REST)
├── projects.ts
├── works.ts          # inclui access-requests e download
└── queryKeys.ts
lib/socket.ts         # cliente Socket.IO (token do SecureStore)
```

Também faltam no mobile:
- Constantes de áreas do conhecimento e UFs/países (hoje em `frontendclient/src/api/works.ts`: `WORK_AREA_OPTIONS`, `WORK_AREA_LABELS`, `BRAZILIAN_UF_CODES`, `COUNTRY_OPTIONS`); copiar ou extrair para um módulo compartilhado.
- Tratamento de `401` consistente (o interceptor existe em `lib/api.ts`; validar o fluxo de logout).
- Telas ainda alimentadas por `constants/feedData.ts`, `projectsData.ts`, `worksData.ts`: confirmar se são resquícios de mock e remover.

---

## 4. Plano sugerido (ordem por valor/esforço)

**Fase 1 — fechar o que já existe (baixo esforço) — ✅ concluída em 20/10/2026**
1. Editar post (`PUT /posts/:id`) e curtir comentário.
2. Campos novos em criar projeto/trabalho: visibilidade, localização, área do conhecimento.
3. Editar/excluir projeto e trabalho (só para o autor).
4. Corrigir o download do PDF (salvar com `expo-file-system` e abrir/compartilhar com `expo-sharing`).

**Fase 2 — perfil e social — ✅ concluída em 20/10/2026**
5. Tela de perfil (próprio + público por username) com abas de posts, contadores e botão seguir.
6. Configurações: editar perfil e trocar senha.
7. Modais de seguidores/seguindo e bloqueio.

**Fase 3 — chat — ✅ concluída em 21/10/2026**
8. Lista de conversas + tela de conversa (REST para histórico).
9. Socket.IO em tempo real; botão "Contato" em projetos e trabalhos.

**Fase 4 — acesso privado e mapa**
10. Fluxo de pedido de acesso a trabalho privado (solicitar, aprovar/recusar, meus pedidos).
11. Mapa acadêmico (ou lista por localidade).
12. Estatísticas e sugestões em projetos/trabalhos.

**Fora do escopo até decidir:** recuperação de senha (exige novo fluxo no backend) e páginas institucionais.

---

## 5. Decisões em aberto

1. **Recuperação de senha:** implementar no backend (e-mail + código) ou remover as telas?
2. **Posts salvos:** hoje é possível salvar, mas nenhuma interface (web ou mobile) lista os salvos e não há endpoint de listagem. Criar?
3. **Mapa no mobile:** `react-native-maps` ou versão em lista?
4. **Compartilhar constantes** (áreas, UFs, tipos) entre web e mobile ou duplicar?

> Fonte dos dados: leitura do código e dos commits até `68d12ce`. A coluna "Mobile" foi verificada pelos arquivos em `mobileclient/Lumioo/app` e pelas chamadas `api.*` encontradas; telas que não aparecem nessas buscas foram marcadas como ausentes.
