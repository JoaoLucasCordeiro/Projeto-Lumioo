import { apiFetch } from './client';

export interface Participant {
  id: string;
  username: string;
  avatar: string | null;
  fullName: string;
}

export interface Conversation {
  id: string;
  participants: Participant[];
  messages: Array<{
    id: string;
    text: string;
    createdAt: string;
    senderId: string;
  }>;
  updatedAt: string;
  _count: { messages: number };
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
  sender: { username: string; avatar: string | null };
}

export function fetchConversations(): Promise<Conversation[]> {
  return apiFetch<Conversation[]>('/conversations');
}

export function fetchConversationById(id: string): Promise<Conversation> {
  return apiFetch<Conversation>(`/conversations/${id}`);
}

export function fetchMessages(conversationId: string): Promise<Message[]> {
  return apiFetch<Message[]>(`/conversations/${conversationId}/messages`);
}

export function createConversation(recipientId: string): Promise<Conversation> {
  return apiFetch<Conversation>('/conversations', {
    method: 'POST',
    body: JSON.stringify({ recipientId }),
  });
}
