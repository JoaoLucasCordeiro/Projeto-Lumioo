import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';
import type { User } from '@/constants/feedData';
import {
  INITIAL_WORKS,
  TYPE_CONFIG,
  AREA_CONFIG,
  COVER_ACCENT,
  type Work,
} from '@/constants/worksData';

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

function WorkCover({ work }: { work: Work }) {
  const typeConfig = TYPE_CONFIG[work.type];
  return (
    <View style={[styles.cover, { backgroundColor: work.coverColor }]}>
      <View style={styles.coverCircle1} />
      <View style={styles.coverCircle2} />
      <View style={styles.coverCircle3} />
      <View style={styles.coverIconWrap}>
        <View style={styles.coverIconBg}>
          <Ionicons name={typeConfig.icon as any} size={42} color="rgba(255,255,255,0.88)" />
        </View>
        <Text style={styles.coverTitle} numberOfLines={2}>{work.title}</Text>
        <View style={styles.coverMeta}>
          <View style={[styles.coverPill, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
            <Text style={styles.coverPillText}>{work.type}</Text>
          </View>
          <View style={[styles.coverPill, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
            <Text style={styles.coverPillText}>{work.area}</Text>
          </View>
        </View>
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

function AuthorCard({ user }: { user: User }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.authorCard, { backgroundColor: colors.container, borderColor: colors.border }]}>
      <Avatar user={user} size={44} />
      <View style={styles.authorInfo}>
        <Text style={[styles.authorName, { color: colors.textPrimary }]}>{user.name}</Text>
        <Text style={[styles.authorUsername, { color: colors.textMuted }]}>{user.username}</Text>
        <Text style={[styles.authorInstitution, { color: colors.textTertiary }]} numberOfLines={1}>
          {user.institution}
        </Text>
      </View>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.borderDark }]}>
      <Ionicons name={icon as any} size={16} color={colors.textMuted} style={styles.infoIcon} />
      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.textPrimary }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function WorkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const work = INITIAL_WORKS.find((w) => w.id === id);
  const [saved, setSaved] = useState(false);
  const [downloadCount, setDownloadCount] = useState(work?.downloadCount ?? 0);
  const [downloaded, setDownloaded] = useState(false);

  const navBarHeight = Math.max(insets.bottom, 8) + 16 + 72;
  const ctaBarHeight = 72;

  if (!work) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.borderDark }]}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>
        <View style={styles.notFound}>
          <Text style={{ color: colors.textMuted, fontSize: 15 }}>Trabalho não encontrado.</Text>
        </View>
      </View>
    );
  }

  const accent = COVER_ACCENT[work.coverColor] ?? '#e2e8f0';
  const typeConfig = TYPE_CONFIG[work.type];
  const areaConfig = AREA_CONFIG[work.area];

  const handleDownload = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (!downloaded) {
      setDownloadCount((c) => c + 1);
      setDownloaded(true);
    }
    Alert.alert('Download iniciado', 'O trabalho está sendo baixado para o seu dispositivo.');
  };

  const handleView = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Visualizar', 'Abertura do PDF em breve.');
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Overlay header */}
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

      {/* Scrollable content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: navBarHeight + ctaBarHeight + 24 }}
      >
        {/* Cover */}
        <WorkCover work={work} />

        {/* Stats bar */}
        <View style={[styles.statsBar, { backgroundColor: colors.container, borderBottomColor: colors.borderDark }]}>
          <View style={styles.statItem}>
            <Ionicons name="download-outline" size={16} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {formatCount(downloadCount)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>downloads</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.borderDark }]} />
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={16} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {formatCount(work.viewCount)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>visualizações</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.borderDark }]} />
          <View style={styles.statItem}>
            <Ionicons name="document-outline" size={16} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{work.pages}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>páginas</Text>
          </View>
        </View>

        {/* Main info */}
        <View style={styles.mainSection}>
          {/* Type + area badges */}
          <View style={styles.badgesRow}>
            <View style={[styles.typeBadge, { backgroundColor: `${typeConfig.color}20` }]}>
              <Ionicons name={typeConfig.icon as any} size={12} color={typeConfig.color} />
              <Text style={[styles.typeBadgeText, { color: typeConfig.color }]}>{work.type}</Text>
            </View>
            <View style={[styles.areaBadge, { backgroundColor: `${work.coverColor}35` }]}>
              <Ionicons name={areaConfig.icon as any} size={12} color={accent} />
              <Text style={[styles.areaBadgeText, { color: accent }]}>{work.area}</Text>
            </View>
            <View style={{ flex: 1 }} />
            <Text style={[styles.publishedAt, { color: colors.textMuted }]}>{work.publishedAt}</Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>{work.title}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderDark }]} />

        {/* Autores */}
        <View style={styles.section}>
          <SectionLabel label={`Autor${work.authors.length > 1 ? 'es' : ''} · ${work.authors.length}`} />
          <View style={styles.authorsContainer}>
            {work.authors.map((author) => (
              <AuthorCard key={author.id} user={author} />
            ))}
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderDark }]} />

        {/* Resumo */}
        <View style={styles.section}>
          <SectionLabel label="Resumo" />
          <Text style={[styles.abstract, { color: colors.textSecondary }]}>
            {work.fullAbstract}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderDark }]} />

        {/* Informações */}
        <View style={styles.section}>
          <SectionLabel label="Informações" />
          <View style={[styles.infoCard, { backgroundColor: colors.container, borderColor: colors.border }]}>
            <InfoRow icon="business-outline" label="Instituição" value={work.institution} />
            <InfoRow icon="calendar-outline" label="Ano" value={String(work.year)} />
            <InfoRow icon="document-outline" label="Páginas" value={`${work.pages} páginas`} />
            {work.doi && (
              <InfoRow icon="link-outline" label="DOI" value={work.doi} />
            )}
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Ionicons name="time-outline" size={16} color={colors.textMuted} style={styles.infoIcon} />
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Publicado</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{work.publishedAt}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderDark }]} />

        {/* Palavras-chave */}
        <View style={styles.section}>
          <SectionLabel label="Palavras-chave" />
          <View style={styles.keywordsWrap}>
            {work.keywords.map((kw) => (
              <View key={kw} style={[styles.kwChip, { backgroundColor: colors.container, borderColor: colors.border }]}>
                <Text style={[styles.kwChipText, { color: colors.textSecondary }]}>{kw}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* CTA Bottom Bar */}
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
        <View style={styles.ctaRow}>
          <Pressable
            onPress={handleView}
            style={({ pressed }) => [
              styles.ctaBtnSecondary,
              { borderColor: colors.primary, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <View style={styles.btnInner}>
              <Ionicons name="eye-outline" size={17} color={colors.primary} />
              <Text style={[styles.ctaBtnSecondaryText, { color: colors.primary }]}>Visualizar</Text>
            </View>
          </Pressable>
          <Pressable
            onPress={handleDownload}
            style={({ pressed }) => [
              styles.ctaBtnPrimary,
              {
                backgroundColor: downloaded ? '#10b981' : colors.primary,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <View style={styles.btnInner}>
              <Ionicons
                name={downloaded ? 'checkmark-circle-outline' : 'download-outline'}
                size={17}
                color="#fff"
              />
              <Text style={styles.ctaBtnPrimaryText}>
                {downloaded ? 'Baixado' : `Download · ${formatCount(downloadCount)}`}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
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
    width: 38, height: 38,
    alignItems: 'center', justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  overlayBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },

  // Cover
  cover: {
    height: 230,
    overflow: 'hidden',
  },
  coverCircle1: {
    position: 'absolute', top: -50, right: -50,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  coverCircle2: {
    position: 'absolute', bottom: -40, left: -40,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  coverCircle3: {
    position: 'absolute', top: 30, left: 80,
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  coverIconWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingTop: 32,
    paddingHorizontal: 24,
  },
  coverIconBg: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    padding: 16,
  },
  coverTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
    textAlign: 'center',
    lineHeight: 23,
  },
  coverMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  coverPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  coverPillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Stats bar
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 24,
  },

  // Main section
  mainSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  areaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  areaBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  publishedAt: {
    fontSize: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: 30,
  },

  // Divider
  divider: {
    height: 1,
  },

  // Section
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

  // Authors
  authorsContainer: {
    gap: 10,
  },
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  authorInfo: { flex: 1 },
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

  // Abstract
  abstract: {
    fontSize: 15,
    lineHeight: 25,
  },

  // Info card
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 13,
    width: 90,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },

  // Keywords
  keywordsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  kwChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  kwChipText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // CTA bar
  ctaBar: {
    position: 'absolute',
    left: 0, right: 0,
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
    flex: 1.6,
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

  // Not found
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
