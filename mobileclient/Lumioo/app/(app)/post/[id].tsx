import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Pressable, TextInput, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Avatar from '@/components/Avatar';
import { ConfirmModal, ActionSheet, InputModal, type SheetAction } from '@/components/modals';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiComment {
  id: string;
  username: string;
  authorId: string;
  userImage: string | null;
  text: string;
  timePosted: string;
  likes: number;
  isLiked: boolean;
}

interface ApiPostDetail {
  id: string;
  username: string;
  authorId: string;
  userImage: string | null;
  image: string | null;
  caption: string;
  likes: number;
  timePosted: string;
  isLiked: boolean;
  isSaved: boolean;
  comments: ApiComment[];
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

// ─── CommentItem ──────────────────────────────────────────────────────────────

function CommentItem({ comment, currentUserId, onMenu }: {
  comment: ApiComment;
  currentUserId: string | undefined;
  onMenu: (comment: ApiComment) => void;
}) {
  const { colors } = useTheme();
  const isOwn = comment.authorId === currentUserId;

  return (
    <View style={[styles.commentItem, { borderBottomColor: colors.borderDark }]}>
      <Avatar userImage={comment.userImage} username={comment.username} size={36} />
      <View style={styles.commentBody}>
        <View style={styles.commentHeader}>
          <Text style={[styles.commentUsername, { color: colors.textPrimary }]}>@{comment.username}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[styles.commentTime, { color: colors.textMuted }]}>{relativeTime(comment.timePosted)}</Text>
            {isOwn && (
              <Pressable
                hitSlop={8}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onMenu(comment); }}
              >
                <Ionicons name="ellipsis-horizontal" size={16} color={colors.textMuted} />
              </Pressable>
            )}
          </View>
        </View>
        <Text style={[styles.commentText, { color: colors.textSecondary }]}>{comment.text}</Text>
      </View>
    </View>
  );
}

// ─── PostDetailScreen ─────────────────────────────────────────────────────────

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [post, setPost] = useState<ApiPostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Modal states
  const [postMenuVisible, setPostMenuVisible] = useState(false);
  const [deletePostVisible, setDeletePostVisible] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const [reportPostVisible, setReportPostVisible] = useState(false);
  const [selectedComment, setSelectedComment] = useState<ApiComment | null>(null);
  const [deleteCommentVisible, setDeleteCommentVisible] = useState(false);
  const [deletingComment, setDeletingComment] = useState(false);
  const [editCommentVisible, setEditCommentVisible] = useState(false);
  const [editingComment, setEditingComment] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/posts/${id}`);
        setPost(data);
      } catch (err) {
        console.error('[PostDetail] carregar:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const navBarHeight = Math.max(insets.bottom, 8) + 16 + 72;
  const bottomPad = navBarHeight + 64 + 8;

  const handleLike = async () => {
    if (!post) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const wasLiked = post.isLiked;
    setPost(prev => prev ? { ...prev, isLiked: !prev.isLiked, likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1 } : prev);
    try {
      await api.post(`/posts/${post.id}/like`);
    } catch {
      setPost(prev => prev ? { ...prev, isLiked: wasLiked, likes: wasLiked ? prev.likes + 1 : prev.likes - 1 } : prev);
    }
  };

  const handleSave = async () => {
    if (!post) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const wasSaved = post.isSaved;
    setPost(prev => prev ? { ...prev, isSaved: !prev.isSaved } : prev);
    try {
      await api.post(`/posts/${post.id}/save`);
    } catch {
      setPost(prev => prev ? { ...prev, isSaved: wasSaved } : prev);
    }
  };

  const handleSendComment = async () => {
    const text = commentText.trim();
    if (!text || !post || isSending) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSending(true);
    setCommentText('');
    try {
      const { data } = await api.post(`/posts/${post.id}/comments`, { text });
      setPost(prev => prev ? {
        ...prev,
        comments: [...prev.comments, {
          id: data.id,
          username: data.username,
          authorId: data.authorId,
          userImage: data.userImage ?? null,
          text: data.text,
          timePosted: data.timePosted,
          likes: 0,
          isLiked: false,
        }],
      } : prev);
    } catch {
      setCommentText(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!selectedComment || !post) return;
    setDeletingComment(true);
    try {
      await api.delete(`/comments/${selectedComment.id}`);
      setPost(prev => prev ? { ...prev, comments: prev.comments.filter(c => c.id !== selectedComment.id) } : prev);
      setDeleteCommentVisible(false);
      setSelectedComment(null);
    } catch {
      // keep modal open on error
    } finally {
      setDeletingComment(false);
    }
  };

  const handleEditComment = async (newText: string) => {
    if (!selectedComment || !post) return;
    setEditingComment(true);
    try {
      await api.put(`/comments/${selectedComment.id}`, { text: newText });
      setPost(prev => prev ? {
        ...prev,
        comments: prev.comments.map(c => c.id === selectedComment.id ? { ...c, text: newText } : c),
      } : prev);
      setEditCommentVisible(false);
      setSelectedComment(null);
    } catch {
      // keep modal open on error
    } finally {
      setEditingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;
    setDeletingPost(true);
    try {
      await api.delete(`/posts/${post.id}`);
      setDeletePostVisible(false);
      router.back();
    } catch {
      setDeletingPost(false);
    }
  };

  const isOwnPost = post?.authorId === user?.id;

  const postMenuActions: SheetAction[] = isOwnPost
    ? [
        {
          icon: 'trash-outline',
          label: 'Excluir post',
          destructive: true,
          onPress: () => setDeletePostVisible(true),
        },
      ]
    : [
        {
          icon: 'flag-outline',
          label: 'Denunciar post',
          destructive: true,
          onPress: () => setReportPostVisible(true),
        },
      ];

  // ── Loading / error states ─────────────────────────────────────────────────

  const headerBar = (showMenu = false) => (
    <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.borderDark }]}>
      <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </Pressable>
      <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Post</Text>
      {showMenu ? (
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPostMenuVisible(true); }} style={styles.menuBtn} hitSlop={10}>
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.textMuted} />
        </Pressable>
      ) : (
        <View style={styles.menuBtn} />
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        {headerBar()}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        {headerBar()}
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.textMuted }]}>Post não encontrado.</Text>
        </View>
      </View>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {headerBar(true)}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Post */}
        <View style={[styles.postSection, { borderBottomColor: colors.borderDark }]}>
          <View style={styles.authorRow}>
            <Avatar userImage={post.userImage} username={post.username} size={48} />
            <View style={styles.authorInfo}>
              <Text style={[styles.authorName, { color: colors.textPrimary }]}>@{post.username}</Text>
              <Text style={[styles.authorMeta, { color: colors.textMuted }]}>{relativeTime(post.timePosted)}</Text>
            </View>
          </View>

          <Text style={[styles.postContent, { color: colors.textPrimary }]}>{post.caption}</Text>

          {!!post.image && (
            <Image source={{ uri: post.image }} style={styles.postImage} resizeMode="cover" />
          )}

          <View style={[styles.divider, { backgroundColor: colors.borderDark }]} />

          {/* Stats */}
          <View style={styles.statsRow}>
            <Text style={[styles.statItem, { color: colors.textSecondary }]}>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{post.likes}</Text>
              {' '}curtida{post.likes !== 1 ? 's' : ''}
            </Text>
            <Text style={[styles.statItem, { color: colors.textSecondary }]}>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{post.comments.length}</Text>
              {' '}comentário{post.comments.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderDark }]} />

          {/* Actions */}
          <View style={styles.actionsRow}>
            <Pressable
              onPress={handleLike}
              style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Ionicons
                name={post.isLiked ? 'heart' : 'heart-outline'}
                size={24}
                color={post.isLiked ? colors.primary : colors.textMuted}
              />
            </Pressable>
            <Pressable style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}>
              <Ionicons name="chatbubble-outline" size={22} color={colors.textMuted} />
            </Pressable>
            <Pressable style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}>
              <Ionicons name="arrow-redo-outline" size={23} color={colors.textMuted} />
            </Pressable>
            <View style={{ flex: 1 }} />
            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Ionicons
                name={post.isSaved ? 'bookmark' : 'bookmark-outline'}
                size={23}
                color={post.isSaved ? colors.primary : colors.textMuted}
              />
            </Pressable>
          </View>
        </View>

        {/* Comments */}
        <View style={styles.commentsSection}>
          <Text style={[styles.commentsSectionTitle, { color: colors.textMuted }]}>Comentários</Text>
          {post.comments.length === 0 ? (
            <Text style={[styles.emptyComments, { color: colors.textMuted }]}>Seja o primeiro a comentar!</Text>
          ) : (
            post.comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={user?.id}
                onMenu={(c) => { setSelectedComment(c); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Comment input */}
      <View style={[styles.inputBar, { backgroundColor: colors.background, borderTopColor: colors.borderDark, paddingBottom: navBarHeight + 8 }]}>
        <Avatar userImage={user?.avatar ?? null} username={user?.username ?? 'eu'} size={34} />
        <View style={[styles.inputWrapper, { backgroundColor: colors.container, borderColor: colors.border }]}>
          <TextInput
            style={[styles.textInput, { color: colors.textPrimary }]}
            placeholder="Adicionar comentário..."
            placeholderTextColor={colors.textMuted}
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
          />
          {commentText.trim().length > 0 && (
            <Pressable onPress={handleSendComment} hitSlop={8} disabled={isSending}>
              {isSending
                ? <ActivityIndicator size="small" color={colors.primary} />
                : <Ionicons name="send" size={20} color={colors.primary} />
              }
            </Pressable>
          )}
        </View>
      </View>
      {/* ── Post menu (owner: delete / other: report) ── */}
      <ActionSheet
        visible={postMenuVisible}
        title="Opções do post"
        actions={postMenuActions}
        onClose={() => setPostMenuVisible(false)}
      />

      {/* ── Confirm delete post ── */}
      <ConfirmModal
        visible={deletePostVisible}
        title="Excluir post"
        message="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        destructive
        loading={deletingPost}
        onConfirm={handleDeletePost}
        onClose={() => setDeletePostVisible(false)}
      />

      {/* ── Confirm report post ── */}
      <ConfirmModal
        visible={reportPostVisible}
        title="Denunciar post"
        message="Vamos analisar o conteúdo e tomar as medidas necessárias."
        confirmLabel="Denunciar"
        destructive
        onConfirm={() => setReportPostVisible(false)}
        onClose={() => setReportPostVisible(false)}
      />

      {/* ── Comment action sheet (edit / delete) ── */}
      <ActionSheet
        visible={!!selectedComment && !deleteCommentVisible && !editCommentVisible}
        title="Opções do comentário"
        actions={[
          {
            icon: 'create-outline',
            label: 'Editar comentário',
            onPress: () => setEditCommentVisible(true),
          },
          {
            icon: 'trash-outline',
            label: 'Excluir comentário',
            destructive: true,
            onPress: () => setDeleteCommentVisible(true),
          },
        ]}
        onClose={() => setSelectedComment(null)}
      />

      {/* ── Confirm delete comment ── */}
      <ConfirmModal
        visible={deleteCommentVisible}
        title="Excluir comentário"
        message="Tem certeza que deseja excluir este comentário?"
        confirmLabel="Excluir"
        destructive
        loading={deletingComment}
        onConfirm={handleDeleteComment}
        onClose={() => { setDeleteCommentVisible(false); setSelectedComment(null); }}
      />

      {/* ── Edit comment ── */}
      <InputModal
        visible={editCommentVisible}
        title="Editar comentário"
        initialValue={selectedComment?.text ?? ''}
        placeholder="Escreva seu comentário..."
        maxLength={500}
        confirmLabel="Salvar"
        loading={editingComment}
        onConfirm={handleEditComment}
        onClose={() => { setEditCommentVisible(false); setSelectedComment(null); }}
      />
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  menuBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  postSection: { paddingHorizontal: 16, paddingTop: 16, borderBottomWidth: 1 },
  authorRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 12 },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 16, fontWeight: '700' },
  authorMeta: { fontSize: 13, marginTop: 1 },
  postContent: { fontSize: 17, lineHeight: 26, marginBottom: 14 },
  postImage: { width: '100%', height: 260, borderRadius: 12, marginBottom: 14 },
  divider: { height: 1, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  statItem: { fontSize: 14 },
  statValue: { fontWeight: '700', fontSize: 14 },
  actionsRow: { flexDirection: 'row', alignItems: 'center', paddingBottom: 4 },
  actionBtn: { padding: 8, marginRight: 4 },
  commentsSection: { paddingTop: 8 },
  commentsSectionTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', paddingHorizontal: 16, paddingVertical: 10 },
  commentItem: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 12, borderBottomWidth: 1 },
  commentBody: { flex: 1 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  commentUsername: { fontSize: 14, fontWeight: '600' },
  commentTime: { fontSize: 12 },
  commentText: { fontSize: 14, lineHeight: 20 },
  inputBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, gap: 10, borderTopWidth: 1 },
  inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, gap: 8, minHeight: 42 },
  textInput: { flex: 1, fontSize: 14, maxHeight: 80, padding: 0 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 15 },
  emptyComments: { textAlign: 'center', fontSize: 14, paddingVertical: 24 },
});
