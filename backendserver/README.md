# VigiaHub - Backend

Este é o backend da plataforma **VigiaHub**, uma rede social acadêmica desenvolvida com Node.js, Express e PostgreSQL.

## 🚀 Tecnologias

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Dotenv

## ⚙️ Como rodar o backend

1. Clone o repositório e acesse a pasta `backendserver`:

```bash
cd backendserver
```

2. Instale as dependências:

```bash
npm install
```

3. Configure o arquivo `.env` com suas variáveis de ambiente:

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/vigiahub
PORT=3333
```

4. Rode as migrations e gere o client do Prisma:

```bash
npx prisma migrate dev
```

5. Inicie o servidor:

```bash
npm run dev
```

> O servidor rodará por padrão na porta `3333`.
