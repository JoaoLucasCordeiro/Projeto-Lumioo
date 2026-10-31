import { execSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';
import { ADMIN_DATABASE_URL, TEST_DATABASE_NAME, TEST_DATABASE_URL } from './config';

/** Roda uma vez antes de todos os testes: garante a base e recria as tabelas a partir do schema. */
export default async function setup() {
  const admin = new PrismaClient({ datasources: { db: { url: ADMIN_DATABASE_URL } } });
  try {
    const exists = await admin.$queryRawUnsafe<unknown[]>(
      `SELECT 1 FROM pg_database WHERE datname = '${TEST_DATABASE_NAME}'`,
    );
    if (exists.length === 0) await admin.$executeRawUnsafe(`CREATE DATABASE "${TEST_DATABASE_NAME}"`);
  } catch (err) {
    throw new Error(
      `Não foi possível preparar a base de testes (${TEST_DATABASE_NAME}). O Postgres do docker-compose está de pé?\n${err}`,
    );
  } finally {
    await admin.$disconnect();
  }

  // `db push` usa só o schema.prisma (prisma/migrations/ não é versionado) e --force-reset
  // deixa a base vazia a cada execução. Só roda contra a base de testes.
  execSync('npx prisma db push --skip-generate --force-reset --accept-data-loss', {
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: 'pipe',
  });
}
