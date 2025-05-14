# Autenticação no VigiaHub

O sistema de autenticação do VigiaHub é baseado em tokens JWT (JSON Web Token), garantindo segurança, escalabilidade e facilidade de integração entre front-end e back-end.

---

## 🔐 Fluxo de Autenticação

1. **Cadastro (`/register`)**
   - O usuário envia nome, email, senha, e demais dados.
   - A senha é **hashada com bcrypt** antes de ser salva no banco de dados.
   - Após cadastro, o usuário pode fazer login.

2. **Login (`/login`)**
   - O usuário envia email e senha.
   - O servidor verifica as credenciais e, se corretas, gera um token JWT assinado.
   - O token é retornado para o cliente e deve ser armazenado no `localStorage` ou `cookies`.

3. **Token JWT**
   - O token contém o `id` do usuário e expira após um tempo configurado (ex: 1h).
   - Exemplo de payload:
     ```json
     {
       "id": "abc123",
       "exp": 1701234567
     }
     ```

4. **Autorização**
   - Rotas protegidas usam um middleware que verifica a presença e validade do token.
   - Se o token for inválido ou ausente, o acesso é negado.

---

## 🔧 Detalhes Técnicos

### 🔑 Geração do Token

```ts
import jwt from 'jsonwebtoken'

const token = jwt.sign(
  { id: user.id },
  process.env.JWT_SECRET!,
  { expiresIn: '1h' }
)
```

### 🧂 Hash da Senha

```ts
import bcrypt from 'bcrypt'

const hashedPassword = await bcrypt.hash(password, 10)
```

### 🔍 Verificação de Senha

```ts
const isMatch = await bcrypt.compare(password, user.password)
```

### 🛡️ Middleware de Autenticação

```ts
import jwt from 'jsonwebtoken'

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.sendStatus(401)

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}
```

---

## 🧪 Exemplo de uso no back-end

```ts
app.get('/me', authenticateToken, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } })
  res.json(user)
})
```

---

## 🧰 Bibliotecas utilizadas

- `jsonwebtoken`: para geração e verificação de tokens.
- `bcrypt`: para hash seguro de senhas.
- `dotenv`: para gerenciar variáveis de ambiente (`JWT_SECRET`, etc).

---

## 📌 Observações

- Sempre armazene senhas apenas **hashadas**.
- Nunca inclua informações sensíveis no payload do JWT.
- Considere usar **refresh tokens** para sessões mais longas.
- Mantenha a `JWT_SECRET` segura no `.env` e nunca exponha no front-end.