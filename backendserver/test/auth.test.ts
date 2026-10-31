import { describe, expect, it } from 'vitest';
import { api, BASE, bearer, createUser, uniq } from './helpers';

describe('autenticação e conta', () => {
  it('cadastra, autentica e nunca devolve a senha', async () => {
    const user = await createUser();

    const login = await api()
      .post(`${BASE}/auth/signin`)
      .send({ identifier: user.email, password: user.password }) // também aceita e-mail
      .expect(200);

    expect(login.body.token).toEqual(expect.any(String));
    expect(login.body.user).not.toHaveProperty('password');
  });

  it('rejeita cadastro duplicado (409) e dados inválidos (400)', async () => {
    const user = await createUser();
    const base = {
      fullName: 'X', academicEmail: user.email, username: user.username, password: 'senha12345',
      institution: 'UPE', academicLevel: 'MASTER', dateOfBirth: '2000-01-01',
    };

    const dup = await api().post(`${BASE}/users`).send(base).expect(409);
    expect(dup.body.error).toBe('Email or username already exists.');

    await api().post(`${BASE}/users`).send({ ...base, username: 'a', academicEmail: 'x' }).expect(400);
  });

  it('não distingue usuário inexistente de senha errada', async () => {
    const user = await createUser();
    const wrongPassword = await api().post(`${BASE}/auth/signin`).send({ identifier: user.username, password: 'errada' }).expect(401);
    const unknownUser = await api().post(`${BASE}/auth/signin`).send({ identifier: `nao_${uniq()}`, password: 'x' }).expect(401);
    expect(wrongPassword.body.error).toBe('Invalid credentials.');
    expect(unknownUser.body.error).toBe('Invalid credentials.');
  });

  it('protege rotas: sem token 401, token inválido 403', async () => {
    await api().get(`${BASE}/feed`).expect(401);
    await api().get(`${BASE}/feed`).set(bearer('lixo')).expect(403);
  });

  it('endpoints públicos de usuário não expõem dados pessoais', async () => {
    const viewer = await createUser();
    const other = await createUser();

    const byId = await api().get(`${BASE}/users/${other.id}`).set(bearer(viewer.token)).expect(200);
    expect(byId.body).not.toHaveProperty('academicEmail');
    expect(byId.body).not.toHaveProperty('dateOfBirth');
    expect(byId.body).not.toHaveProperty('password');

    const publicProfile = await api().get(`${BASE}/profile/${other.username}`).set(bearer(viewer.token)).expect(200);
    expect(publicProfile.body).not.toHaveProperty('email');
    expect(publicProfile.body).not.toHaveProperty('birthDate');
  });

  it('só o dono pode excluir a própria conta', async () => {
    const a = await createUser();
    const b = await createUser();
    await api().delete(`${BASE}/users/${b.id}`).set(bearer(a.token)).expect(403);
    await api().delete(`${BASE}/users/${a.id}`).set(bearer(a.token)).expect(204);
  });

  describe('perfil', () => {
    it('edita o perfil e impede username já em uso', async () => {
      const a = await createUser();
      const b = await createUser();

      const updated = await api().put(`${BASE}/profile`).set(bearer(a.token)).send({ bio: 'Nova bio' }).expect(200);
      expect(updated.body.bio).toBe('Nova bio');

      const taken = await api().put(`${BASE}/profile`).set(bearer(a.token)).send({ username: b.username }).expect(409);
      expect(taken.body.error).toBe('Username already taken.');

      await api().put(`${BASE}/profile`).set(bearer(a.token)).send({ username: 'ab' }).expect(400);
    });

    it('remove avatar enviando null', async () => {
      const a = await createUser();
      await api().put(`${BASE}/profile`).set(bearer(a.token)).send({ avatar: 'data:image/png;base64,AAAA' }).expect(200);
      const cleared = await api().put(`${BASE}/profile`).set(bearer(a.token)).send({ avatar: null }).expect(200);
      expect(cleared.body.avatar).toBeNull();
    });
  });

  describe('troca de senha', () => {
    it('exige a senha atual correta e uma nova senha válida', async () => {
      const user = await createUser();
      const change = (body: object) => api().post(`${BASE}/profile/password`).set(bearer(user.token)).send(body);

      const missing = await change({}).expect(400);
      expect(missing.body.error).toBe('Senha atual e nova senha são obrigatórias.');
      await change({ currentPassword: 'errada', newPassword: 'novasenha123' }).expect(401);
      await change({ currentPassword: user.password, newPassword: 'curta' }).expect(400);

      await change({ currentPassword: user.password, newPassword: 'novasenha123' }).expect(200);
      await api().post(`${BASE}/auth/signin`).send({ identifier: user.username, password: 'novasenha123' }).expect(200);
      await api().post(`${BASE}/auth/signin`).send({ identifier: user.username, password: user.password }).expect(401);
    });
  });
});
