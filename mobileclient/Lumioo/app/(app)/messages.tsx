import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, Pressable, TextInput, FlatList, Modal, ActivityIndicator, RefreshControl,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/Avatar';
import { useChatSocket } from '@/lib/socket';
import {
  createConversation, fetchConversations, formatChatTime, type Conversation, type Message,
} from '@/lib/chat';
import { fetchProfileByUsername } from '@/lib/social';

function preview(conv: Conversation, myId?: string): string {
  const last = conv.messages[0];
  if (!last) return 'Inicie uma conversa';
  const text = last.text.length > 60 ? `${last.text.slice(0, 60)}…` : last.text;
  return last.senderId === myId ? `Você: ${text}` : text;
}

// ─── Nova conversa ───────────────────────────────────────────────────────────

function NewConversationModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [found, setFound] = useState<{ id: string; fullName: string; username: string; avatar: string | null } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const search = async () => {
    const name = username.trim().replace(/^@/, '');
    if (!name) return;
    if (name === user?.username) { setError('Você não pode conversar consigo mesmo.'); return; }
    setLoading(true);
    setError('');
    try {
      const p = await fetchProfileByUsername(name);
      if (!p.id) throw new Error('sem id');
      setFound({ id: p.id, fullName: p.fullName, username: p.username, avatar: p.avatar });
    } catch {
      setError('Usuário não encontrado. Verifique o nome de usuário.');
    } finally {
      setLoading(false);
    }
  };

  const start = async () => {
    if (!found) return;
    setLoading(true);
    try {
      const conv = await createConversation(found.id);
      onCreated(conv.id);
    } catch {
      setError('Não foi possível iniciar a conversa. Tente novamente.');
      setFound(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={s.backdrop} onPress={onClose}>
          <Pressable
            style={[s.sheet, { backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom, 16) + 16 }]}
            onPress={() => {}}
          >
            <View style={[s.handle, { backgroundColor: colors.containerLight }]} />
            <View style={s.sheetHeader}>
              <Text style={[s.sheetTitle, { color: colors.textPrimary }]}>Nova conversa</Text>
              <Pressable onPress={onClose} hitSlop={10}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </Pressable>
            </View>

            {!found ? (
              <>
                <Text style={[s.fieldLabel, { color: colors.textMuted }]}>NOME DE USUÁRIO</Text>
                <View style={[s.searchWrap, { backgroundColor: colors.container, borderColor: colors.border }]}>
                  <Text style={{ color: colors.textMuted, fontSize: 15 }}>@</Text>
                  <TextInput
                    style={[s.searchInput, { color: colors.textPrimary }]}
                    value={username}
                    onChangeText={t => { setUsername(t); setError(''); }}
                    placeholder="nome_de_usuario"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                    returnKeyType="search"
                    onSubmitEditing={search}
                  />
                </View>
                {!!error && <Text style={[s.error, { color: colors.error }]}>{error}</Text>}
                <Pressable
                  onPress={search}
                  disabled={loading || !username.trim()}
                  style={[s.primaryBtn, { backgroundColor: colors.primary, opacity: loading || !username.trim() ? 0.45 : 1 }]}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnText}>Buscar usuário</Text>}
                </Pressable>
              </>
            ) : (
              <>
                <View style={[s.foundCard, { backgroundColor: colors.container, borderColor: colors.border }]}>
                  <Avatar userImage={found.avatar} username={found.username} size={48} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.rowName, { color: colors.textPrimary }]} numberOfLines={1}>{found.fullName}</Text>
                    <Text style={[s.rowPreview, { color: colors.textMuted }]}>@{found.username}</Text>
                  </View>
                </View>
                <View style={s.btnRow}>
                  <Pressable onPress={() => setFound(null)} style={[s.outlineBtn, { borderColor: colors.border }]}>
                    <Text style={[s.outlineBtnText, { color: colors.textSecondary }]}>Voltar</Text>
                  </Pressable>
                  <Pressable onPress={start} disabled={loading} style={[s.primaryBtn, { flex: 1, backgroundColor: colors.primary }]}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnText}>Iniciar conversa</Text>}
                  </Pressable>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Lista de conversas ──────────────────────────────────────────────────────

export default function MessagesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { socket } = useChatSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const idsRef = useRef<string[]>([]);

  const load = useCallback(async () => {
    try {
      const data = await fetchConversations();
      setConversations(data);
      idsRef.current = data.map(c => c.id);
      setError(false);
      // Entra nas salas para receber as mensagens novas em tempo real
      idsRef.current.forEach(id => socket?.emit('joinConversation', id));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [socket]);

  useEffect(() => { load(); }, [load]);

  // Recarrega ao voltar de uma conversa; a montagem já carrega sozinha
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) { firstFocus.current = false; return; }
      load();
    }, [load]),
  );

  // Tempo real: atualiza prévia/ordem e entra de novo nas salas depois de reconectar
  useEffect(() => {
    if (!socket) return;
    const onMessage = (msg: Message & { conversationId: string }) => {
      // Conversa nova (ainda fora da lista): recarrega. Senão atualiza prévia e ordem.
      if (!idsRef.current.includes(msg.conversationId)) { load(); return; }
      setConversations(prev => {
        const idx = prev.findIndex(c => c.id === msg.conversationId);
        if (idx === -1) return prev;
        const updated: Conversation = {
          ...prev[idx],
          messages: [{ id: msg.id, text: msg.text, createdAt: msg.createdAt, senderId: msg.senderId }],
          updatedAt: msg.createdAt,
        };
        return [updated, ...prev.filter((_, i) => i !== idx)];
      });
    };
    const rejoin = () => idsRef.current.forEach(id => socket.emit('joinConversation', id));
    socket.on('receiveMessage', onMessage);
    socket.on('connect', rejoin);
    return () => { socket.off('receiveMessage', onMessage); socket.off('connect', rejoin); };
  }, [socket, load]);

  const term = search.trim().toLowerCase();
  const filtered = conversations.filter(c => {
    const p = c.participants[0];
    if (!p || !term) return true;
    return p.fullName.toLowerCase().includes(term) || p.username.toLowerCase().includes(term);
  });

  const openChat = (id: string) => router.push({ pathname: '/chat/[id]', params: { id } } as any);
  const navBarHeight = Math.max(insets.bottom, 8) + 16 + 72;

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <View style={[s.header, { paddingTop: insets.top + 10, borderBottomColor: colors.borderDark }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[s.title, { color: colors.textPrimary }]}>Mensagens</Text>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setNewOpen(true); }}
          hitSlop={8}
          style={[s.newBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </Pressable>
      </View>

      <View style={s.searchRow}>
        <View style={[s.searchBar, { backgroundColor: colors.container, borderColor: colors.border }]}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={[s.searchBarInput, { color: colors.textPrimary }]}
            value={search}
            onChangeText={setSearch}
            placeholder="Pesquisar conversa…"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {!!search && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : error && conversations.length === 0 ? (
        <View style={s.center}>
          <Text style={{ color: colors.textMuted, marginBottom: 14 }}>Não foi possível carregar as conversas.</Text>
          <Pressable onPress={() => { setLoading(true); load(); }} style={[s.primaryBtn, { backgroundColor: colors.primary, paddingHorizontal: 20 }]}>
            <Text style={s.primaryBtnText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={c => c.id}
          contentContainerStyle={{ paddingBottom: navBarHeight + 16, flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={s.center}>
              <View style={[s.emptyIcon, { backgroundColor: colors.container }]}>
                <Ionicons name="chatbubbles-outline" size={26} color={colors.textMuted} />
              </View>
              <Text style={[s.emptyTitle, { color: colors.textSecondary }]}>
                {term ? 'Nenhum resultado.' : 'Nenhuma conversa ainda.'}
              </Text>
              {!term && (
                <Pressable onPress={() => setNewOpen(true)} hitSlop={8}>
                  <Text style={{ color: colors.primary, marginTop: 12, fontWeight: '600' }}>Iniciar uma conversa →</Text>
                </Pressable>
              )}
            </View>
          }
          renderItem={({ item }) => {
            const p = item.participants[0];
            return (
              <Pressable
                onPress={() => openChat(item.id)}
                style={({ pressed }) => [s.row, { borderBottomColor: colors.borderDark, opacity: pressed ? 0.8 : 1 }]}
              >
                <Avatar userImage={p?.avatar ?? null} username={p?.username ?? 'user'} size={48} />
                <View style={{ flex: 1 }}>
                  <View style={s.rowTop}>
                    <Text style={[s.rowName, { color: colors.textPrimary }]} numberOfLines={1}>{p?.fullName ?? 'Usuário'}</Text>
                    <Text style={[s.rowTime, { color: colors.textMuted }]}>{formatChatTime(item.updatedAt)}</Text>
                  </View>
                  <Text style={[s.rowPreview, { color: colors.textMuted }]} numberOfLines={1}>{preview(item, user?.id)}</Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}

      {newOpen && (
        <NewConversationModal
          onClose={() => setNewOpen(false)}
          onCreated={id => { setNewOpen(false); openChat(id); }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: 1 },
  iconBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 20, fontWeight: '900', letterSpacing: -0.4 },
  newBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  searchRow: { paddingHorizontal: 16, paddingVertical: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, height: 42 },
  searchBarInput: { flex: 1, fontSize: 14, padding: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  rowName: { flex: 1, fontSize: 15, fontWeight: '700', marginRight: 8 },
  rowTime: { fontSize: 12 },
  rowPreview: { fontSize: 13 },
  emptyIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 14 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 10 },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 14 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  sheetTitle: { fontSize: 17, fontWeight: '900' },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginBottom: 8 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14 },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 12 },
  error: { fontSize: 12, marginTop: 8 },
  primaryBtn: { height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  foundCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 14, padding: 14 },
  btnRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  outlineBtn: { height: 46, borderRadius: 23, borderWidth: 1, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  outlineBtnText: { fontSize: 15, fontWeight: '600' },
});
