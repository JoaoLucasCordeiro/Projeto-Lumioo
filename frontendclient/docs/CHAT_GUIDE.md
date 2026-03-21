# Lumioo Chat — Guia de Implementação (Front-End)

> Este documento descreve a arquitetura do chat em tempo real da Lumioo e como implementá-lo no front-end (React Native / Expo).

---

## Visão Geral da Arquitetura

O sistema de chat combina **REST** e **Socket.IO**:

```
[Front-End]
    │
    ├── REST (HTTP)           → Gerenciar conversas e buscar histórico
    │   ├── POST /conversations        → Criar/encontrar conversa
    │   ├── GET  /conversations        → Listar conversas do usuário
    │   ├── GET  /conversations/:id    → Dados de uma conversa
    │   └── GET  /conversations/:id/messages → Histórico de mensagens
    │
    └── Socket.IO (WebSocket) → Enviar e receber mensagens em tempo real
        ├── emit: joinConversation    → Entrar na sala da conversa
        ├── emit: sendMessage         → Enviar uma mensagem
        └── on:   receiveMessage      → Receber mensagem em tempo real
```

**Por que essa divisão?**
- O histórico de mensagens é buscado via REST (confiável, paginável, sem estado)
- Novas mensagens são trocadas via Socket.IO (baixa latência, em tempo real)

---

## 1. Instalação

```bash
npm install socket.io-client
```

Para Expo:

```bash
npx expo install socket.io-client
```

---

## 2. Configuração do Socket

Crie um arquivo centralizado para gerenciar a conexão:

```typescript
// services/socket.ts
import { io, Socket } from 'socket.io-client';

const SERVER_URL = 'http://localhost:8080'; // Ou IP da máquina em dispositivo físico

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(SERVER_URL, {
    auth: { token }, // Token JWT enviado na conexão
    transports: ['websocket'], // Prefira websocket direto no mobile
  });

  socket.on('connect', () => {
    console.log('Socket conectado:', socket?.id);
  });

  socket.on('connect_error', (err) => {
    console.error('Erro de conexão Socket.IO:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket desconectado:', reason);
  });

  socket.on('error', (data: { message: string }) => {
    console.error('Erro do servidor Socket.IO:', data.message);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}
```

---

## 3. Fluxo Completo do Chat

### Passo 1 — Conectar ao Socket.IO após login

Conecte o socket **logo após o login bem-sucedido**, passando o token JWT:

```typescript
// Após receber o token do POST /auth/signin
import { connectSocket } from '@/services/socket';

const handleLogin = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });

  const data = await response.json();
  const { token, user } = data;

  // Salvar token
  await AsyncStorage.setItem('token', token);

  // Conectar socket com o token
  connectSocket(token);
};
```

> **Importante:** Se o token for inválido ou ausente, o servidor desconectará o socket automaticamente.

---

### Passo 2 — Abrir uma conversa

Ao navegar para a tela de chat com um usuário:

1. Chame `POST /conversations` para obter/criar a conversa
2. Busque o histórico via `GET /conversations/:id/messages`
3. Entre na sala via Socket.IO com `joinConversation`

```typescript
// screens/ChatScreen.tsx
import { getSocket } from '@/services/socket';

const API_BASE_URL = 'http://localhost:8080/api/v1/lumioo';

const openChat = async (recipientId: string) => {
  const token = await AsyncStorage.getItem('token');

  // 1. Criar ou encontrar a conversa
  const convResponse = await fetch(`${API_BASE_URL}/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ recipientId }),
  });
  const conversation = await convResponse.json();
  const conversationId = conversation.id;

  // 2. Buscar histórico de mensagens
  const msgResponse = await fetch(
    `${API_BASE_URL}/conversations/${conversationId}/messages`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  const history = await msgResponse.json();
  setMessages(history);

  // 3. Entrar na sala Socket.IO
  const socket = getSocket();
  if (socket) {
    socket.emit('joinConversation', conversationId);
  }

  setCurrentConversationId(conversationId);
};
```

---

### Passo 3 — Escutar mensagens em tempo real

Configure o listener `receiveMessage` ao montar a tela de chat:

```typescript
import { useEffect, useState } from 'react';
import { getSocket } from '@/services/socket';

interface Message {
  id: string;
  text: string;
  createdAt: string;
  senderId: string;
  conversationId: string;
  sender: {
    id: string;
    username: string;
    avatar: string | null;
  };
}

const useChatMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      // Só adiciona se for da conversa atual
      if (message.conversationId === conversationId) {
        setMessages(prev => [...prev, message]);
      }
    };

    socket.on('receiveMessage', handleNewMessage);

    // Cleanup ao desmontar o componente
    return () => {
      socket.off('receiveMessage', handleNewMessage);
    };
  }, [conversationId]);

  return { messages, setMessages };
};
```

---

### Passo 4 — Enviar mensagens

```typescript
import { getSocket } from '@/services/socket';

const sendMessage = (conversationId: string, text: string) => {
  const socket = getSocket();
  if (!socket || !socket.connected) {
    console.error('Socket não conectado!');
    return;
  }

  if (!text.trim()) return;

  socket.emit('sendMessage', {
    conversationId,
    text: text.trim(),
  });
};
```

> **Importante:** Não precisa adicionar a mensagem enviada manualmente ao estado. O servidor emite `receiveMessage` para **todos na sala**, incluindo quem enviou. O listener já capturará sua própria mensagem.

---

### Passo 5 — Desconectar ao fazer logout

```typescript
import { disconnectSocket } from '@/services/socket';

const handleLogout = async () => {
  disconnectSocket();
  await AsyncStorage.removeItem('token');
  // Navegar para login...
};
```

---

## 4. Eventos Socket.IO — Referência

### Eventos emitidos pelo cliente (`socket.emit`)

#### `joinConversation`
Entra na sala de uma conversa para receber mensagens em tempo real.

```typescript
socket.emit('joinConversation', conversationId: string);
```

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `conversationId` | string | ID da conversa (obtido via REST) |

> O servidor valida se o usuário é participante da conversa. Se não for, emite um evento `error`.

---

#### `sendMessage`
Envia uma nova mensagem na conversa.

```typescript
socket.emit('sendMessage', {
  conversationId: string,
  text: string,
});
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `conversationId` | string | ID da conversa |
| `text` | string | Conteúdo da mensagem |

---

### Eventos recebidos pelo cliente (`socket.on`)

#### `receiveMessage`
Recebido quando uma nova mensagem é enviada em qualquer sala que o usuário está.

```typescript
socket.on('receiveMessage', (message: {
  id: string;
  text: string;
  createdAt: string;
  senderId: string;
  conversationId: string;
  sender: {
    id: string;
    username: string;
    avatar: string | null;
  };
}) => {
  // Processar nova mensagem
});
```

---

#### `error`
Recebido quando ocorre um erro de autorização ou processamento no servidor.

```typescript
socket.on('error', (data: { message: string }) => {
  console.error('Erro:', data.message);
});
```

Possíveis mensagens de erro:
- `"Access denied to this conversation."` — usuário tentou entrar em conversa que não participa
- `"Access denied."` — usuário tentou enviar mensagem em conversa que não participa

---

## 5. Componente Completo de Tela de Chat

Exemplo de implementação completa:

```typescript
// screens/ChatScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSocket } from '@/services/socket';

const API_BASE_URL = 'http://localhost:8080/api/v1/lumioo';

interface Message {
  id: string;
  text: string;
  createdAt: string;
  senderId: string;
  conversationId: string;
  sender: { id: string; username: string; avatar: string | null };
}

interface ChatScreenProps {
  conversationId: string;
  currentUserId: string;
}

export default function ChatScreen({ conversationId, currentUserId }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Carregar histórico
  useEffect(() => {
    const loadHistory = async () => {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(
        `${API_BASE_URL}/conversations/${conversationId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setMessages(data);
    };

    loadHistory();
  }, [conversationId]);

  // Entrar na sala e escutar mensagens
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit('joinConversation', conversationId);

    const handleNewMessage = (message: Message) => {
      if (message.conversationId === conversationId) {
        setMessages(prev => [...prev, message]);
        // Rolar para o final
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    };

    socket.on('receiveMessage', handleNewMessage);

    return () => {
      socket.off('receiveMessage', handleNewMessage);
    };
  }, [conversationId]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const socket = getSocket();
    if (!socket?.connected) return;

    socket.emit('sendMessage', {
      conversationId,
      text: inputText.trim(),
    });

    setInputText('');
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwn = item.senderId === currentUserId;
    return (
      <View style={{ alignItems: isOwn ? 'flex-end' : 'flex-start', marginVertical: 4 }}>
        <View style={{
          backgroundColor: isOwn ? '#7C3AED' : '#E5E7EB',
          borderRadius: 12,
          padding: 10,
          maxWidth: '75%',
        }}>
          <Text style={{ color: isOwn ? '#fff' : '#111' }}>{item.text}</Text>
          <Text style={{ fontSize: 10, color: isOwn ? '#DDD' : '#888', marginTop: 2 }}>
            {new Date(item.createdAt).toLocaleTimeString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      <View style={{ flexDirection: 'row', padding: 8, borderTopWidth: 1, borderColor: '#E5E7EB' }}>
        <TextInput
          style={{ flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 }}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Digite uma mensagem..."
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          onPress={handleSend}
          style={{ marginLeft: 8, backgroundColor: '#7C3AED', borderRadius: 20, paddingHorizontal: 16, justifyContent: 'center' }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
```

---

## 6. Lista de Conversas

Para exibir a lista de conversas com preview da última mensagem:

```typescript
// screens/ConversationsScreen.tsx
const loadConversations = async () => {
  const token = await AsyncStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/conversations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const conversations = await res.json();
  setConversations(conversations);
};

// Estrutura de cada conversa:
// {
//   id: string,
//   updatedAt: string,
//   participants: [{ id, username, avatar, fullName }], // apenas o outro participante
//   messages: [{ id, text, createdAt, senderId }]      // última mensagem
// }
```

---

## 7. Iniciar uma Nova Conversa

A partir de um perfil de usuário ou lista de usuários:

```typescript
const startConversation = async (recipientId: string, navigation: any) => {
  const token = await AsyncStorage.getItem('token');

  const res = await fetch(`${API_BASE_URL}/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ recipientId }),
  });

  const conversation = await res.json();

  // Navegar para a tela de chat
  navigation.navigate('Chat', {
    conversationId: conversation.id,
    recipientName: conversation.participants[0]?.fullName,
  });
};
```

---

## 8. Boas Práticas e Dicas

### Gerenciamento de conexão

- **Conecte o socket uma única vez** após o login e mantenha a conexão ativa durante toda a sessão
- **Desconecte no logout** para liberar recursos
- Use uma instância singleton (como no `services/socket.ts` do exemplo)

### Reconexão automática

O socket.io-client tenta reconectar automaticamente. Para lidar com reconexões:

```typescript
socket.on('reconnect', () => {
  console.log('Socket reconectado');
  // Se necessário, re-enter nas salas ativas
  if (currentConversationId) {
    socket.emit('joinConversation', currentConversationId);
  }
});
```

### Indicador de status de conexão

```typescript
const [isConnected, setIsConnected] = useState(false);

socket.on('connect', () => setIsConnected(true));
socket.on('disconnect', () => setIsConnected(false));
```

### Deduplicação de mensagens

O evento `receiveMessage` é emitido para todos na sala, incluindo o remetente. Para evitar duplicatas no estado local se você tiver uma lógica de "mensagem otimista", sempre verifique se a mensagem já existe:

```typescript
const handleNewMessage = (message: Message) => {
  setMessages(prev => {
    if (prev.some(m => m.id === message.id)) return prev; // já existe
    return [...prev, message];
  });
};
```

### Endereço do servidor em dispositivo físico

Em desenvolvimento com Expo em dispositivo físico, substitua `localhost` pelo IP da sua máquina na rede local:

```typescript
const SERVER_URL = 'http://192.168.1.100:8080'; // IP da máquina de desenvolvimento
```

---

## 9. Diagrama de Sequência

```
[Front-End]                          [Back-End]
     │                                    │
     │── POST /auth/signin ──────────────▶│
     │◀── { user, token } ───────────────│
     │                                    │
     │── socket.io connect(token) ───────▶│
     │◀── connect event ─────────────────│
     │                                    │
     │── POST /conversations ────────────▶│
     │   { recipientId }                  │
     │◀── { id, participants... } ────────│
     │                                    │
     │── GET /conversations/:id/messages ▶│
     │◀── [ ...messages ] ───────────────│
     │                                    │
     │── emit: joinConversation ─────────▶│
     │   conversationId                   │ (valida participação)
     │                                    │
     │── emit: sendMessage ──────────────▶│
     │   { conversationId, text }         │ (persiste no DB)
     │                                    │
     │◀── on: receiveMessage ─────────────│
     │   { id, text, sender... }          │ (broadcast para a sala)
     │                                    │
     [Outro usuário na mesma sala]         │
     │◀── on: receiveMessage ─────────────│
```

---

## 10. Resumo dos Dados

### Estrutura de uma Mensagem (Socket `receiveMessage`)

```typescript
interface SocketMessage {
  id: string;            // cuid
  text: string;
  createdAt: string;     // ISO 8601
  senderId: string;      // ID do remetente
  conversationId: string;
  sender: {
    id: string;
    username: string;
    avatar: string | null; // base64 ou null
  };
}
```

### Estrutura de uma Conversa (REST `GET /conversations`)

```typescript
interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  participants: {        // Apenas o OUTRO participante
    id: string;
    username: string;
    avatar: string | null;
    fullName: string;
  }[];
  messages: {           // Última mensagem (preview)
    id: string;
    text: string;
    createdAt: string;
    senderId: string;
  }[];
}
```
