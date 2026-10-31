// Banco dedicado aos testes (no mesmo Postgres do docker-compose, base `lumioo_test`).
// Pode ser trocado com TEST_DATABASE_URL.
export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? 'postgresql://lumioo:lumioo123@localhost:5435/lumioo_test';

/** Mesma conexão, mas na base administrativa `postgres` (para criar a base de testes). */
export const ADMIN_DATABASE_URL = TEST_DATABASE_URL.replace(/\/[^/?]+(\?|$)/, '/postgres$1');

export const TEST_DATABASE_NAME = /\/([^/?]+)(\?|$)/.exec(TEST_DATABASE_URL)![1];
