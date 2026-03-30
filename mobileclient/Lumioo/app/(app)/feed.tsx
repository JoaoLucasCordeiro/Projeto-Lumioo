import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, Pressable, FlatList, StyleSheet,
  ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Avatar from '@/components/Avatar';
import { ActionSheet, ConfirmModal, type SheetAction } from '@/components/modals';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiPost {
  id: string;
  username: string;
  authorId: string;
  userImage: string | null;
  image: string | null;
  caption: string;
  likes: number;
  comments: number;
  timePosted: string;
  isLiked: boolean;
  isSaved: boolean;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'agora';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return `${Math.floor(d / 7)}sem`;
}

// ─── PostCard ─────────────────────────────────────────────────────────────────

function PostCard({ post, currentUserId, onLike, onSave, onMenuPress, onPress }: {
  post: ApiPost;
  currentUserId: string | undefined;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onMenuPress: (post: ApiPost) => void;
  onPress: (post: ApiPost) => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => onPress(post)}
      style={({ pressed }) => [
        styles.postCard,
        { backgroundColor: colors.container, borderColor: colors.border, opacity: pressed ? 0.95 : 1 },
      ]}
    >
      {/* Header */}
      <View style={styles.postHeader}>
        <Avatar userImage={post.userImage} username={post.username} size={42} />
        <View style={styles.postUserInfo}>
          <Text style={[styles.postUserName, { color: colors.textPrimary }]}>@{post.username}</Text>
          <Text style={[styles.postMeta, { color: colors.textMuted }]}>{relativeTime(post.timePosted)}</Text>
        </View>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onMenuPress(post); }}
          hitSlop={10}
          style={styles.menuBtn}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textMuted} />
        </Pressable>
      </View>

      {/* Caption */}
      <Text style={[styles.postContent, { color: colors.textSecondary }]}>{post.caption}</Text>

      {/* Image */}
      {!!post.image && (
        <Image
          source={{ uri: post.image }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.borderDark }]} />

      {/* Actions */}
      <View style={styles.actionsRow}>
        <View style={styles.actionsLeft}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onLike(post.id); }}
            style={styles.actionBtn}
          >
            <Ionicons
              name={post.isLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={post.isLiked ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.actionCount, { color: post.isLiked ? colors.primary : colors.textMuted }]}>
              {post.likes}
            </Text>
          </Pressable>

          <Pressable
            style={styles.actionBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(post); }}
          >
            <Ionicons name="chatbubble-outline" size={20} color={colors.textMuted} />
            <Text style={[styles.actionCount, { color: colors.textMuted }]}>{post.comments}</Text>
          </Pressable>

          <Pressable style={styles.actionBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <Ionicons name="arrow-redo-outline" size={21} color={colors.textMuted} />
          </Pressable>
        </View>

        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onSave(post.id); }}
          style={styles.actionBtn}
        >
          <Ionicons
            name={post.isSaved ? 'bookmark' : 'bookmark-outline'}
            size={21}
            color={post.isSaved ? colors.primary : colors.textMuted}
          />
        </Pressable>
      </View>

      {/* Likes count */}
      <Text style={[styles.likesText, { color: colors.textSecondary }]}>
        {post.likes} curtida{post.likes !== 1 ? 's' : ''}
        {post.authorId === currentUserId && (
          <Text style={{ color: colors.textMuted }}> · seu post</Text>
        )}
      </Text>
    </Pressable>
  );
}

// ─── FeedScreen ───────────────────────────────────────────────────────────────

export default function FeedScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ApiPost | null>(null);
  const [deletePostVisible, setDeletePostVisible] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const [reportPostVisible, setReportPostVisible] = useState(false);

  const loadFeed = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    try {
      const { data } = await api.get('/feed');
      setPosts(data.posts);
      setCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    } catch (err) {
      console.error('[Feed] carregar:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || isFetchingMore || !cursor) return;
    setIsFetchingMore(true);
    try {
      const { data } = await api.get(`/feed?cursor=${cursor}`);
      setPosts(prev => [...prev, ...data.posts]);
      setCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    } catch (err) {
      console.error('[Feed] carregar mais:', err);
    } finally {
      setIsFetchingMore(false);
    }
  }, [cursor, hasMore, isFetchingMore]);

  useEffect(() => { loadFeed(); }, []);

  const handleLike = useCallback(async (id: string) => {
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p
    ));
    try {
      await api.post(`/posts/${id}/like`);
    } catch {
      // revert
      setPosts(prev => prev.map(p =>
        p.id === id ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p
      ));
    }
  }, []);

  const handleSave = useCallback(async (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, isSaved: !p.isSaved } : p));
    try {
      await api.post(`/posts/${id}/save`);
    } catch {
      setPosts(prev => prev.map(p => p.id === id ? { ...p, isSaved: !p.isSaved } : p));
    }
  }, []);

  const handleDelete = useCallback(async () => {
    if (!selectedPost) return;
    setDeletingPost(true);
    try {
      await api.delete(`/posts/${selectedPost.id}`);
      setPosts(prev => prev.filter(p => p.id !== selectedPost.id));
      setDeletePostVisible(false);
      setSelectedPost(null);
    } catch {
      // keep modal open
    } finally {
      setDeletingPost(false);
    }
  }, [selectedPost]);

  const handleReport = useCallback(() => {
    setReportPostVisible(false);
    setSelectedPost(null);
  }, []);

  const handlePostPress = useCallback((post: ApiPost) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(app)/post/${post.id}` as any);
  }, [router]);

  const bottomPad = Math.max(insets.bottom, 8) + 16 + 72 + 12;

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.borderDark }]}>
      <Text style={[styles.headerLogo, { color: colors.textPrimary }]}>Lumioo</Text>
      <View style={styles.headerActions}>
        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="notifications-outline" size={24} color={colors.textSecondary} />
        </Pressable>
        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="chatbubbles-outline" size={24} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        {header}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {header}

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: bottomPad, gap: 12, paddingHorizontal: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadFeed(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View style={{ paddingTop: 60, alignItems: 'center', gap: 12 }}>
            <Ionicons name="newspaper-outline" size={48} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, fontSize: 15 }}>Nenhum post ainda</Text>
          </View>
        }
        ListFooterComponent={
          isFetchingMore
            ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
            : null
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUserId={user?.id}
            onLike={handleLike}
            onSave={handleSave}
            onPress={handlePostPress}
            onMenuPress={(p) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedPost(p); }}
          />
        )}
      />

      {/* Post action sheet */}
      <ActionSheet
        visible={!!selectedPost && !deletePostVisible && !reportPostVisible}
        title="Opções do post"
        actions={selectedPost?.authorId === user?.id
          ? [
              {
                icon: 'trash-outline',
                label: 'Excluir post',
                destructive: true,
                onPress: () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setDeletePostVisible(true); },
              },
            ]
          : [
              {
                icon: 'flag-outline',
                label: 'Denunciar post',
                destructive: true,
                onPress: () => setReportPostVisible(true),
              },
            ]
        }
        onClose={() => setSelectedPost(null)}
      />

      {/* Confirm delete post */}
      <ConfirmModal
        visible={deletePostVisible}
        title="Excluir post"
        message="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        destructive
        loading={deletingPost}
        onConfirm={handleDelete}
        onClose={() => { setDeletePostVisible(false); setSelectedPost(null); }}
      />

      {/* Confirm report post */}
      <ConfirmModal
        visible={reportPostVisible}
        title="Denunciar post"
        message="Vamos analisar o conteúdo e tomar as medidas necessárias."
        confirmLabel="Denunciar"
        destructive
        onConfirm={handleReport}
        onClose={() => { setReportPostVisible(false); setSelectedPost(null); }}
      />

      {/* FAB — criar post */}
      <View
        style={{
          position: 'absolute',
          right: 20,
          bottom: Math.max(insets.bottom, 8) + 16 + 72 + 16,
          zIndex: 50,
        }}
      >
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/(app)/create-post' as any); }}
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        >
          <View style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: '#ff3131',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#ff3131',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 10,
          }}>
            <Ionicons name="add" size={30} color="#fff" />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1,
  },
  headerLogo: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  postCard: { borderRadius: 20, borderWidth: 1, padding: 16 },
  postHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  postUserInfo: { flex: 1, marginLeft: 12 },
  postUserName: { fontSize: 15, fontWeight: '700' },
  postMeta: { fontSize: 12, marginTop: 1 },
  menuBtn: { padding: 4 },
  postContent: { fontSize: 14, lineHeight: 21, marginBottom: 12 },
  postImage: { width: '100%', height: 220, borderRadius: 12, marginBottom: 14 },
  divider: { height: 1, marginBottom: 12 },
  actionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  actionsLeft: { flexDirection: 'row', gap: 4 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', padding: 6, gap: 5 },
  actionCount: { fontSize: 13, fontWeight: '500' },
  likesText: { fontSize: 13, fontWeight: '600' },
});
