# Relatório do Sistema — Lumioo

**Data de geração:** 20/10/2026
**Base da análise:** histórico git (309 commits), código-fonte dos três apps e documentação existente no repositório.

---

## 1. Visão geral

Lumioo é uma rede social acadêmica: estudantes, professores e pesquisadores publicam posts, projetos e trabalhos (TCC, artigo, tese, dissertação), seguem outros usuários, conversam por chat e exploram a produção científica por localidade (observatório científico digital da UPE).

O repositório é um monorepo com três aplicações independentes, sem workspaces:

| App | Pasta | Stack | Papel |
|---|---|---|---|
| API | `backendserver/` | Express 4, TypeScript, Prisma 6, PostgreSQL, Zod, Socket.IO | REST + chat em tempo real |
| Web | `frontendclient/` | React 19, Vite, Tailwind 4, shadcn/ui, TanStack Query 5, React Router 7 | SPA principal |
| Mobile | `mobileclient/Lumioo/` | Expo / React Native, expo-router, NativeWind, axios | App móvel |

## 2. Números

| Item | Valor |
|---|---|
| Commits | 309 (um único autor: JoaoLucasCordeiro) |
| Primeiro commit | 14/05/2025 |
| Último commit | 19/08/2026 |
| Arquivos versionados em `src` (backend) | 30 |
| Arquivos versionados em `src` (web) | 100 |
| Arquivos de rotas em `app` (mobile) | 19 |
| Endpoints REST (handlers em `routes/`) | 52 |
| Modelos Prisma | 13 |
| Enums Prisma | 6 |
| Páginas da web | 21 |

## 3. Estado atual por camada

### 3.1 Backend (mais maduro)

- **Domínios:** auth, usuários/perfil, posts, comentários, curtidas, posts salvos, projetos, trabalhos, chat, seguidores e bloqueio.
- **Modelos:** `User`, `Post`, `Comment`, `Like` (polimórfico: post ou comentário), `SavedPost`, `Project`, `TeamMember`, `Work`, `WorkAccessRequest`, `Follow`, `Block`, `Conversation`, `Message`.
- **Trabalhos** têm visibilidade (`WorkVisibility`), área do conhecimento (`WorkArea`), localização e fluxo de pedido de acesso (`WorkAccessStatus`) para trabalhos privados.
- **Validação:** Zod por rota (`validateBody`, schemas em `src/lib/schemas.ts`).
- **Segurança:** JWT (`authenticateToken` / `optionalAuthenticateToken`), CORS com múltiplas origens por variável de ambiente, rate limiting em três níveis (conta 5/15min, escrita 30/15min, social 60/15min), restrição de PII em `GET /users` e `GET /users/:id`.
- **Chat:** histórico via REST, mensagens ao vivo via Socket.IO autenticado por JWT.
- **Armazenamento:** imagens e PDFs em base64 no PostgreSQL (limite de body de 10 MB).

### 3.2 Web (mais completo em funcionalidades)

- Landing page, login/cadastro, feed com paginação por cursor e scroll infinito, posts (inclusive texto puro, estilo post-it), detalhes com comentários, perfil público/privado, seguidores e bloqueio, projetos, trabalhos, mensagens, configurações e página "Nosso time".
- **Mapa acadêmico** (`Map.tsx` + `lib/mapCoordinates.ts`) com trabalhos e projetos por localidade.
- Camada de API centralizada (`apiFetch`, `queryKeys`) e cache com TanStack Query.

### 3.3 Mobile (em andamento)

- Integrado com a API real em 30/03/2026: login/cadastro, feed com paginação por cursor, detalhe de post com comentários, criação de post (imagem opcional), listagem e criação de projetos e trabalhos.
- Pendências visíveis no código: recuperação de senha (`forgot-password.tsx`, `recovery-code.tsx`) com `TODO`; não há telas de chat, seguidores/bloqueio nem mapa.
- Não houve commit mobile de código após 08/04/2026, então as novidades de agosto (visibilidade, localização, área do conhecimento) não parecem ter sido levadas ao app.
- O `RELATORIO_PARCIAL.md` do mobile é de 03/03/2026 e está desatualizado (descreve projetos/trabalhos/perfil como placeholders).

## 4. Linha do tempo dos commits

| Período | Foco | Destaques |
|---|---|---|
| 30/03/2026 | Mobile + API | Integração do app com a API, telas de criação de post/projeto/trabalho, imagem opcional em posts, referência completa da API, CORS multi-origem |
| 08/04/2026 | Web + backend social | Posts de texto puro, nova grade de posts com filtros, modelos `Follow`/`Block` e sistema de seguidores, perfil público enriquecido com estado social, botão de contato em projetos/trabalhos, cards de projetos redesenhados, documentação dos endpoints |
| 21/04/2026 | Web | Correção de tipo em `AvatarImage` |
| 19/08/2026 | Trabalhos/projetos + segurança | (1) Backend: visibilidade privada, localização e área do conhecimento (+769 linhas); (2) web consome os novos campos (+726); (3) correção de contraste em `Select`; (4) mapa acadêmico (+678); (5) correção de exposição de PII; (6) rate limiting |

**Leitura do ritmo:** o desenvolvimento ocorre em rajadas (4 datas nos últimos commits) e o último dia concentrou 6 commits, incluindo um ciclo completo de funcionalidade e dois de segurança. Há cerca de 2 meses sem commits.

## 5. Pontos fortes

- Arquitetura em camadas clara e consistente (rota → middleware → controller → Prisma).
- Validação de entrada e rate limiting já presentes.
- Cliente web com camada de API e chaves de cache centralizadas.
- Mensagens de commit semânticas (conventional commits) e documentação de API extensa.

## 6. Riscos e pendências

1. **Sem testes automatizados** em nenhum dos três apps; só existe `npm run build` / `lint` como verificação.
2. **Paridade mobile × web:** o mobile está atrás (chat, follow, mapa, visibilidade de trabalhos, recuperação de senha).
3. **Arquivos em base64 no banco:** infla o Postgres e as respostas JSON; tende a ser um gargalo com mais usuários. Considerar storage de objetos (S3 ou similar).
4. **Rate limiting** usa o store padrão do `express-rate-limit` (em memória, por processo); não é compartilhado entre múltiplas instâncias. Não há limite identificado nas conexões/eventos do Socket.IO.
5. **Documentação desatualizada:** `backendserver/CLAUDE.md` não cobre Zod, rate limiting, follow/block e extensões de trabalhos; `frontendclient/CLAUDE.md` indica `VITE_API_URL` sem o prefixo `/v1/lumioo`; o relatório parcial do mobile é de março.
6. **Dev local:** `docker-compose.yml` tem credenciais fixas (aceitável para dev, não reutilizar em produção); `npm run dev` do backend roda `--transpile-only`, então erros de tipo só aparecem no `npm run build`.
7. **Recuperação de senha** ausente no mobile (e sem fluxo evidente de e-mail/OTP implementado).

## 7. Próximos passos sugeridos

1. Adicionar testes mínimos de integração na API (auth, posts, trabalhos com visibilidade privada, rate limits).
2. Levar ao mobile as funcionalidades de agosto e o fluxo de seguidores/chat, ou decidir o escopo do app.
3. Revisar o armazenamento de PDFs/imagens.
4. Atualizar os `CLAUDE.md` e relatórios desatualizados.
5. Configurar CI com `build` + `lint` dos três apps.
