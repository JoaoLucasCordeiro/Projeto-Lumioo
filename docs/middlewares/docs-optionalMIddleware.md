# Middleware de Autenticação JWT Opcional (`optionalAuth.middleware.ts`)

Este middleware tenta validar um token JWT enviado no cabeçalho `Authorization` (esquema `Bearer`) em uma aplicação Express. Quando o token é válido, anexa as informações do usuário ao objeto da requisição (`req.user`). Quando o token não é fornecido ou é inválido/expirado, o middleware simplesmente prossegue sem interromper o fluxo, deixando `req.user` indefinido. Ele nunca retorna 401/403 por conta própria.

## Sumário
- O que ele faz
- Assinatura e tipos
- Fluxo de execução
- Dependências e configuração
- Como usar
- Exemplos de requisição
- Códigos de resposta e mensagens
- Exemplo de geração de token
- Sugestão de testes

---

## O que ele faz

- Lê o cabeçalho `Authorization: Bearer <token>` se presente.
- Verifica o token com a chave secreta `process.env.JWT_SECRET`.
- Em caso de sucesso, injeta `req.user = { userId: string }`.
- Em caso de ausência de token ou falha na verificação:
  - Não lança erro, não responde 401/403.
  - Apenas segue para o próximo middleware/handler com `req.user` indefinido.

---

## Assinatura e tipos

```ts
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

export const optionalAuthenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => { ... }
```

- `AuthenticatedRequest.user`: Populado apenas quando o token é validado com sucesso. Contém `userId` (string) extraído do payload do JWT.
- O token é decodificado com `jwt.verify` e deve conter ao menos `{ userId: string }` no payload.

---

## Fluxo de execução

1. Lê o cabeçalho HTTP `Authorization`.
2. Extrai o token após o espaço (padrão `Bearer <token>`).
3. Se não houver token:
   - Não altera a resposta nem o status; prossegue com `next()` e `req.user` permanece indefinido.
4. Se houver token:
   - Tenta verificar com `jwt.verify(token, process.env.JWT_SECRET)`.
   - Em caso de sucesso:
     - Define `req.user = decoded` e chama `next()`.
   - Em caso de erro (inválido/expirado/segredo ausente):
     - Ignora o erro e chama `next()` sem definir `req.user`.

Observação: Este middleware é “não-bloqueante”. Controle de acesso (autorização) deve ser feito pelos handlers ou por um middleware de autenticação “obrigatória” separado.

---

## Dependências e configuração

- Pacote: `jsonwebtoken`
- Variável de ambiente: `JWT_SECRET`
  - Defina em `.env` ou no ambiente de execução:
    - `JWT_SECRET="sua_chave_super_secreta"`
  - Se ausente, a verificação falhará silenciosamente e `req.user` permanecerá indefinido.

---

## Como usar

### 1) Registrar o middleware em rotas onde o login é opcional

```ts
import express from 'express';
import { optionalAuthenticateToken } from './middlewares/optionalAuth.middleware';

const app = express();

// Conteúdo adaptável: muda a resposta se o usuário estiver autenticado
app.get('/feed', optionalAuthenticateToken, (req, res) => {
  if (req.user) {
    return res.json({ personalized: true, userId: req.user.userId });
  }
  return res.json({ personalized: false });
});

app.listen(3000, () => console.log('Servidor iniciado na porta 3000'));
```

### 2) Combinando com um middleware de autenticação obrigatória (exemplo)

Caso você tenha um middleware separado que bloqueia acesso sem token (não fornecido neste arquivo), utilize-o em rotas protegidas e mantenha o `optionalAuthenticateToken` para rotas “híbridas”.

```ts
// app.get('/profile', authenticateTokenObrigatorio, (req, res) => { ... });
```

---

## Exemplos de requisição

- Requisição com token válido (resposta do handler pode ser personalizada):
```bash
curl -H "Authorization: Bearer <SEU_TOKEN_JWT>" http://localhost:3000/feed
```

- Sem token (o middleware não bloqueia; o handler decide a resposta):
```bash
curl http://localhost:3000/feed
# -> 200 { "personalized": false }  (exemplo; depende do handler)
```

- Token inválido/expirado (o middleware ignora e segue; sem 401/403 automático):
```bash
curl -H "Authorization: Bearer token_invalido" http://localhost:3000/feed
# -> 200 { "personalized": false }  (exemplo; depende do handler)
```

---

## Códigos de resposta e mensagens

- Este middleware NÃO envia respostas por conta própria.
- Não retorna 401/403 automaticamente.
- Os códigos de resposta e mensagens dependem do handler da rota.
  - Ex.: Handlers podem verificar `req.user` e retornar 401 se a presença do usuário for obrigatória para a ação.

---

## Exemplo de geração de token

```ts
import jwt from 'jsonwebtoken';

function gerarToken(userId: string) {
  const secret = process.env.JWT_SECRET as string;
  // Ajuste expiresIn conforme a necessidade
  return jwt.sign({ userId }, secret, { expiresIn: '1h' });
}
```

---

## Sugestão de testes

- Deve chamar `next()` sempre, independentemente da presença/validade do token.
- Deve deixar `req.user` indefinido quando:
  - `Authorization` não é enviado.
  - `Authorization` não contém token (ex.: string vazia após `Bearer`).
  - O token é inválido ou expirado.
  - `JWT_SECRET` está ausente.
- Deve popular `req.user` quando o token é válido.
- Deve tolerar espaços extras no cabeçalho e diferentes capitalizações no esquema (se você decidir implementar normalização).
- Não deve lançar exceções não tratadas quando `jwt.verify` falhar.

---