import api from '@/lib/api';
import { fetchProfileByUsername } from '@/lib/social';

// Espelha frontendclient/src/api/conversations.ts

export interface Participant {
  id: string;
  username: string;
  avatar: string | null;
  fullName: string;
}

export interface Conversation {
  id: string;
  participants: Participant[]; // só os outros participantes (a API remove o usuário logado)
  messages: { id: string; text: string; createdAt: string; senderId: string }[]; // última mensagem
  updatedAt: string;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
  conversationId?: string;
  sender: { id?: string; username: string; avatar: string | null };
}

export const fetchConversations = async () => (await api.get<Conversation[]>('/conversations')).data;

export const fetchConversationById = async (id: string) =>
  (await api.get<Conversation>(`/conversations/${id}`)).data;

export const fetchMessages = async (conversationId: string) =>
  (await api.get<Message[]>(`/conversations/${conversationId}/messages`)).data;

export const createConversation = async (recipientId: string) =>
  (await api.post<Conversation>('/conversations', { recipientId })).data;

/** Abre (ou cria) a conversa com um usuário a partir do @username. */
export async function startConversationWithUsername(username: string) {
  const profile = await fetchProfileByUsername(username);
  if (!profile.id) throw new Error('Usuário sem id');
  return createConversation(profile.id);
}

export function formatChatTime(iso: string): string {
  const date = new Date(iso);
  const diffH = (Date.now() - date.getTime()) / 3_600_000;
  if (diffH < 24) return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (diffH < 168) return date.toLocaleDateString('pt-BR', { weekday: 'short' });
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}
