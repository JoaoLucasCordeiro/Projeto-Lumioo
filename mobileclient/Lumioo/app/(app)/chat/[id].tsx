import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, Pressable, TextInput, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/Avatar';
import { ConfirmModal } from '@/components/modals';
import { useChatSocket } from '@/lib/socket';
import { fetchConversationById, fetchMessages, formatChatTime, type Message, type Participant } from '@/lib/chat';

const MAX_LENGTH = 2000;

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { socket, connected } = useChatSocket();

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [messages, setMessages] = useState<Message[]>([]); // ordem cronológica
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const hasConnectedOnce = useRef(false);

  const loadMessages = useCallback(async () => {
    try {
      const history = await fetchMessages(id);
      setMessages(history);
    } catch {
      setError('Não foi possível carregar as mensagens.');
    }
  }, [id]);

  // Conversa + histórico
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [conv] = await Promise.all([fetchConversationById(id), loadMessages()]);
        if (alive) setParticipant(conv.participants[0] ?? null);
      } catch {
        if (alive) setError('Não foi possível abrir esta conversa.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id, loadMessages]);

  // Tempo real: entra na sala, recebe mensagens e, ao reconectar, volta à sala e busca o que perdeu
  useEffect(() => {
    if (!socket) return;
    const join = () => socket.emit('joinConversation', id);
    const onConnect = () => {
      join();
      if (hasConnectedOnce.current) loadMessages(); // preenche a lacuna do período offline
      hasConnectedOnce.current = true;
    };
    const onMessage = (msg: Message & { conversationId: string }) => {
      if (msg.conversationId !== id) return;
      setMessages(prev => (prev.some(m => m.id === msg.id) ? prev : [...prev, msg]));
    };
    const onServerError = (e: { message?: string }) => {
      if (e?.message) setError('Não foi possível enviar a mensagem.');
    };
    if (socket.connected) { join(); hasConnectedOnce.current = true; }
    socket.on('connect', onConnect);
    socket.on('receiveMessage', onMessage);
    socket.on('error', onServerError);
    return () => {
      socket.off('connect', onConnect);
      socket.off('receiveMessage', onMessage);
      socket.off('error', onServerError);
    };
  }, [socket, id, loadMessages]);

  const canSend = text.trim().length > 0 && connected;

  const handleSend = () => {
    const value = text.trim();
    if (!value || !socket || !connected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    socket.emit('sendMessage', { conversationId: id, text: value });
    setText('');
  };

  const openProfile = () => {
    if (participant) router.push({ pathname: '/user/[username]', params: { username: participant.username } } as any);
  };

  // FlatList invertida: o mais recente fica embaixo e a lista abre nele
  const data = [...messages].reverse();

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: colors.background }]}
      behavior="padding"
    >
      {/* Cabeçalho */}
      <View style={[s.header, { paddingTop: insets.top + 8, borderBottomColor: colors.borderDark }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Pressable onPress={openProfile} style={s.headerUser} disabled={!participant}>
          <Avatar userImage={participant?.avatar ?? null} username={participant?.username ?? 'user'} size={38} />
          <View style={{ flex: 1 }}>
            <Text style={[s.name, { color: colors.textPrimary }]} numberOfLines={1}>{participant?.fullName ?? 'Conversa'}</Text>
            {!!participant && <Text style={[s.username, { color: colors.textMuted }]} numberOfLines={1}>@{participant.username}</Text>}
          </View>
        </Pressable>
      </View>

      {!connected && !loading && (
        <View style={[s.banner, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
          <ActivityIndicator size="small" color="#f59e0b" />
          <Text style={s.bannerText}>Reconectando…</Text>
        </View>
      )}

      {/* Mensagens */}
      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={data}
          inverted
          keyExtractor={m => m.id}
          contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 12, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            // lista invertida: o conteúdo vazio também vem espelhado
            <View style={[s.center, { transform: [{ scaleY: -1 }] }]}>
              <Text style={{ color: colors.textMuted, fontSize: 14 }}>Nenhuma mensagem ainda.</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4, opacity: 0.7 }}>Envie a primeira mensagem!</Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const mine = item.senderId === user?.id;
            // `data` está invertida: o item seguinte na tela (abaixo) é index - 1
            const next = data[index - 1];
            const lastOfGroup = !next || next.senderId !== item.senderId;
            return (
              <View style={[s.msgRow, mine ? s.rowMine : s.rowTheirs, { marginBottom: lastOfGroup ? 10 : 3 }]}>
                {!mine && (
                  <View style={s.msgAvatar}>
                    {lastOfGroup && <Avatar userImage={item.sender.avatar} username={item.sender.username} size={28} />}
                  </View>
                )}
                <View style={[s.bubbleCol, mine ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
                  <View
                    style={[
                      s.bubble,
                      mine
                        ? { backgroundColor: colors.primary, borderBottomRightRadius: lastOfGroup ? 4 : 18 }
                        : { backgroundColor: colors.container, borderColor: colors.border, borderWidth: 1, borderBottomLeftRadius: lastOfGroup ? 4 : 18 },
                    ]}
                  >
                    <Text style={[s.bubbleText, { color: mine ? '#fff' : colors.textSecondary }]}>{item.text}</Text>
                  </View>
                  {lastOfGroup && <Text style={[s.time, { color: colors.textMuted }]}>{formatChatTime(item.createdAt)}</Text>}
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Campo de envio */}
      <View style={[s.composer, { borderTopColor: colors.borderDark, backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom, 10) }]}>
        <TextInput
          style={[s.input, { color: colors.textPrimary, backgroundColor: colors.container, borderColor: colors.border }]}
          value={text}
          onChangeText={setText}
          placeholder="Digite uma mensagem…"
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={MAX_LENGTH}
          editable={!loading}
        />
        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          style={[s.sendBtn, { backgroundColor: colors.primary, opacity: canSend ? 1 : 0.4 }]}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </Pressable>
      </View>

      <ConfirmModal
        visible={!!error}
        title="Erro"
        message={error}
        confirmLabel="OK"
        onConfirm={() => setError('')}
        onClose={() => setError('')}
      />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingBottom: 10, borderBottomWidth: 1 },
  iconBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  headerUser: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { fontSize: 15, fontWeight: '700' },
  username: { fontSize: 12, marginTop: 1 },
  banner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 6 },
  bannerText: { color: '#f59e0b', fontSize: 12, fontWeight: '600' },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },
  msgAvatar: { width: 28 },
  bubbleCol: { maxWidth: '75%' },
  bubble: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18 },
  bubbleText: { fontSize: 15, lineHeight: 21 },
  time: { fontSize: 10, marginTop: 3, marginHorizontal: 4 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 12, paddingTop: 10, borderTopWidth: 1 },
  input: { flex: 1, maxHeight: 120, minHeight: 42, borderWidth: 1, borderRadius: 21, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, fontSize: 15 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
