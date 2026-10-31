import { defineConfig } from 'vitest/config';

// Mesmo padrão de test/config.ts (mantenha os dois iguais). Pode ser trocado com TEST_DATABASE_URL.
const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? 'postgresql://lumioo:lumioo123@localhost:5435/lumioo_test';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    globalSetup: ['./test/global-setup.ts'],
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: TEST_DATABASE_URL,
      JWT_SECRET: 'test-secret',
      FRONTEND_URL: 'http://localhost:5173',
    },
    testTimeout: 20_000,
    hookTimeout: 60_000,
  },
});
