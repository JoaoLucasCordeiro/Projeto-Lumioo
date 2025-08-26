# Documentação do Auth Controller

Arquivo fonte: `backendserver/src/controllers/auth.controller.ts`  
Responsável por autenticação de usuários (login) e emissão de token JWT.

## Visão geral

O controller expõe a função `signIn`, que:
- Valida credenciais enviadas pelo cliente (identificador e senha).
- Permite autenticar por e-mail acadêmico (`academicEmail`) ou `username`.
- Compara a senha informada com o hash armazenado (bcrypt).
- Emite um token JWT com expiração de 1 dia.
- Retorna os dados do usuário (sem o campo `password`) e o token.

Observação: a rota HTTP associada a este controller pode variar conforme o arquivo de rotas da aplicação. Uma convenção comum é `POST /auth/sign-in`.

## Dependências

- `express` (tipos `Request`, `Response`)
- `@prisma/client` (acesso ao banco via Prisma)
- `bcryptjs` (verificação de hash de senha)
- `jsonwebtoken` (geração de token JWT)

## Variáveis de ambiente

- `JWT_SECRET` (obrigatória): segredo utilizado para assinar o JWT.

Sem essa variável configurada, a geração do token falhará.

## Entrada (Request)

- Método: `POST`
- Cabeçalhos recomendados: `Content-Type: application/json`
- Corpo (JSON):
  - `identifier` (string, obrigatório): pode ser o `academicEmail` OU o `username`.
  - `password` (string, obrigatório): senha em texto puro para validação.

Exemplo:
```json
{
  "identifier": "joao.silva", 
  "password": "minhaSenhaSegura!"
}
```

ou

```json
{
  "identifier": "joao.silva@universidade.edu.br",
  "password": "minhaSenhaSegura!"
}
```

## Comportamento e Lógica

1. Validação inicial: se `identifier` ou `password` estiverem ausentes, retorna `400`.
2. Busca do usuário via Prisma:
   - `findFirst` com condição `OR` entre `academicEmail == identifier` e `username == identifier`.
3. Caso o usuário não exista, retorna `401` (credenciais inválidas).
4. Validação de senha:
   - `bcrypt.compare(password, user.password)`.
   - Se inválida, retorna `401` (credenciais inválidas).
5. Geração do token JWT:
   - Payload: `{ userId: user.id, username: user.username }`.
   - Segredo: `process.env.JWT_SECRET`.
   - Expiração: `1d`.
6. Retorno de sucesso:
   - Status `200`.
   - JSON com `{ user: <dadosSemPassword>, token }`.
   - O campo `password` é removido do objeto `user` antes de enviar a resposta.

## Saída (Response)

- Sucesso (200):
  ```json
  {
    "user": {
      "id": 123,
      "username": "joao.silva",
      "academicEmail": "joao.silva@universidade.edu.br",
      "...": "demais campos do usuário, exceto password"
    },
    "token": "jwt.assinado.aqui"
  }
  ```

- Erros:
  - 400 Bad Request:
    ```json
    { "error": "Email/username and password are required." }
    ```
  - 401 Unauthorized (credenciais inválidas):
    ```json
    { "error": "Invalid credentials." }
    ```
  - 500 Internal Server Error:
    ```json
    { "error": "An internal error occurred." }
    ```

## Exemplo de uso (cURL)

```bash
curl -X POST http://localhost:3000/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
        "identifier": "joao.silva",
        "password": "minhaSenhaSegura!"
      }'
```

Resposta esperada (200):
```json
{
  "user": {
    "id": 123,
    "username": "joao.silva",
    "academicEmail": "joao.silva@universidade.edu.br"
  },
  "token": "jwt.assinado.aqui"
}
```

## Estrutura do JWT

- Payload:
  - `userId`: ID do usuário autenticado.
  - `username`: nome de usuário.
- Expiração: 1 dia.
- Assinatura: HMAC com segredo definido em `JWT_SECRET` (algoritmo padrão do `jsonwebtoken`, tipicamente HS256).

## Integração com o Prisma

A função consulta o modelo `user` com:
- `academicEmail`
- `username`
- `password`
- `id`

Certifique-se de que o schema Prisma contenha esses campos e que `password` armazene um hash gerado com `bcrypt`.

## Tratamento de erros e logs

- Em caso de exceções, o controller loga no servidor: `console.error('Error during sign in:', error)` e responde `500`.
- Em produção, prefira um logger estruturado (e.g., pino, winston) com níveis de log.

## Resumo

O `signIn` implementa um fluxo de login sólido: aceita identificador flexível (email acadêmico ou username), valida senha com bcrypt, emite JWT com expiração e retorna os dados do usuário sem a senha. Para produção, recomenda-se fortalecer aspectos de segurança, observabilidade e testes.
