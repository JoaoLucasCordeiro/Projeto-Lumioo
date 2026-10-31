import React, { useState } from 'react';
import { View, Text, Pressable, Image, useWindowDimensions, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/contexts/ThemeContext';
import { ActionSheet, ConfirmModal } from '@/components/modals';
import api from '@/lib/api';
import type { ProfilePost } from '@/lib/social';

type Filter = 'all' | 'media' | 'text';

const FILTERS: { id: Filter; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { id: 'all', label: 'Todos', icon: 'grid-outline' },
  { id: 'media', label: 'Com mídia', icon: 'image-outline' },
  { id: 'text', label: 'Só texto', icon: 'text-outline' },
];

const GAP = 8;
const PAD = 16;

/**
 * Grade de posts do perfil (equivalente a PostGrid + ProfilePostCard da web):
 * fotos em quadrados, textos em cards estilo post-it, filtros e menu de contexto
 * (segure o card: dono edita/exclui; os demais salvam).
 */
export default function ProfilePostGrid({ posts, currentUserId, emptyMessage, emptyHint, onChanged }: {
  posts: ProfilePost[];
  currentUserId?: string;
  emptyMessage: string;
  emptyHint: string;
  onChanged: () => void;
}) {
  const { colors } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<ProfilePost | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const counts = {
    all: posts.length,
    media: posts.filter(p => !!p.image).length,
    text: posts.filter(p => !p.image).length,
  };
  const filtered = posts.filter(p => (filter === 'media' ? !!p.image : filter === 'text' ? !p.image : true));
  const listMode = filter === 'text';
  const tile = (width - PAD * 2 - GAP) / 2;

  const openMenu = (post: ProfilePost) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelected(post);
    setMenuOpen(true);
  };

  const handleDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      await api.delete(`/posts/${selected.id}`);
      setDeleteOpen(false);
      setSelected(null);
      onChanged();
    } catch {
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleSave = async (post: ProfilePost) => {
    try {
      await api.post(`/posts/${post.id}/save`);
      onChanged();
    } catch {
      // mantém o estado atual
    }
  };

  const isOwn = selected?.authorId === currentUserId;

  const Stats = ({ post, light = false }: { post: ProfilePost; light?: boolean }) => (
    <View style={s.statsRow}>
      <Ionicons name={post.isLiked ? 'heart' : 'heart-outline'} size={13} color={light ? '#fff' : post.isLiked ? colors.primary : colors.textMuted} />
      <Text style={[s.statText, { color: light ? '#fff' : colors.textMuted }]}>{post.likes}</Text>
      <Ionicons name="chatbubble-outline" size={12} color={light ? '#fff' : colors.textMuted} style={{ marginLeft: 8 }} />
      <Text style={[s.statText, { color: light ? '#fff' : colors.textMuted }]}>{post.comments}</Text>
    </View>
  );

  return (
    <View style={{ paddingHorizontal: PAD }}>
      {/* Filtros — só quando há mistura de fotos e textos */}
      {counts.media > 0 && counts.text > 0 && (
        <View style={[s.filters, { backgroundColor: `${colors.container}`, borderColor: colors.border }]}>
          {FILTERS.map(f => {
            const active = filter === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => setFilter(f.id)}
                style={[s.filterPill, active && { backgroundColor: colors.primary }]}
              >
                <Ionicons name={f.icon} size={12} color={active ? '#fff' : colors.textTertiary} />
                <Text style={[s.filterText, { color: active ? '#fff' : colors.textTertiary }]}>
                  {f.label} <Text style={{ color: active ? '#fecaca' : colors.textMuted }}>{counts[f.id]}</Text>
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {filtered.length === 0 ? (
        <View style={s.empty}>
          <View style={[s.emptyIcon, { borderColor: colors.border }]}>
            <Ionicons name="grid-outline" size={20} color={colors.textMuted} />
          </View>
          <Text style={[s.emptyTitle, { color: colors.textSecondary }]}>{posts.length === 0 ? emptyMessage : 'Nenhum post neste filtro.'}</Text>
          {posts.length === 0 && <Text style={[s.emptyHint, { color: colors.textMuted }]}>{emptyHint}</Text>}
        </View>
      ) : (
        <View style={s.grid}>
          {filtered.map(post => {
            const go = () => router.push(`/(app)/post/${post.id}` as any);
            if (post.image) {
              return (
                <Pressable
                  key={post.id}
                  onPress={go}
                  onLongPress={() => openMenu(post)}
                  style={[s.photoTile, { width: tile, height: tile, backgroundColor: colors.container }]}
                >
                  <Image source={{ uri: post.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                  <View style={s.photoShade}><Stats post={post} light /></View>
                </Pressable>
              );
            }
            if (listMode) {
              return (
                <Pressable
                  key={post.id}
                  onPress={go}
                  onLongPress={() => openMenu(post)}
                  style={[s.listCard, { width: '100%', backgroundColor: colors.container, borderColor: colors.border }]}
                >
                  <View style={[s.accent, { backgroundColor: colors.primary }]} />
                  <Text style={[s.listText, { color: colors.textSecondary }]} numberOfLines={4}>{post.caption}</Text>
                  <View style={[s.listFooter, { borderTopColor: colors.borderDark }]}><Stats post={post} /></View>
                </Pressable>
              );
            }
            // Card de texto estilo post-it (modo grade)
            return (
              <Pressable
                key={post.id}
                onPress={go}
                onLongPress={() => openMenu(post)}
                style={[s.noteTile, { width: tile, height: tile, backgroundColor: colors.container, borderColor: colors.border }]}
              >
                <View style={s.noteLines} pointerEvents="none">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <View key={i} style={[s.noteLine, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
                  ))}
                </View>
                <View style={s.noteStrip}>
                  <View style={s.noteDot} />
                  <Text style={s.noteUser} numberOfLines={1}>@{post.username}</Text>
                </View>
                <Text style={[s.noteText, { color: colors.textSecondary }]} numberOfLines={5}>{post.caption}</Text>
                <View style={s.noteFooter}><Stats post={post} /></View>
              </Pressable>
            );
          })}
        </View>
      )}

      <ActionSheet
        visible={menuOpen}
        title="Opções do post"
        actions={
          isOwn
            ? [
                { icon: 'create-outline', label: 'Editar', onPress: () => selected && router.push({ pathname: '/edit-post', params: { id: selected.id } } as any) },
                { icon: 'trash-outline', label: 'Excluir', destructive: true, onPress: () => setDeleteOpen(true) },
              ]
            : [
                {
                  icon: selected?.isSaved ? 'bookmark' : 'bookmark-outline',
                  label: selected?.isSaved ? 'Remover dos salvos' : 'Salvar',
                  onPress: () => selected && handleToggleSave(selected),
                },
              ]
        }
        onClose={() => setMenuOpen(false)}
      />
      <ConfirmModal
        visible={deleteOpen}
        title="Excluir publicação"
        message="Esta ação é permanente e não pode ser desfeita."
        confirmLabel="Excluir"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => { setDeleteOpen(false); setSelected(null); }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  filters: {
    flexDirection: 'row', alignSelf: 'center', gap: 4, padding: 4, marginBottom: 14,
    borderRadius: 20, borderWidth: 1,
  },
  filterPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 16 },
  filterText: { fontSize: 12, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  photoTile: { borderRadius: 14, overflow: 'hidden' },
  photoShade: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 8, backgroundColor: 'rgba(0,0,0,0.45)' },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, fontWeight: '600' },
  noteTile: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  noteLines: { position: 'absolute', top: 36, left: 14, right: 14, gap: 17 },
  noteLine: { height: 1, width: '100%' },
  noteStrip: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 28, flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, backgroundColor: 'rgba(239,68,68,0.10)', borderBottomWidth: 1, borderBottomColor: 'rgba(239,68,68,0.15)',
  },
  noteDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(248,113,113,0.6)' },
  noteUser: { flex: 1, fontSize: 10, fontWeight: '700', color: 'rgba(248,113,113,0.85)' },
  noteText: { marginTop: 36, marginHorizontal: 12, fontSize: 12, lineHeight: 17, fontWeight: '500' },
  noteFooter: { position: 'absolute', left: 12, bottom: 9 },
  listCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  accent: { width: 24, height: 2, borderRadius: 1 },
  listText: { fontSize: 14, lineHeight: 21 },
  listFooter: { borderTopWidth: 1, paddingTop: 8 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { width: 48, height: 48, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 14, fontWeight: '600' },
  emptyHint: { fontSize: 12, marginTop: 4, textAlign: 'center', maxWidth: 260 },
});
