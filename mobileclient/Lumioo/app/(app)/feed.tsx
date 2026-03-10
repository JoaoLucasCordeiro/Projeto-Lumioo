import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';
import {
  INITIAL_POSTS, CURRENT_USER_ID,
  type User, type Post,
} from '@/constants/feedData';

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ user, size = 42 }: { user: User; size?: number }) {
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: user.avatarColor,
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.35 }}>
        {user.initials}
      </Text>
    </View>
  );
}

function ActionModal({
  visible,
  isOwnPost,
  onClose,
  onEdit,
  onDelete,
  onReport,
}: {
  visible: boolean;
  isOwnPost: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
}) {
  const { colors } = useTheme();

  const ActionRow = ({
    icon, label, color, onPress,
  }: {
    icon: string; label: string; color?: string; onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionRow,
        { borderColor: colors.borderDark, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.actionIcon, { backgroundColor: `${color ?? colors.textTertiary}18` }]}>
        <Ionicons name={icon as any} size={20} color={color ?? colors.textSecondary} />
      </View>
      <Text style={[styles.actionLabel, { color: color ?? colors.textPrimary }]}>{label}</Text>
    </Pressable>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable>
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            {/* Handle */}
            <View style={[styles.modalHandle, { backgroundColor: colors.containerLight }]} />

            {isOwnPost ? (
              <>
                <ActionRow icon="create-outline" label="Editar post" onPress={onEdit} />
                <ActionRow icon="trash-outline" label="Excluir post" color={colors.error} onPress={onDelete} />
              </>
            ) : (
              <ActionRow icon="flag-outline" label="Denunciar post" color={colors.error} onPress={onReport} />
            )}

            <Pressable onPress={onClose} style={[styles.cancelBtn, { backgroundColor: colors.container }]}>
              <Text style={[styles.cancelText, { color: colors.textTertiary }]}>Cancelar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function PostCard({
  post,
  onLike,
  onSave,
  onMenuPress,
  onPress,
}: {
  post: Post;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onMenuPress: (post: Post) => void;
  onPress: (post: Post) => void;
}) {
  const { colors } = useTheme();
  const isOwn = post.user.id === CURRENT_USER_ID;

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
        <Avatar user={post.user} size={42} />
        <View style={styles.postUserInfo}>
          <Text style={[styles.postUserName, { color: colors.textPrimary }]}>{post.user.name}</Text>
          <Text style={[styles.postMeta, { color: colors.textMuted }]}>
            {post.user.username} · {post.createdAt}
          </Text>
          <Text style={[styles.postInstitution, { color: colors.textTertiary }]}>
            {post.user.institution}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onMenuPress(post);
          }}
          hitSlop={10}
          style={styles.menuBtn}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textMuted} />
        </Pressable>
      </View>

      {/* Content */}
      <Text style={[styles.postContent, { color: colors.textSecondary }]}>{post.content}</Text>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.borderDark }]} />

      {/* Actions */}
      <View style={styles.actionsRow}>
        <View style={styles.actionsLeft}>
          {/* Like */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onLike(post.id);
            }}
            style={styles.actionBtn}
          >
            <Ionicons
              name={post.liked ? 'heart' : 'heart-outline'}
              size={22}
              color={post.liked ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.actionCount, { color: post.liked ? colors.primary : colors.textMuted }]}>
              {post.likes}
            </Text>
          </Pressable>

          {/* Comment */}
          <Pressable
            style={styles.actionBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onPress(post);
            }}
          >
            <Ionicons name="chatbubble-outline" size={20} color={colors.textMuted} />
            <Text style={[styles.actionCount, { color: colors.textMuted }]}>{post.commentsCount}</Text>
          </Pressable>

          {/* Share */}
          <Pressable style={styles.actionBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <Ionicons name="arrow-redo-outline" size={21} color={colors.textMuted} />
          </Pressable>
        </View>

        {/* Save */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSave(post.id);
          }}
          style={styles.actionBtn}
        >
          <Ionicons
            name={post.saved ? 'bookmark' : 'bookmark-outline'}
            size={21}
            color={post.saved ? colors.primary : colors.textMuted}
          />
        </Pressable>
      </View>

      {/* Likes count */}
      <Text style={[styles.likesText, { color: colors.textSecondary }]}>
        {post.likes} curtida{post.likes !== 1 ? 's' : ''}
        {isOwn && (
          <Text style={{ color: colors.textMuted }}> · seu post</Text>
        )}
      </Text>

      {/* Comment previews */}
      {post.comments.slice(0, 2).map((comment) => (
        <View key={comment.id} style={styles.commentRow}>
          <Text style={[styles.commentText, { color: colors.textSecondary }]}>
            <Text style={[styles.commentAuthor, { color: colors.textPrimary }]}>
              {comment.user.username}{' '}
            </Text>
            {comment.text}
          </Text>
        </View>
      ))}

      {/* See all comments */}
      {post.commentsCount > 2 && (
        <Pressable onPress={() => onPress(post)}>
          <Text style={[styles.seeAll, { color: colors.textMuted }]}>
            Ver todos os {post.commentsCount} comentários
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function FeedScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const handleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const handleSave = (id: string) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p)));
  };

  const handleDelete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Excluir post',
      'Tem certeza que deseja excluir este post?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setPosts((prev) => prev.filter((p) => p.id !== id));
            setSelectedPost(null);
          },
        },
      ]
    );
  };

  const handleReport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedPost(null);
    setTimeout(() => Alert.alert('Denúncia enviada', 'Obrigado por nos ajudar a manter a comunidade segura.'), 200);
  };

  const handlePostPress = (post: Post) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(app)/post/${post.id}` as any);
  };

  const bottomPad = Math.max(insets.bottom, 8) + 16 + 72 + 12;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.borderDark }]}>
        <Text style={[styles.headerLogo, { color: colors.textPrimary }]}>Lumioo</Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            style={styles.headerBtn}
            hitSlop={8}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.textSecondary} />
          </Pressable>
          <Pressable
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            style={styles.headerBtn}
            hitSlop={8}
          >
            <Ionicons name="chatbubbles-outline" size={24} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Feed */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: bottomPad, gap: 12, paddingHorizontal: 16 }}
      >
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={handleLike}
            onSave={handleSave}
            onPress={handlePostPress}
            onMenuPress={(p) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedPost(p);
            }}
          />
        ))}
      </ScrollView>

      {/* Action Modal */}
      {selectedPost && (
        <ActionModal
          visible={!!selectedPost}
          isOwnPost={selectedPost.user.id === CURRENT_USER_ID}
          onClose={() => setSelectedPost(null)}
          onEdit={() => {
            setSelectedPost(null);
            setTimeout(() => Alert.alert('Editar', 'Funcionalidade em breve.'), 200);
          }}
          onDelete={() => handleDelete(selectedPost.id)}
          onReport={handleReport}
        />
      )}
    </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerLogo: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Post card
  postCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postUserInfo: {
    flex: 1,
    marginLeft: 12,
  },
  postUserName: {
    fontSize: 15,
    fontWeight: '700',
  },
  postMeta: {
    fontSize: 12,
    marginTop: 1,
  },
  postInstitution: {
    fontSize: 12,
    marginTop: 1,
  },
  menuBtn: {
    padding: 4,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  // Actions
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  actionsLeft: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    gap: 5,
  },
  actionCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  likesText: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  // Comments
  commentRow: {
    marginBottom: 4,
  },
  commentText: {
    fontSize: 13,
    lineHeight: 19,
  },
  commentAuthor: {
    fontWeight: '600',
    fontSize: 13,
  },
  seeAll: {
    fontSize: 12,
    marginTop: 4,
  },
  // Action Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelBtn: {
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
