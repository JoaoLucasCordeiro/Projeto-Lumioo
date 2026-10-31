import { describe, expect, it } from 'vitest';
import { api, BASE, bearer, createUser, workPayload } from './helpers';

const createWork = async (token: string, overrides: Record<string, unknown> = {}) =>
  (await api().post(`${BASE}/works`).set(bearer(token)).send(workPayload(overrides)).expect(201)).body;

describe('trabalhos', () => {
  describe('validação', () => {
    it('exige de 3 a 5 palavras-chave', async () => {
      const user = await createUser();
      const res = await api().post(`${BASE}/works`).set(bearer(user.token)).send(workPayload({ keywords: ['a'] })).expect(400);
      expect(res.body.error).toBe('You must provide between 3 and 5 keywords.');
    });

    it('exige estado para trabalhos no Brasil', async () => {
      const user = await createUser();
      const res = await api().post(`${BASE}/works`).set(bearer(user.token)).send(workPayload({ state: undefined })).expect(400);
      expect(res.body.error).toBe('State is required for works in Brazil.');

      await api().post(`${BASE}/works`).set(bearer(user.token)).send(workPayload({ state: undefined, country: 'Portugal' })).expect(201);
    });

    it('exige autenticação para criar', async () => {
      await api().post(`${BASE}/works`).send(workPayload()).expect(401);
    });
  });

  describe('visibilidade e acesso', () => {
    it('trabalho privado: 403 com o status do pedido para quem não é o autor', async () => {
      const author = await createUser();
      const stranger = await createUser();
      const work = await createWork(author.token, { visibility: 'PRIVATE' });

      const denied = await api().get(`${BASE}/works/${work.id}`).set(bearer(stranger.token)).expect(403);
      expect(denied.body).toMatchObject({ error: 'This work is private.', visibility: 'PRIVATE', accessRequestStatus: null });

      await api().get(`${BASE}/works/${work.id}`).expect(403); // anônimo
      await api().get(`${BASE}/works/${work.id}`).set(bearer(author.token)).expect(200);
    });

    it('listagem esconde trabalhos privados de outros usuários', async () => {
      const author = await createUser();
      const stranger = await createUser();
      const priv = await createWork(author.token, { visibility: 'PRIVATE', title: 'Segredo' });
      const pub = await createWork(author.token, { title: 'Aberto' });

      const ids = async (token?: string) => {
        const req = api().get(`${BASE}/works?search=${encodeURIComponent('a')}`);
        const res = await (token ? req.set(bearer(token)) : req).expect(200);
        return res.body.works.map((w: { id: string }) => w.id);
      };

      expect(await ids(stranger.token)).toContain(pub.id);
      expect(await ids(stranger.token)).not.toContain(priv.id);
      expect(await ids()).not.toContain(priv.id);
      expect(await ids(author.token)).toContain(priv.id);
    });

    it('fluxo completo: pedir, aprovar, acessar, baixar e revogar', async () => {
      const author = await createUser();
      const reader = await createUser();
      const work = await createWork(author.token, { visibility: 'PRIVATE' });
      const wid = work.id;

      const request = await api().post(`${BASE}/works/${wid}/access-requests`).set(bearer(reader.token)).expect(201);
      expect(request.body.status).toBe('PENDING');
      await api().post(`${BASE}/works/${wid}/access-requests`).set(bearer(reader.token)).expect(409);

      // enquanto pendente continua sem acesso, e o status aparece no 403
      const pending = await api().get(`${BASE}/works/${wid}`).set(bearer(reader.token)).expect(403);
      expect(pending.body.accessRequestStatus).toBe('PENDING');
      await api().get(`${BASE}/works/${wid}/download`).set(bearer(reader.token)).expect(403);

      // só o autor responde
      const respond = (token: string, status: string) =>
        api().patch(`${BASE}/works/${wid}/access-requests/${request.body.id}`).set(bearer(token)).send({ status });
      await respond(reader.token, 'APPROVED').expect(403);
      await respond(author.token, 'X').expect(400);
      await respond(author.token, 'REVOKED').expect(400); // só aprovados podem ser revogados
      await respond(author.token, 'APPROVED').expect(200);
      await respond(author.token, 'APPROVED').expect(400); // já respondido

      // com acesso: lê e baixa (contando o download)
      const read = await api().get(`${BASE}/works/${wid}`).set(bearer(reader.token)).expect(200);
      expect(read.body.downloads).toBe(0);
      await api().get(`${BASE}/works/${wid}/download`).set(bearer(reader.token)).expect(200);
      const afterDownload = await api().get(`${BASE}/works/${wid}`).set(bearer(reader.token)).expect(200);
      expect(afterDownload.body.downloads).toBe(1);

      // o autor vê o pedido na sua lista; quem pediu vê em "meus pedidos"
      const list = await api().get(`${BASE}/works/${wid}/access-requests`).set(bearer(author.token)).expect(200);
      expect(list.body[0].requester.id).toBe(reader.id);
      await api().get(`${BASE}/works/${wid}/access-requests`).set(bearer(reader.token)).expect(403);
      const mine = await api().get(`${BASE}/works/access-requests/mine`).set(bearer(reader.token)).expect(200);
      expect(mine.body[0].work.id).toBe(wid);

      // revogar tira o acesso e permite pedir de novo
      await respond(author.token, 'REVOKED').expect(200);
      await api().get(`${BASE}/works/${wid}`).set(bearer(reader.token)).expect(403);
      const again = await api().post(`${BASE}/works/${wid}/access-requests`).set(bearer(reader.token)).expect(201);
      expect(again.body.status).toBe('PENDING');
    });

    it('não faz sentido pedir acesso a trabalho público ou ao próprio', async () => {
      const author = await createUser();
      const reader = await createUser();
      const pub = await createWork(author.token);
      const priv = await createWork(author.token, { visibility: 'PRIVATE' });

      await api().post(`${BASE}/works/${pub.id}/access-requests`).set(bearer(reader.token)).expect(400);
      await api().post(`${BASE}/works/${priv.id}/access-requests`).set(bearer(author.token)).expect(400);
      await api().post(`${BASE}/works/naoexiste/access-requests`).set(bearer(reader.token)).expect(404);
    });
  });

  describe('edição e exclusão', () => {
    it('só o autor altera ou exclui', async () => {
      const author = await createUser();
      const other = await createUser();
      const work = await createWork(author.token);

      await api().put(`${BASE}/works/${work.id}`).set(bearer(other.token)).send({ title: 'x' }).expect(403);
      await api().delete(`${BASE}/works/${work.id}`).set(bearer(other.token)).expect(403);

      const edited = await api().put(`${BASE}/works/${work.id}`).set(bearer(author.token)).send({ title: 'Novo título', visibility: 'PRIVATE' }).expect(200);
      expect(edited.body).toMatchObject({ title: 'Novo título', visibility: 'PRIVATE' });

      await api().delete(`${BASE}/works/${work.id}`).set(bearer(author.token)).expect(204);
      await api().get(`${BASE}/works/${work.id}`).set(bearer(author.token)).expect(404);
    });
  });

  describe('estatísticas e sugestões', () => {
    it('agrupa por dimensão e rejeita dimensão inválida', async () => {
      const user = await createUser();
      await createWork(user.token, { area: 'HUMANITIES' });

      const stats = await api().get(`${BASE}/works/stats?dimension=area`).expect(200);
      expect(stats.body.dimension).toBe('area');
      expect(stats.body.items.find((i: { value: string }) => i.value === 'HUMANITIES')).toBeTruthy();

      await api().get(`${BASE}/works/stats?dimension=zzz`).expect(400);
    });

    it('sugestões exigem ao menos 2 caracteres', async () => {
      const short = await api().get(`${BASE}/works/suggestions?field=city&q=R`).expect(200);
      expect(short.body.suggestions).toEqual([]);
    });
  });
});
