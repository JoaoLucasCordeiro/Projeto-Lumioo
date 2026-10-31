import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { Server } from 'socket.io';
import { io as connect, type Socket } from 'socket.io-client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { initializeSocket } from '../src/socket';
import { app, api, BASE, bearer, createUser, type TestUser } from './helpers';

const openConversation = async (from: TestUser, to: TestUser) =>
  (await api().post(`${BASE}/conversations`).set(bearer(from.token)).send({ recipientId: to.id })).body;

describe('chat (REST)', () => {
  it('cria a conversa uma vez e depois reaproveita', async () => {
    const a = await createUser();
    const b = await createUser();

    const first = await api().post(`${BASE}/conversations`).set(bearer(a.token)).send({ recipientId: b.id }).expect(201);
    const second = await api().post(`${BASE}/conversations`).set(bearer(a.token)).send({ recipientId: b.id }).expect(200);
    const fromTheOtherSide = await api().post(`${BASE}/conversations`).set(bearer(b.token)).send({ recipientId: a.id }).expect(200);

    expect(second.body.id).toBe(first.body.id);
    expect(fromTheOtherSide.body.id).toBe(first.body.id);
    // a API devolve só o OUTRO participante
    expect(first.body.participants.map((p: { id: string }) => p.id)).toEqual([b.id]);
  });

  it('valida o destinatário', async () => {
    const a = await createUser();
    const noId = await api().post(`${BASE}/conversations`).set(bearer(a.token)).send({}).expect(400);
    expect(noId.body.error).toBe('Recipient ID is required.');
    await api().post(`${BASE}/conversations`).set(bearer(a.token)).send({ recipientId: a.id }).expect(400);
    await api().post(`${BASE}/conversations`).set(bearer(a.token)).send({ recipientId: 'naoexiste' }).expect(404);
  });

  it('só participantes leem a conversa e as mensagens', async () => {
    const a = await createUser();
    const b = await createUser();
    const outsider = await createUser();
    const conv = await openConversation(a, b);

    await api().get(`${BASE}/conversations/${conv.id}`).set(bearer(a.token)).expect(200);
    await api().get(`${BASE}/conversations/${conv.id}`).set(bearer(outsider.token)).expect(403);
    await api().get(`${BASE}/conversations/${conv.id}/messages`).set(bearer(outsider.token)).expect(403);
    await api().get(`${BASE}/conversations/naoexiste`).set(bearer(a.token)).expect(404);

    const list = await api().get(`${BASE}/conversations`).set(bearer(outsider.token)).expect(200);
    expect(list.body).toEqual([]);
  });
});

describe('chat (tempo real)', () => {
  let server: http.Server;
  let url: string;
  const sockets: Socket[] = [];

  beforeAll(async () => {
    server = http.createServer(app);
    initializeSocket(new Server(server));
    await new Promise<void>((resolve) => server.listen(0, resolve));
    url = `http://localhost:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    sockets.forEach((s) => s.disconnect());
    await new Promise((resolve) => server.close(resolve));
  });

  const connectAs = async (user: TestUser) => {
    const socket = connect(url, { auth: { token: user.token }, transports: ['websocket'] });
    sockets.push(socket);
    await new Promise<void>((resolve, reject) => {
      socket.on('connect', resolve);
      socket.on('connect_error', reject);
    });
    return socket;
  };

  const next = <T>(socket: Socket, event: string) =>
    new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`timeout esperando "${event}"`)), 4000);
      socket.once(event, (data: T) => { clearTimeout(timer); resolve(data); });
    });

  const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  it('entrega a mensagem aos participantes da sala e a grava no histórico', async () => {
    const a = await createUser();
    const b = await createUser();
    const conv = await openConversation(a, b);
    const [sa, sb] = await Promise.all([connectAs(a), connectAs(b)]);

    sa.emit('joinConversation', conv.id);
    sb.emit('joinConversation', conv.id);
    await pause(300);

    const received = next<{ text: string; senderId: string; conversationId: string }>(sb, 'receiveMessage');
    sa.emit('sendMessage', { conversationId: conv.id, text: '  Olá em tempo real  ' });

    const msg = await received;
    expect(msg).toMatchObject({ text: 'Olá em tempo real', senderId: a.id, conversationId: conv.id });

    const history = await api().get(`${BASE}/conversations/${conv.id}/messages`).set(bearer(b.token)).expect(200);
    expect(history.body.map((m: { text: string }) => m.text)).toEqual(['Olá em tempo real']);
  });

  it('a conversa com atividade mais recente sobe para o topo da lista', async () => {
    const a = await createUser();
    const b = await createUser();
    const c = await createUser();
    const withB = await openConversation(a, b);
    const withC = await openConversation(a, c);
    const sa = await connectAs(a);

    sa.emit('joinConversation', withB.id);
    await pause(300);
    const echoed = next(sa, 'receiveMessage');
    sa.emit('sendMessage', { conversationId: withB.id, text: 'oi' });
    await echoed;

    const list = await api().get(`${BASE}/conversations`).set(bearer(a.token)).expect(200);
    expect(list.body.map((x: { id: string }) => x.id)).toEqual([withB.id, withC.id]);
  });

  it('barra quem não participa e mensagens inválidas', async () => {
    const a = await createUser();
    const b = await createUser();
    const outsider = await createUser();
    const conv = await openConversation(a, b);
    const so = await connectAs(outsider);

    const deniedJoin = next<{ message: string }>(so, 'error');
    so.emit('joinConversation', conv.id);
    expect((await deniedJoin).message).toBe('Access denied to this conversation.');

    const deniedSend = next<{ message: string }>(so, 'error');
    so.emit('sendMessage', { conversationId: conv.id, text: 'invasão' });
    expect((await deniedSend).message).toBe('Access denied.');

    const sa = await connectAs(a);
    const empty = next<{ message: string }>(sa, 'error');
    sa.emit('sendMessage', { conversationId: conv.id, text: '   ' });
    expect((await empty).message).toBe('Message text is required.');

    const history = await api().get(`${BASE}/conversations/${conv.id}/messages`).set(bearer(a.token)).expect(200);
    expect(history.body).toEqual([]);
  });

  it('desconecta token inválido', async () => {
    const socket = connect(url, { auth: { token: 'lixo' }, transports: ['websocket'] });
    sockets.push(socket);
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('não desconectou')), 4000);
      socket.on('disconnect', () => { clearTimeout(timer); resolve(); });
    });
  });
});
