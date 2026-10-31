import { describe, expect, it } from 'vitest';
import { api, BASE, bearer, createUser } from './helpers';

const newPost = async (token: string, caption = 'Um post de teste') =>
  (await api().post(`${BASE}/posts`).set(bearer(token)).send({ caption, hashtags: ['teste'] }).expect(201)).body;

describe('posts', () => {
  it('só o autor edita e exclui', async () => {
    const author = await createUser();
    const other = await createUser();
    const post = await newPost(author.token);

    await api().put(`${BASE}/posts/${post.id}`).set(bearer(other.token)).send({ caption: 'x' }).expect(403);
    await api().delete(`${BASE}/posts/${post.id}`).set(bearer(other.token)).expect(403);

    const edited = await api().put(`${BASE}/posts/${post.id}`).set(bearer(author.token)).send({ caption: 'editado' }).expect(200);
    expect(edited.body.caption).toBe('editado');

    await api().delete(`${BASE}/posts/${post.id}`).set(bearer(author.token)).expect(204);
    await api().get(`${BASE}/posts/${post.id}`).expect(404);
  });

  it('valida a legenda', async () => {
    const user = await createUser();
    await api().post(`${BASE}/posts`).set(bearer(user.token)).send({ caption: '' }).expect(400);
    await api().put(`${BASE}/posts/qualquer`).set(bearer(user.token)).send({ caption: '' }).expect(400);
  });

  it('curtir e salvar alternam e refletem na visão do usuário', async () => {
    const author = await createUser();
    const fan = await createUser();
    const post = await newPost(author.token);

    await api().post(`${BASE}/posts/${post.id}/like`).set(bearer(fan.token)).expect(200);
    const saved = await api().post(`${BASE}/posts/${post.id}/save`).set(bearer(fan.token)).expect(201);
    expect(saved.body.message).toMatch(/saved/);

    const view = await api().get(`${BASE}/posts/${post.id}`).set(bearer(fan.token)).expect(200);
    expect(view.body).toMatchObject({ likes: 1, isLiked: true, isSaved: true });

    const unliked = await api().post(`${BASE}/posts/${post.id}/like`).set(bearer(fan.token)).expect(200);
    expect(unliked.body.message).toMatch(/unliked/);
    await api().post(`${BASE}/posts/${post.id}/save`).set(bearer(fan.token)).expect(200);

    const after = await api().get(`${BASE}/posts/${post.id}`).set(bearer(fan.token)).expect(200);
    expect(after.body).toMatchObject({ likes: 0, isLiked: false, isSaved: false });
  });

  it('responde 404 (e não 500) ao curtir, salvar ou comentar algo inexistente', async () => {
    const user = await createUser();
    await api().post(`${BASE}/posts/naoexiste/like`).set(bearer(user.token)).expect(404);
    await api().post(`${BASE}/posts/naoexiste/save`).set(bearer(user.token)).expect(404);
    await api().post(`${BASE}/posts/naoexiste/comments`).set(bearer(user.token)).send({ text: 'oi' }).expect(404);
    await api().post(`${BASE}/comments/naoexiste/like`).set(bearer(user.token)).expect(404);
  });

  it('feed pagina por cursor', async () => {
    const user = await createUser();
    for (let i = 0; i < 6; i++) await newPost(user.token, `post ${i}`);

    const first = await api().get(`${BASE}/feed`).set(bearer(user.token)).expect(200);
    expect(first.body.posts).toHaveLength(5);
    expect(first.body.nextCursor).toEqual(expect.any(String));

    const second = await api().get(`${BASE}/feed?cursor=${first.body.nextCursor}`).set(bearer(user.token)).expect(200);
    const firstIds = new Set(first.body.posts.map((p: { id: string }) => p.id));
    expect(second.body.posts.length).toBeGreaterThan(0);
    expect(second.body.posts.every((p: { id: string }) => !firstIds.has(p.id))).toBe(true);
  });

  describe('comentários', () => {
    it('criar, curtir, editar e excluir respeitam o autor', async () => {
      const author = await createUser();
      const commenter = await createUser();
      const post = await newPost(author.token);

      const created = await api()
        .post(`${BASE}/posts/${post.id}/comments`)
        .set(bearer(commenter.token))
        .send({ text: 'Bom post' })
        .expect(201);
      const commentId = created.body.id;

      await api().put(`${BASE}/comments/${commentId}`).set(bearer(author.token)).send({ text: 'x' }).expect(403);
      await api().delete(`${BASE}/comments/${commentId}`).set(bearer(author.token)).expect(403);
      await api().put(`${BASE}/comments/${commentId}`).set(bearer(commenter.token)).send({ text: '' }).expect(400);

      await api().post(`${BASE}/comments/${commentId}/like`).set(bearer(author.token)).expect(200);
      const detail = await api().get(`${BASE}/posts/${post.id}`).set(bearer(author.token)).expect(200);
      expect(detail.body.comments[0]).toMatchObject({ id: commentId, likes: 1, isLiked: true });

      await api().put(`${BASE}/comments/${commentId}`).set(bearer(commenter.token)).send({ text: 'Editado' }).expect(200);
      await api().delete(`${BASE}/comments/${commentId}`).set(bearer(commenter.token)).expect(204);
      await api().delete(`${BASE}/comments/${commentId}`).set(bearer(commenter.token)).expect(404);
    });
  });
});
