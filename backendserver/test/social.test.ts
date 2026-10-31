import { describe, expect, it } from 'vitest';
import { api, BASE, bearer, createUser } from './helpers';

describe('seguir e bloquear', () => {
  it('seguir e deixar de seguir, com contagem e listas', async () => {
    const a = await createUser();
    const b = await createUser();

    await api().post(`${BASE}/follow/${b.id}`).set(bearer(a.token)).expect(201);
    const dup = await api().post(`${BASE}/follow/${b.id}`).set(bearer(a.token)).expect(409);
    expect(dup.body.error).toBe('You are already following this user.');

    const profile = await api().get(`${BASE}/profile/${b.username}`).set(bearer(a.token)).expect(200);
    expect(profile.body).toMatchObject({ followers: 1, isFollowing: true });

    const followers = await api().get(`${BASE}/users/${b.id}/followers`).expect(200);
    expect(followers.body.users.map((u: { id: string }) => u.id)).toEqual([a.id]);
    const following = await api().get(`${BASE}/users/${a.id}/following`).expect(200);
    expect(following.body.users.map((u: { id: string }) => u.id)).toEqual([b.id]);

    await api().delete(`${BASE}/follow/${b.id}`).set(bearer(a.token)).expect(200);
    await api().delete(`${BASE}/follow/${b.id}`).set(bearer(a.token)).expect(404);
  });

  it('não permite seguir a si mesmo nem um usuário inexistente', async () => {
    const a = await createUser();
    await api().post(`${BASE}/follow/${a.id}`).set(bearer(a.token)).expect(400);
    await api().post(`${BASE}/follow/naoexiste`).set(bearer(a.token)).expect(404);
  });

  it('bloquear remove os follows nos dois sentidos e esconde os perfis', async () => {
    const a = await createUser();
    const b = await createUser();
    await api().post(`${BASE}/follow/${b.id}`).set(bearer(a.token)).expect(201);
    await api().post(`${BASE}/follow/${a.id}`).set(bearer(b.token)).expect(201);

    await api().post(`${BASE}/block/${b.id}`).set(bearer(a.token)).expect(201);
    const again = await api().post(`${BASE}/block/${b.id}`).set(bearer(a.token)).expect(409);
    expect(again.body.error).toBe('You have already blocked this user.');

    // sem follows e perfis invisíveis para os dois lados (404 não revela o bloqueio)
    const followers = await api().get(`${BASE}/users/${b.id}/followers`).expect(200);
    expect(followers.body.users).toEqual([]);
    await api().get(`${BASE}/profile/${b.username}`).set(bearer(a.token)).expect(404);
    await api().get(`${BASE}/profile/${a.username}`).set(bearer(b.token)).expect(404);

    // e ninguém consegue seguir de novo, em nenhum dos sentidos
    await api().post(`${BASE}/follow/${a.id}`).set(bearer(b.token)).expect(403);
    await api().post(`${BASE}/follow/${b.id}`).set(bearer(a.token)).expect(403);

    // lista de bloqueados e desbloqueio
    const blocked = await api().get(`${BASE}/blocked`).set(bearer(a.token)).expect(200);
    expect(blocked.body.users.map((u: { id: string }) => u.id)).toEqual([b.id]);

    await api().delete(`${BASE}/block/${b.id}`).set(bearer(a.token)).expect(200);
    await api().delete(`${BASE}/block/${b.id}`).set(bearer(a.token)).expect(404);
    await api().get(`${BASE}/profile/${b.username}`).set(bearer(a.token)).expect(200);
  });

  it('não permite bloquear a si mesmo', async () => {
    const a = await createUser();
    await api().post(`${BASE}/block/${a.id}`).set(bearer(a.token)).expect(400);
  });
});

describe('projetos', () => {
  const project = (overrides: Record<string, unknown> = {}) => ({
    title: 'Projeto de teste',
    description: 'Descrição',
    category: 'Computação',
    status: 'IN_PROGRESS',
    city: 'Recife',
    state: 'PE',
    teamMembers: [{ name: 'Fulano', role: 'Líder' }],
    ...overrides,
  });

  it('cria com equipe, e só o dono edita ou exclui', async () => {
    const owner = await createUser();
    const other = await createUser();

    const created = await api().post(`${BASE}/projects`).set(bearer(owner.token)).send(project()).expect(201);
    expect(created.body.teamMembers).toHaveLength(1);
    const id = created.body.id;

    const detail = await api().get(`${BASE}/projects/${id}`).expect(200);
    expect(detail.body).toMatchObject({ ownerId: owner.id, members: 1, authorUsername: owner.username });

    await api().put(`${BASE}/projects/${id}`).set(bearer(other.token)).send({ title: 'x' }).expect(403);
    await api().delete(`${BASE}/projects/${id}`).set(bearer(other.token)).expect(403);

    const edited = await api().put(`${BASE}/projects/${id}`).set(bearer(owner.token)).send({ title: 'Novo', status: 'COMPLETED' }).expect(200);
    expect(edited.body).toMatchObject({ title: 'Novo', status: 'COMPLETED' });

    await api().delete(`${BASE}/projects/${id}`).set(bearer(owner.token)).expect(204);
    await api().get(`${BASE}/projects/${id}`).expect(404);
  });

  it('valida: equipe obrigatória, contato em projeto aberto e estado no Brasil', async () => {
    const owner = await createUser();
    const post = (body: object) => api().post(`${BASE}/projects`).set(bearer(owner.token)).send(body);

    await post(project({ teamMembers: [] })).expect(400);
    const noContact = await post(project({ status: 'OPEN_FOR_APPLICATIONS' })).expect(400);
    expect(noContact.body.error).toBe('Contact email and phone are required when status is OPEN_FOR_APPLICATIONS.');
    await post(project({ state: undefined })).expect(400);
    await post(project({ status: 'OPEN_FOR_APPLICATIONS', contactEmail: 'a@b.com', contactPhone: '8199999999' })).expect(201);
  });
});
