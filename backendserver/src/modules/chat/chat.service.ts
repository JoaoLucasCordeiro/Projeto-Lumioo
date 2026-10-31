import { badRequest, forbidden, notFound } from '../../shared/errors';
import { prisma } from '../../shared/prisma';

const PARTICIPANT_SELECT = { id: true, username: true, avatar: true, fullName: true } as const;
const SENDER_SELECT = { id: true, username: true, avatar: true } as const;

/** Conversas devolvem só os OUTROS participantes (o cliente já sabe quem é o usuário logado). */
const othersOf = (userId: string) => ({
  participants: { where: { NOT: { id: userId } }, select: PARTICIPANT_SELECT },
});

export async function findOrCreateConversation(userId: string, recipientId: string) {
  if (userId === recipientId) throw badRequest('Cannot start a conversation with yourself.');

  if (!(await prisma.user.findUnique({ where: { id: recipientId }, select: { id: true } }))) {
    throw notFound('User not found.');
  }

  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [{ participants: { some: { id: userId } } }, { participants: { some: { id: recipientId } } }],
    },
    include: othersOf(userId),
  });
  if (existing) return { conversation: existing, created: false };

  const conversation = await prisma.conversation.create({
    data: { participants: { connect: [{ id: userId }, { id: recipientId }] } },
    include: othersOf(userId),
  });
  return { conversation, created: true };
}

export const listConversations = (userId: string) =>
  prisma.conversation.findMany({
    where: { participants: { some: { id: userId } } },
    orderBy: { updatedAt: 'desc' },
    include: { ...othersOf(userId), messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });

export async function getConversation(userId: string, conversationId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { participants: { select: PARTICIPANT_SELECT } },
  });
  if (!conversation) throw notFound('Conversation not found.');
  if (!conversation.participants.some((p) => p.id === userId)) throw forbidden('Access denied.');

  return { ...conversation, participants: conversation.participants.filter((p) => p.id !== userId) };
}

export async function listMessages(userId: string, conversationId: string) {
  if (!(await isParticipant(userId, conversationId))) throw forbidden('Access denied.');

  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    include: { sender: { select: SENDER_SELECT } },
  });
}

export async function isParticipant(userId: string, conversationId: string): Promise<boolean> {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, participants: { some: { id: userId } } },
    select: { id: true },
  });
  return !!conversation;
}

/** Grava a mensagem e atualiza `updatedAt` da conversa (a lista é ordenada por atividade recente). */
export async function createMessage(senderId: string, conversationId: string, text: string) {
  const message = await prisma.message.create({
    data: { text, senderId, conversationId },
    include: { sender: { select: SENDER_SELECT } },
  });
  await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: message.createdAt } });
  return message;
}
