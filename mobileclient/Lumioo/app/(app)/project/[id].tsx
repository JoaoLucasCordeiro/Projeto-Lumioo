import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { User } from '@/constants/feedData';
import { INITIAL_PROJECTS, type Project } from '@/constants/projectsData';
import { useTheme } from '@/contexts/ThemeContext';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function lightenCover(hex: string): string {
  const map: Record<string, string> = {
    '#1e3a8a': '#93c5fd',
    '#7f1d1d': '#fca5a5',
    '#4c1d95': '#c4b5fd',
    '#713f12': '#fcd34d',
    '#14532d': '#6ee7b7',
    '#1e3a5f': '#7dd3fc',
  };
  return map[hex] ?? '#e2e8f0';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ user, size = 40 }: { user: User; size?: number }) {
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

function ProjectCover({ project }: { project: Project }) {
  return (
    <View style={[styles.cover, { backgroundColor: project.coverColor }]}>
      <View style={styles.coverCircle1} />
      <View style={styles.coverCircle2} />
      <View style={styles.coverCircle3} />
      <View style={styles.coverIconWrap}>
        <View style={styles.coverIconBg}>
          <Ionicons name={project.areaIcon as any} size={42} color="rgba(255,255,255,0.88)" />
        </View>
        <Text style={styles.coverTitle}>{project.title}</Text>
        <Text style={styles.coverArea}>{project.area}</Text>
      </View>
    </View>
  );
}

function SectionLabel({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{label.toUpperCase()}</Text>
  );
}

function MemberCard({ member }: { member: { user: User; role: string } }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.memberCard, { backgroundColor: colors.container, borderColor: colors.border }]}>
      <Avatar user={member.user} size={40} />
      <View style={styles.memberInfo}>
        <Text style={[styles.memberName, { color: colors.textPrimary }]}>{member.user.name}</Text>
        <Text style={[styles.memberRole, { color: colors.textMuted }]}>{member.role}</Text>
        <Text style={[styles.memberInstitution, { color: colors.textTertiary }]} numberOfLines={1}>
          {member.user.institution}
        </Text>
      </View>
    </View>
  );
}

// ─── Chat Modal ───────────────────────────────────────────────────────────────

function ChatModal({
  visible,
  author,
  onClose,
}: {
  visible: boolean;
  author: User;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSent(true);
  };

  const handleClose = () => {
    setMessage('');
    setSent(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.chatBackdrop} onPress={handleClose}>
          <Pressable activeOpacity={1}>
            <View
              style={[
                styles.chatSheet,
                { backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom, 16) + 16 },
              ]}
            >
              {/* Handle */}
              <View style={[styles.sheetHandle, { backgroundColor: colors.containerLight }]} />

              {/* Header */}
              <View style={styles.chatHeader}>
                <Avatar user={author} size={44} />
                <View style={styles.chatHeaderInfo}>
                  <Text style={[styles.chatHeaderName, { color: colors.textPrimary }]}>
                    {author.name}
                  </Text>
                  <Text style={[styles.chatHeaderSub, { color: colors.textMuted }]}>
                    {author.username} · {author.institution}
                  </Text>
                </View>
              </View>

              <View style={[styles.chatDivider, { backgroundColor: colors.borderDark }]} />

              {sent ? (
                /* Success state */
                <View style={styles.sentState}>
                  <View style={[styles.sentIcon, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                    <Ionicons name="checkmark-circle" size={40} color="#10b981" />
                  </View>
                  <Text style={[styles.sentTitle, { color: colors.textPrimary }]}>
                    Mensagem enviada!
                  </Text>
                  <Text style={[styles.sentSub, { color: colors.textMuted }]}>
                    {author.name} receberá sua mensagem e poderá responder em breve.
                  </Text>
                  <Pressable
                    onPress={handleClose}
                    style={[styles.sentBtn, { backgroundColor: colors.container, borderColor: colors.border }]}
                  >
                    <Text style={[styles.sentBtnText, { color: colors.textSecondary }]}>Fechar</Text>
                  </Pressable>
                </View>
              ) : (
                /* Compose state */
                <>
                  <Text style={[styles.chatPrompt, { color: colors.textSecondary }]}>
                    Escreva sua mensagem para {author.name.split(' ')[0]}:
                  </Text>
                  <View
                    style={[
                      styles.chatInputWrapper,
                      {
                        backgroundColor: colors.container,
                        borderColor: message.length > 0 ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <TextInput
                      style={[styles.chatInput, { color: colors.textPrimary }]}
                      placeholder="Olá! Vi seu projeto e gostaria de..."
                      placeholderTextColor={colors.textMuted}
                      value={message}
                      onChangeText={setMessage}
                      multiline
                      maxLength={500}
                      autoFocus
                    />
                  </View>
                  <Text style={[styles.chatCharCount, { color: colors.textMuted }]}>
                    {message.length}/500
                  </Text>
                  <Pressable
                    onPress={handleSend}
                    style={({ pressed }) => [
                      styles.chatSendBtn,
                      {
                        backgroundColor: message.trim().length > 0 ? colors.primary : colors.containerLight,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                    disabled={message.trim().length === 0}
                  >
                    <Ionicons name="send" size={18} color={message.trim().length > 0 ? '#fff' : colors.textMuted} />
                    <Text
                      style={[
                        styles.chatSendText,
                        { color: message.trim().length > 0 ? '#fff' : colors.textMuted },
                      ]}
                    >
                      Enviar mensagem
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const project = INITIAL_PROJECTS.find((p) => p.id === id);
  const [chatVisible, setChatVisible] = useState(false);
  const [saved, setSaved] = useState(false);

  const navBarHeight = Math.max(insets.bottom, 8) + 16 + 72;
  const ctaBarHeight = 72;

  if (!project) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.borderDark }]}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>
        <View style={styles.notFound}>
          <Text style={[{ color: colors.textMuted, fontSize: 15 }]}>Projeto não encontrado.</Text>
        </View>
      </View>
    );
  }

  const accentColor = lightenCover(project.coverColor);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* ── Overlay header (over cover) ── */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]} pointerEvents="box-none">
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={[styles.overlayBtn, { backgroundColor: 'rgba(15,23,42,0.65)' }]}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <View style={styles.headerRight}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSaved((v) => !v);
            }}
            hitSlop={10}
            style={[styles.overlayBtn, { backgroundColor: 'rgba(15,23,42,0.65)' }]}
          >
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={saved ? colors.primary : '#fff'}
            />
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert('Compartilhar', 'Funcionalidade em breve.');
            }}
            hitSlop={10}
            style={[styles.overlayBtn, { backgroundColor: 'rgba(15,23,42,0.65)' }]}
          >
            <Ionicons name="share-outline" size={20} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: navBarHeight + ctaBarHeight + 24 }}
      >
        {/* Cover */}
        <ProjectCover project={project} />

        {/* Main info */}
        <View style={styles.mainSection}>
          {/* Status badge */}
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: project.acceptingMembers
                    ? 'rgba(16,185,129,0.12)'
                    : 'rgba(100,116,139,0.12)',
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: project.acceptingMembers ? '#10b981' : colors.textMuted },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: project.acceptingMembers ? '#10b981' : colors.textMuted },
                ]}
              >
                {project.acceptingMembers
                  ? `Aceita membros · ${project.openRoles.length} vaga${project.openRoles.length !== 1 ? 's' : ''}`
                  : 'Equipe completa'}
              </Text>
            </View>
            <Text style={[styles.createdAt, { color: colors.textMuted }]}>{project.createdAt}</Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>{project.title}</Text>

          {/* Area badge */}
          <View style={[styles.areaBadge, { backgroundColor: `${project.coverColor}35` }]}>
            <Ionicons name={project.areaIcon as any} size={12} color={accentColor} />
            <Text style={[styles.areaBadgeText, { color: accentColor }]}>{project.area}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderDark }]} />

        {/* Author */}
        <View style={styles.section}>
          <SectionLabel label="Líder" />
          <View style={[styles.authorCard, { backgroundColor: colors.container, borderColor: colors.border }]}>
            <Avatar user={project.author} size={48} />
            <View style={styles.authorInfo}>
              <Text style={[styles.authorName, { color: colors.textPrimary }]}>{project.author.name}</Text>
              <Text style={[styles.authorUsername, { color: colors.textMuted }]}>{project.author.username}</Text>
              <Text style={[styles.authorInstitution, { color: colors.textTertiary }]} numberOfLines={1}>
                {project.author.institution}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setChatVisible(true);
              }}
              style={[styles.msgBtn, { backgroundColor: `${colors.primary}18`, borderColor: `${colors.primary}40` }]}
            >
              <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
              <Text style={[styles.msgBtnText, { color: colors.primary }]}>Falar</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderDark }]} />

        {/* Description */}
        <View style={styles.section}>
          <SectionLabel label="Sobre o projeto" />
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {project.fullDescription}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderDark }]} />

        {/* Open roles (if accepting) */}
        {project.acceptingMembers && project.openRoles.length > 0 && (
          <>
            <View style={styles.section}>
              <SectionLabel label="Vagas abertas" />
              <View style={styles.rolesContainer}>
                {project.openRoles.map((role) => (
                  <View key={role} style={[styles.roleChip, { backgroundColor: colors.container, borderColor: colors.border }]}>
                    <Ionicons name="add-circle-outline" size={14} color={colors.primary} />
                    <Text style={[styles.roleText, { color: colors.textSecondary }]}>{role}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.borderDark }]} />
          </>
        )}

        {/* Members */}
        <View style={styles.section}>
          <SectionLabel label={`Equipe · ${project.members.length} membro${project.members.length !== 1 ? 's' : ''}`} />
          <View style={styles.membersContainer}>
            {project.members.map((member) => (
              <MemberCard key={member.user.id} member={member} />
            ))}
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderDark }]} />

        {/* Tags */}
        <View style={styles.section}>
          <SectionLabel label="Tecnologias & temas" />
          <View style={styles.tagsWrap}>
            {project.tags.map((tag) => (
              <View key={tag} style={[styles.tagChip, { backgroundColor: colors.container, borderColor: colors.border }]}>
                <Text style={[styles.tagText, { color: colors.textTertiary }]}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Links */}
        {project.links.length > 0 && (
          <>
            <View style={[styles.divider, { backgroundColor: colors.borderDark }]} />
            <View style={styles.section}>
              <SectionLabel label="Links" />
              <View style={styles.linksContainer}>
                {project.links.map((link) => (
                  <Pressable
                    key={link.label}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Alert.alert(link.label, 'Abrir no navegador em breve.');
                    }}
                    style={({ pressed }) => [
                      styles.linkRow,
                      {
                        backgroundColor: colors.container,
                        borderColor: colors.border,
                        opacity: pressed ? 0.75 : 1,
                      },
                    ]}
                  >
                    <Ionicons name="link-outline" size={16} color={colors.primary} />
                    <Text style={[styles.linkText, { color: colors.primary }]}>{link.label}</Text>
                    <View style={{ flex: 1 }} />
                    <Ionicons name="open-outline" size={14} color={colors.textMuted} />
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* ── CTA Bottom Bar ── */}
      <View
        style={[
          styles.ctaBar,
          {
            bottom: navBarHeight,
            backgroundColor: colors.background,
            borderTopColor: colors.borderDark,
          },
        ]}
      >
        {project.acceptingMembers ? (
          <View style={styles.ctaRow}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setChatVisible(true);
              }}
              style={({ pressed }) => [
                styles.ctaBtnSecondary,
                { borderColor: colors.primary, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <View style={styles.btnInner}>
                <Ionicons name="chatbubble-outline" size={17} color={colors.primary} />
                <Text style={[styles.ctaBtnSecondaryText, { color: colors.primary }]}>Falar com líder</Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(
                  'Solicitação enviada!',
                  `Sua solicitação para participar do ${project.title} foi enviada para ${project.author.name}.`,
                  [{ text: 'Ok' }]
                );
              }}
              style={({ pressed }) => [
                styles.ctaBtnPrimary,
                { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <View style={styles.btnInner}>
                <Ionicons name="person-add-outline" size={17} color="#fff" />
                <Text style={styles.ctaBtnPrimaryText}>Solicitar participação</Text>
              </View>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setChatVisible(true);
            }}
            style={({ pressed }) => [
              styles.ctaBtnFull,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <View style={styles.btnInner}>
              <Ionicons name="chatbubble-outline" size={17} color="#fff" />
              <Text style={styles.ctaBtnPrimaryText}>Falar com o líder</Text>
            </View>
          </Pressable>
        )}
      </View>

      {/* Chat modal */}
      <ChatModal
        visible={chatVisible}
        author={project.author}
        onClose={() => setChatVisible(false)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },

  // Header (overlay)
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  overlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Cover
  cover: {
    height: 220,
    overflow: 'hidden',
  },
  coverCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  coverCircle2: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  coverCircle3: {
    position: 'absolute',
    top: 30,
    left: 80,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  coverIconWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingTop: 32,
  },
  coverIconBg: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    padding: 18,
  },
  coverTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  coverArea: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    fontWeight: '500',
  },

  // Main section
  mainSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  createdAt: {
    fontSize: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  areaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  areaBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Divider
  divider: {
    height: 1,
    marginHorizontal: 0,
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 12,
  },

  // Author card
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
  },
  authorUsername: {
    fontSize: 12,
    marginTop: 1,
  },
  authorInstitution: {
    fontSize: 12,
    marginTop: 1,
  },
  msgBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  msgBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Description
  description: {
    fontSize: 15,
    lineHeight: 24,
  },

  // Open roles
  rolesContainer: {
    gap: 8,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Members
  membersContainer: {
    gap: 10,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
  },
  memberRole: {
    fontSize: 12,
    marginTop: 1,
  },
  memberInstitution: {
    fontSize: 11,
    marginTop: 1,
  },

  // Tags
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Links
  linksContainer: {
    gap: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // CTA bar
  ctaBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  ctaBtnSecondary: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
  },
  ctaBtnSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  ctaBtnPrimary: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  ctaBtnPrimaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  ctaBtnFull: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },

  // Chat modal
  chatBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  chatSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '700',
  },
  chatHeaderSub: {
    fontSize: 12,
    marginTop: 2,
  },
  chatDivider: {
    height: 1,
    marginBottom: 16,
  },
  chatPrompt: {
    fontSize: 14,
    marginBottom: 10,
  },
  chatInputWrapper: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    minHeight: 110,
  },
  chatInput: {
    fontSize: 15,
    lineHeight: 22,
    padding: 0,
  },
  chatCharCount: {
    fontSize: 11,
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 14,
  },
  chatSendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  chatSendText: {
    fontSize: 15,
    fontWeight: '700',
  },

  // Sent state
  sentState: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 10,
  },
  sentIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  sentTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sentSub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  sentBtn: {
    marginTop: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  sentBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Not found
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
