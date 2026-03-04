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
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';

// ─── Types ───────────────────────────────────────────────────────────────────

interface User {
  id: string;
  name: string;
  username: string;
  initials: string;
  institution: string;
  avatarColor: string;
}

interface Comment {
  id: string;
  user: User;
  text: string;
}

interface Post {
  id: string;
  user: User;
  content: string;
  likes: number;
  liked: boolean;
  saved: boolean;
  commentsCount: number;
  comments: Comment[];
  createdAt: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CURRENT_USER_ID = 'user_1';

const USERS: Record<string, User> = {
  user_1: {
    id: 'user_1', name: 'João Lucas', username: '@joaolucas',
    initials: 'JL', institution: 'USP · Eng. Computação', avatarColor: '#ff3131',
  },
  user_2: {
    id: 'user_2', name: 'Maria Silva', username: '@mariasilva',
    initials: 'MS', institution: 'UNICAMP · Medicina', avatarColor: '#3b82f6',
  },
  user_3: {
    id: 'user_3', name: 'Pedro Costa', username: '@pedrocosta',
    initials: 'PC', institution: 'UFMG · Ciência da Computação', avatarColor: '#10b981',
  },
  user_4: {
    id: 'user_4', name: 'Ana Ferreira', username: '@anaferreira',
    initials: 'AF', institution: 'PUC · Design', avatarColor: '#8b5cf6',
  },
  user_5: {
    id: 'user_5', name: 'Carlos Lima', username: '@carloslima',
    initials: 'CL', institution: 'UFRJ · Física', avatarColor: '#f59e0b',
  },
};

const INITIAL_POSTS: Post[] = [
  {
    id: 'post_1', user: USERS.user_2,
    content: 'Acabei de publicar meu artigo sobre inteligência artificial aplicada ao diagnóstico precoce de câncer! Foram 2 anos de pesquisa intensa. Muito orgulhosa deste resultado! 🎉',
    likes: 87, liked: false, saved: false, commentsCount: 14,
    comments: [
      { id: 'c1', user: USERS.user_3, text: 'Parabéns! Trabalho incrível! Em qual journal vai publicar?' },
      { id: 'c2', user: USERS.user_1, text: 'Sensacional, Maria! Mal posso esperar para ler.' },
    ],
    createdAt: '1h',
  },
  {
    id: 'post_2', user: USERS.user_1,
    content: 'Finalizei meu TCC sobre otimização de algoritmos de ML para dispositivos embarcados. Apresento na próxima semana! Quem tiver dicas, pode mandar 😅',
    likes: 42, liked: true, saved: true, commentsCount: 8,
    comments: [
      { id: 'c3', user: USERS.user_4, text: 'Vai lá! Você consegue! 💪' },
    ],
    createdAt: '3h',
  },
  {
    id: 'post_3', user: USERS.user_3,
    content: 'Procurando colaboradores para um projeto open-source de análise de dados climáticos com Python e React. Se tiver interesse, manda mensagem! Seria incrível ter pessoas de diferentes áreas no time.',
    likes: 23, liked: false, saved: false, commentsCount: 5,
    comments: [
      { id: 'c4', user: USERS.user_5, text: 'Tenho interesse! Mando DM.' },
      { id: 'c5', user: USERS.user_2, text: 'Compartilhei com minha turma, projeto incrível!' },
    ],
    createdAt: '5h',
  },
  {
    id: 'post_4', user: USERS.user_4,
    content: 'Workshop de UX/UI para estudantes universitários neste sábado! Vamos falar sobre design thinking, prototipação e tendências de 2026. Inscrições gratuitas pelo link na bio ✨',
    likes: 156, liked: false, saved: false, commentsCount: 29,
    comments: [
      { id: 'c6', user: USERS.user_1, text: 'Já me inscrevi! Ansioso 🙌' },
    ],
    createdAt: '8h',
  },
  {
    id: 'post_5', user: USERS.user_1,
    content: 'Reflexão do dia: a academia me ensinou que falhar faz parte do processo. Meu primeiro experimento de TCC deu errado, o segundo também... mas no terceiro acertei. Não desistam! 🙏',
    likes: 201, liked: false, saved: false, commentsCount: 33,
    comments: [
      { id: 'c7', user: USERS.user_2, text: 'Que mensagem linda! Preciso ouvir isso hoje.' },
      { id: 'c8', user: USERS.user_3, text: 'Salvando esse post 🔥' },
    ],
    createdAt: '1d',
  },
  {
    id: 'post_6', user: USERS.user_5,
    content: 'Publicamos um paper sobre supercondutividade em temperatura ambiente! Ainda em peer review, mas estamos muito otimistas. A física nunca deixa de surpreender. 🔬⚡',
    likes: 312, liked: false, saved: false, commentsCount: 45,
    comments: [
      { id: 'c9', user: USERS.user_4, text: 'Isso seria revolucionário! Boa sorte no review!' },
    ],
    createdAt: '2d',
  },
];

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
}: {
  post: Post;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onMenuPress: (post: Post) => void;
}) {
  const { colors } = useTheme();
  const isOwn = post.user.id === CURRENT_USER_ID;

  return (
    <View style={[styles.postCard, { backgroundColor: colors.container, borderColor: colors.border }]}>
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
          <Pressable style={styles.actionBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
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
        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
          <Text style={[styles.seeAll, { color: colors.textMuted }]}>
            Ver todos os {post.commentsCount} comentários
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function FeedScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
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
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p))
    );
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
