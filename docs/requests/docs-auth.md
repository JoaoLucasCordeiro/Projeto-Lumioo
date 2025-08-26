# Autenticação — Sign in

Autentica um usuário a partir de:
- identifier: pode ser o email acadêmico (`academicEmail`) OU o `username`
- password: senha em texto claro (será comparada com hash via bcrypt)

A rota abaixo é uma sugestão comum. Ajuste o caminho conforme o seu arquivo de rotas.

- Método: POST
- Rota sugerida: /auth/signin
- Content-Type: application/json

## Corpo da requisição (request body)

```json
{
  "identifier": "usuario@exemplo.edu.br",
  "password": "minha-senha-secreta"
}
```

Observações:
- identifier aceita tanto o email acadêmico quanto o username.
- Ambos os campos são obrigatórios.

## Respostas

- 200 OK
  - Retorna o usuário (sem o campo password) e um token JWT com expiração de 1 dia.
  - Exemplo:
    ```json
    {
      "user": {
        "id": "clxy...123",
        "username": "joao",
        "academicEmail": "joao@universidade.edu.br"
        // ...demais campos do seu modelo User, exceto "password"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR..."
    }
    ```

- 400 Bad Request
  - Quando `identifier` ou `password` não são enviados.
  - Payload:
    ```json
    { "error": "Email/username and password are required." }
    ```

- 401 Unauthorized
  - Quando o usuário não existe ou a senha está incorreta.
  - Payload:
    ```json
    { "error": "Invalid credentials." }
    ```

- 500 Internal Server Error
  - Em caso de erro interno inesperado.
  - Payload:
    ```json
    { "error": "An internal error occurred." }
    ```

## Exemplo de requisição (cURL)

```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "usuario@exemplo.edu.br",
    "password": "minha-senha-secreta"
  }'
```

## Exemplo com fetch (JavaScript)

```js
const res = await fetch("http://localhost:3000/auth/signin", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    identifier: "usuario@exemplo.edu.br", // ou "meu-username"
    password: "minha-senha-secreta"
  })
});

if (!res.ok) {
  const err = await res.json();
  console.error(err);
} else {
  const data = await res.json();
  console.log(data.user, data.token);
}
```

## Registro da rota (Express) — exemplo

No seu arquivo de rotas, importe o controller e registre a rota POST:

```ts
import { Router } from "express";
import { signIn } from "./controllers/auth.controller";

const router = Router();

router.post("/auth/signin", signIn);

export default router;
```

## Detalhes do token JWT

- Payload: `{ userId: user.id, username: user.username }`
- Expiração: 1 dia (`expiresIn: '1d'`)
- É necessário definir a variável de ambiente `JWT_SECRET`.
