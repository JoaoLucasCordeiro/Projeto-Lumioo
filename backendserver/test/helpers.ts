import request from 'supertest';
import { createApp } from '../src/app';

export const BASE = '/api/v1/lumioo';
export const app = createApp();
export const api = () => request(app);

let counter = 0;
/** Sufixo único (inclusive entre processos paralelos): cada teste cria os próprios dados e não depende de limpeza. */
export const uniq = () =>
  `${Date.now().toString(36)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

export interface TestUser {
  id: string;
  token: string;
  username: string;
  email: string;
  password: string;
}

/** Cadastra e autentica um usuário novo. */
export async function createUser(overrides: Record<string, unknown> = {}): Promise<TestUser> {
  const id = uniq();
  const body = {
    fullName: `Teste ${id}`,
    academicEmail: `u${id}@test.dev`,
    username: `u_${id}`,
    password: 'senha12345',
    institution: 'UPE',
    academicLevel: 'MASTER',
    dateOfBirth: '2000-01-01',
    ...overrides,
  };

  const registered = await api().post(`${BASE}/users`).send(body).expect(201);
  const login = await api()
    .post(`${BASE}/auth/signin`)
    .send({ identifier: body.username, password: body.password })
    .expect(200);

  return {
    id: registered.body.id,
    token: login.body.token,
    username: body.username as string,
    email: body.academicEmail as string,
    password: body.password as string,
  };
}

export const workPayload = (overrides: Record<string, unknown> = {}) => ({
  title: `Trabalho ${uniq()}`,
  workType: 'ARTICLE',
  summary: 'Resumo',
  description: 'Descrição',
  keywords: ['a', 'b', 'c'],
  references: ['ref 1'],
  advisor: 'Orientador',
  institution: 'UPE',
  city: 'Recife',
  state: 'PE',
  area: 'ENGINEERING',
  pdfFile: 'data:application/pdf;base64,JVBERi0=',
  ...overrides,
});
