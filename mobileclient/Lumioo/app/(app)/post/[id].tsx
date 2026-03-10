import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';
import { INITIAL_POSTS, CURRENT_USER_ID, type Post, type Comment, type User } from '@/constants/feedData';

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ user, size = 42 }: { user: User; size?: number }) {
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: user.avatarColor,
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.35 }}>
        {user.initials}
      </Text>
    </View>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.commentItem, { borderBottomColor: colors.borderDark }]}>
      <Avatar user={comment.user} size={36} />
      <View style={styles.commentBody}>
        <View style={styles.commentHeader}>
          <Text style={[styles.commentName, { color: colors.textPrimary }]}>
            {comment.user.name}
          </Text>
          <Text style={[styles.commentTime, { color: colors.textMuted }]}>
            {comment.createdAt}
          </Text>
        </View>
        <Text style={[styles.commentUsername, { color: colors.textMuted }]}>
          {comment.user.username}
        </Text>
        <Text style={[styles.commentText, { color: colors.textSecondary }]}>
          {comment.text}
        </Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [post, setPost] = useState<Post | null>(
    () => INITIAL_POSTS.find((p) => p.id === id) ?? null
  );
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>(post?.comments ?? []);

  if (!post) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.borderDark }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.textMuted }]}>Post não encontrado.</Text>
        </View>
      </View>
    );
  }

  const isOwn = post.user.id === CURRENT_USER_ID;
  const currentUser = { id: 'user_1', name: 'João Lucas', username: '@joaolucas', initials: 'JL', institution: 'USP · Eng. Computação', avatarColor: '#ff3131' };

  // NavFloatBar offset: same formula as feed.tsx
  const navBarHeight = Math.max(insets.bottom, 8) + 16 + 72;
  // Comment input bar height
  const inputBarHeight = 64;
  const bottomPad = navBarHeight + inputBarHeight + 8;

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPost((prev) =>
      prev ? { ...prev, liked: !prev.liked, likes: prev.liked ? prev.likes - 1 : prev.likes + 1 } : prev
    );
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPost((prev) => prev ? { ...prev, saved: !prev.saved } : prev);
  };

  const handleSendComment = () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newComment: Comment = {
      id: `new_${Date.now()}`,
      user: currentUser,
      text: trimmed,
      createdAt: 'agora',
    };
    setComments((prev) => [...prev, newComment]);
    setPost((prev) => prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : prev);
    setCommentText('');
  };

  const handleMenuPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isOwn) {
      Alert.alert('Opções', '', [
        { text: 'Editar post', onPress: () => Alert.alert('Editar', 'Funcionalidade em breve.') },
        { text: 'Excluir post', style: 'destructive', onPress: () => { router.back(); } },
        { text: 'Cancelar', style: 'cancel' },
      ]);
    } else {
      Alert.alert('Opções', '', [
        { text: 'Denunciar post', style: 'destructive', onPress: () => Alert.alert('Denúncia enviada', 'Obrigado por nos ajudar a manter a comunidade segura.') },
        { text: 'Cancelar', style: 'cancel' },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.borderDark }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Post</Text>
        <Pressable onPress={handleMenuPress} style={styles.menuBtn} hitSlop={10}>
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.textMuted} />
        </Pressable>
      </View>

      {/* ── Content ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Post author */}
        <View style={[styles.postSection, { borderBottomColor: colors.borderDark }]}>
          <View style={styles.authorRow}>
            <Avatar user={post.user} size={48} />
            <View style={styles.authorInfo}>
              <Text style={[styles.authorName, { color: colors.textPrimary }]}>{post.user.name}</Text>
              <Text style={[styles.authorMeta, { color: colors.textMuted }]}>
                {post.user.username}
              </Text>
              <Text style={[styles.authorInstitution, { color: colors.textTertiary }]}>
                {post.user.institution}
              </Text>
            </View>
          </View>

          {/* Content */}
          <Text style={[styles.postContent, { color: colors.textPrimary }]}>
            {post.content}
          </Text>

          {/* Timestamp */}
          <Text style={[styles.postTimestamp, { color: colors.textMuted }]}>
            {post.createdAt} atrás
          </Text>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.borderDark }]} />

          {/* Stats */}
          <View style={styles.statsRow}>
            <Text style={[styles.statItem, { color: colors.textSecondary }]}>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{post.likes}</Text>
              {' '}curtida{post.likes !== 1 ? 's' : ''}
            </Text>
            <Text style={[styles.statItem, { color: colors.textSecondary }]}>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{post.commentsCount}</Text>
              {' '}comentário{post.commentsCount !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.borderDark }]} />

          {/* Actions */}
          <View style={styles.actionsRow}>
            {/* Like */}
            <Pressable
              onPress={handleLike}
              style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Ionicons
                name={post.liked ? 'heart' : 'heart-outline'}
                size={24}
                color={post.liked ? colors.primary : colors.textMuted}
              />
            </Pressable>

            {/* Comment */}
            <Pressable
              style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Ionicons name="chatbubble-outline" size={22} color={colors.textMuted} />
            </Pressable>

            {/* Share */}
            <Pressable
              style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Ionicons name="arrow-redo-outline" size={23} color={colors.textMuted} />
            </Pressable>

            {/* Spacer */}
            <View style={{ flex: 1 }} />

            {/* Save */}
            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Ionicons
                name={post.saved ? 'bookmark' : 'bookmark-outline'}
                size={23}
                color={post.saved ? colors.primary : colors.textMuted}
              />
            </Pressable>
          </View>
        </View>

        {/* ── Comments ── */}
        <View style={styles.commentsSection}>
          <Text style={[styles.commentsSectionTitle, { color: colors.textMuted }]}>
            Comentários
          </Text>
          {comments.length === 0 ? (
            <Text style={[styles.emptyComments, { color: colors.textMuted }]}>
              Seja o primeiro a comentar!
            </Text>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </View>
      </ScrollView>

      {/* ── Comment Input Bar ── */}
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.borderDark,
            paddingBottom: navBarHeight + 8,
          },
        ]}
      >
        <Avatar user={currentUser} size={34} />
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
            <Pressable onPress={handleSendComment} hitSlop={8}>
              <Ionicons name="send" size={20} color={colors.primary} />
            </Pressable>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  menuBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Post section
  postSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 0,
    borderBottomWidth: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
  },
  authorMeta: {
    fontSize: 13,
    marginTop: 1,
  },
  authorInstitution: {
    fontSize: 12,
    marginTop: 1,
  },
  postContent: {
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 14,
  },
  postTimestamp: {
    fontSize: 13,
    marginBottom: 14,
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    fontSize: 14,
  },
  statValue: {
    fontWeight: '700',
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 4,
  },
  actionBtn: {
    padding: 8,
    marginRight: 4,
  },
  // Comments section
  commentsSection: {
    paddingTop: 8,
  },
  commentsSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  commentItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  commentBody: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  commentName: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentTime: {
    fontSize: 12,
  },
  commentUsername: {
    fontSize: 12,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Input bar
  inputBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 10,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
    minHeight: 42,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    maxHeight: 80,
    padding: 0,
  },
  // Not found
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 15,
  },
  // Empty comments
  emptyComments: {
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 24,
  },
});
