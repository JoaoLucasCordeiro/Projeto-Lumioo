import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';
import { PagedUserList, usePagedUsers } from '@/components/UserList';
import { fetchBlocked, unblockUser, type FollowUser } from '@/lib/social';

export default function BlockedUsersScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const state = usePagedUsers(fetchBlocked);
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleUnblock = (u: FollowUser) => {
    Alert.alert('Desbloquear', `Desbloquear @${u.username}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Desbloquear',
        onPress: async () => {
          setBusyId(u.id);
          try {
            await unblockUser(u.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            state.remove(u.id);
          } catch {
            Alert.alert('Erro', 'Não foi possível desbloquear. Tente novamente.');
          } finally {
            setBusyId(null);
          }
        },
      },
    ]);
  };

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <View style={[s.header, { paddingTop: insets.top + 10, borderBottomColor: colors.borderDark }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[s.title, { color: colors.textPrimary }]}>Usuários bloqueados</Text>
        <View style={s.backBtn} />
      </View>
      <PagedUserList
        state={state}
        emptyText="Você não bloqueou ninguém."
        bottomPadding={Math.max(insets.bottom, 8) + 16 + 72 + 16}
        renderRight={u => (
          <Pressable
            onPress={() => handleUnblock(u)}
            disabled={busyId === u.id}
            style={[s.unblockBtn, { borderColor: colors.border }]}
          >
            {busyId === u.id
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '600' }}>Desbloquear</Text>}
          </Pressable>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1,
  },
  backBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '700' },
  unblockBtn: {
    minWidth: 96, height: 34, paddingHorizontal: 12, borderRadius: 17, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
});
