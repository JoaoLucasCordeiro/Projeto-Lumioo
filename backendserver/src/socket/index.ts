import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env';
import { createMessage, isParticipant } from '../modules/chat/chat.service';
import { sendMessageSchema } from '../modules/chat/chat.schemas';

/**
 * Chat em tempo real. Cada conversa é uma sala (`conversationId`).
 * Eventos recebidos: `joinConversation`, `sendMessage`. Eventos emitidos: `receiveMessage`, `error`.
 */
export function initializeSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    const token = socket.handshake.auth.token;
    let userId: string;

    try {
      if (!token) throw new Error('missing token');
      userId = (jwt.verify(token, env.JWT_SECRET) as { userId: string }).userId;
    } catch {
      socket.disconnect();
      return;
    }

    socket.on('joinConversation', async (conversationId: string) => {
      try {
        if (!(await isParticipant(userId, conversationId))) {
          socket.emit('error', { message: 'Access denied to this conversation.' });
          return;
        }
        socket.join(conversationId);
      } catch (error) {
        console.error('Erro ao entrar na conversa:', error);
      }
    });

    socket.on('sendMessage', async (payload: unknown) => {
      try {
        const parsed = sendMessageSchema.safeParse(payload);
        if (!parsed.success) {
          socket.emit('error', { message: parsed.error.issues[0].message });
          return;
        }
        const { conversationId, text } = parsed.data;

        if (!(await isParticipant(userId, conversationId))) {
          socket.emit('error', { message: 'Access denied.' });
          return;
        }

        const message = await createMessage(userId, conversationId, text);
        io.to(conversationId).emit('receiveMessage', message);
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        socket.emit('error', { message: 'Could not send message.' });
      }
    });
  });
}
