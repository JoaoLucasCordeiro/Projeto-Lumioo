import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, Pressable, Modal, FlatList, ActivityIndicator, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';
import Avatar from '@/components/Avatar';
import { ACADEMIC_LEVEL_LABEL, type FollowListPage, type FollowUser } from '@/lib/social';

// ─── UserRow ──────────────────────────────────────────────────────────────────

export function UserRow({ user, onPress, right }: {
  user: FollowUser;
  onPress?: (user: FollowUser) => void;
  right?: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress ? () => onPress(user) : undefined}
      style={({ pressed }) => [s.row, { borderBottomColor: colors.borderDark, opacity: pressed && onPress ? 0.8 : 1 }]}
    >
      <Avatar userImage={user.avatar} username={user.username} size={44} />
      <View style={s.rowInfo}>
        <Text style={[s.name, { color: colors.textPrimary }]} numberOfLines={1}>{user.fullName}</Text>
        <Text style={[s.meta, { color: colors.textMuted }]} numberOfLines={1}>
          @{user.username} · {ACADEMIC_LEVEL_LABEL[user.academicLevel] ?? user.academicLevel}
        </Text>
      </View>
      {right}
    </Pressable>
  );
}

// ─── Lista paginada por cursor (compartilhada pelo modal e pela tela de bloqueados) ──

export function usePagedUsers(fetchPage: (cursor?: string) => Promise<FollowListPage>, enabled = true) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const page = await fetchPage();
      setUsers(page.users);
      setCursor(page.nextCursor);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [fetchPage]);

  useEffect(() => {
    if (enabled) load();
  }, [enabled, load]);

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await fetchPage(cursor);
      setUsers(prev => [...prev, ...page.users.filter(u => !prev.some(p => p.id === u.id))]);
      setCursor(page.nextCursor);
    } catch {
      // mantém o que já foi carregado
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, loadingMore, fetchPage]);

  const remove = useCallback((id: string) => setUsers(prev => prev.filter(u => u.id !== id)), []);

  return { users, loading, loadingMore, error, load, loadMore, remove };
}

export function PagedUserList({ state, emptyText, onSelect, renderRight, bottomPadding = 24 }: {
  state: ReturnType<typeof usePagedUsers>;
  emptyText: string;
  onSelect?: (user: FollowUser) => void;
  renderRight?: (user: FollowUser) => React.ReactNode;
  bottomPadding?: number;
}) {
  const { colors } = useTheme();
  const { users, loading, loadingMore, error, load, loadMore } = state;

  if (loading) {
    return <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }
  if (error) {
    return (
      <View style={s.center}>
        <Text style={{ color: colors.textMuted, marginBottom: 12 }}>Não foi possível carregar a lista.</Text>
        <Pressable onPress={load} style={[s.retryBtn, { backgroundColor: colors.primary }]}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <FlatList
      data={users}
      keyExtractor={u => u.id}
      renderItem={({ item }) => (
        <UserRow user={item} onPress={onSelect} right={renderRight?.(item)} />
      )}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      contentContainerStyle={{ paddingBottom: bottomPadding, flexGrow: 1 }}
      ListEmptyComponent={
        <View style={s.center}><Text style={{ color: colors.textMuted }}>{emptyText}</Text></View>
      }
      ListFooterComponent={loadingMore ? <ActivityIndicator style={{ marginVertical: 16 }} color={colors.primary} /> : null}
    />
  );
}

// ─── UserListModal: seguidores / seguindo ────────────────────────────────────

export function UserListModal({ visible, title, fetchPage, emptyText, onClose, onSelectUser }: {
  visible: boolean;
  title: string;
  fetchPage: (cursor?: string) => Promise<FollowListPage>;
  emptyText: string;
  onClose: () => void;
  onSelectUser: (user: FollowUser) => void;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const state = usePagedUsers(fetchPage, visible);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[s.root, { backgroundColor: colors.background }]}>
        <View style={[s.header, { paddingTop: insets.top + 10, borderBottomColor: colors.borderDark }]}>
          <Text style={[s.title, { color: colors.textPrimary }]}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={12} style={[s.closeBtn, { backgroundColor: colors.containerLight }]}>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
        <PagedUserList
          state={state}
          emptyText={emptyText}
          onSelect={onSelectUser}
          bottomPadding={Math.max(insets.bottom, 16) + 16}
        />
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1,
  },
  title: { fontSize: 17, fontWeight: '700' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowInfo: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600' },
  meta: { fontSize: 13, marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  retryBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20 },
});
