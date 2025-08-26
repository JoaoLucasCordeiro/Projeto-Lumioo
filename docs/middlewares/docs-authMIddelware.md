# Middleware de Autenticação JWT (`auth.middleware.ts`)

Este middleware valida um token JWT enviado no cabeçalho `Authorization` (esquema `Bearer`) em uma aplicação Express. Quando o token é válido, anexa as informações do usuário ao objeto da requisição (`req.user`) e permite a continuidade do fluxo. Caso contrário, interrompe a requisição com o código de status apropriado.

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

- Extrai o token JWT do cabeçalho `Authorization: Bearer <token>`.
- Verifica o token com a chave secreta `process.env.JWT_SECRET`.
- Em caso de sucesso, injeta `req.user = { userId: string }` e chama `next()`.
- Em caso de falha:
  - 401 caso o token não seja fornecido.
  - 403 caso o token seja inválido ou expirado.

---

## Assinatura e tipos

```ts
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => { ... }
```

- `AuthenticatedRequest.user`: Populado após validação bem-sucedida do token. Contém `userId` (string) extraído do payload do JWT.
- O token é decodificado com `jwt.verify` e deve conter ao menos `{ userId: string }` no payload.

---

## Fluxo de execução

1. Lê `Authorization` do cabeçalho HTTP.
2. Extrai o token depois do espaço (padrão `Bearer <token>`).
3. Se não houver token:
   - Responde `401` com `{ error: 'Access denied. No token provided.' }`.
4. Se houver token:
   - Tenta verificar com `jwt.verify(token, process.env.JWT_SECRET)`.
   - Em caso de sucesso:
     - Define `req.user = decoded` e chama `next()`.
   - Em caso de erro:
     - Responde `403` com `{ error: 'Invalid or expired token.' }`.

---

## Dependências e configuração

- Pacote: `jsonwebtoken`
- Variável de ambiente obrigatória: `JWT_SECRET`
  - Defina em `.env` ou no ambiente de execução:
    - `JWT_SECRET="sua_chave_super_secreta"`

---

## Como usar

### 1) Registrar o middleware em rotas protegidas

```ts
import express from 'express';
import { authenticateToken } from './middlewares/auth.middleware';

const app = express();

// Rota pública
app.get('/public', (req, res) => {
  res.json({ message: 'Rota pública acessível sem token.' });
});

// Rota protegida
app.get('/profile', authenticateToken, (req, res) => {
  // req.user estará disponível aqui
  res.json({ message: 'Rota protegida.', user: req.user });
});

app.listen(3000, () => console.log('Servidor iniciado na porta 3000'));
```

### 2) Acessando `req.user` no handler

```ts
app.get('/me', authenticateToken, (req, res) => {
  const userId = req.user?.userId;
  res.json({ userId });
});
```

---

## Exemplos de requisição

- Requisição com token válido:
```bash
curl -H "Authorization: Bearer <SEU_TOKEN_JWT>" http://localhost:3000/profile
```

- Sem token:
```bash
curl http://localhost:3000/profile
# -> 401 { "error": "Access denied. No token provided." }
```

- Token inválido/expirado:
```bash
curl -H "Authorization: Bearer token_invalido" http://localhost:3000/profile
# -> 403 { "error": "Invalid or expired token." }
```

---

## Códigos de resposta e mensagens

- 401 Unauthorized:
  - Quando o cabeçalho `Authorization` ou o token não é fornecido.
  - Corpo: `{ "error": "Access denied. No token provided." }`
- 403 Forbidden:
  - Quando o token é inválido, malformado ou expirado.
  - Corpo: `{ "error": "Invalid or expired token." }`

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

- Deve retornar 401 quando `Authorization` não é enviado.
- Deve retornar 401 quando `Authorization` não contém token (ex.: string vazia após `Bearer`).
- Deve retornar 403 quando o token é inválido.
- Deve retornar 403 quando o token está expirado.
- Deve chamar `next()` e disponibilizar `req.user` quando o token é válido.
- Deve manter o comportamento quando o cabeçalho tem espaços extras ou maiúsculas/minúsculas diferentes no esquema (opcionalmente, normalize o esquema).

---