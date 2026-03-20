import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';
import {
  INITIAL_WORKS,
  TYPE_CONFIG,
  AREA_CONFIG,
  COVER_ACCENT,
  type Work,
  type WorkType,
  type WorkArea,
} from '@/constants/worksData';
import type { User } from '@/constants/feedData';

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ user, size = 22 }: { user: User; size?: number }) {
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: user.avatarColor,
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.36 }}>
        {user.initials}
      </Text>
    </View>
  );
}

function WorkCover({ work, height = 120 }: { work: Work; height?: number }) {
  const typeConfig = TYPE_CONFIG[work.type];
  return (
    <View style={{ height, backgroundColor: work.coverColor, overflow: 'hidden' }}>
      <View style={styles.coverCircle1} />
      <View style={styles.coverCircle2} />
      <View style={styles.coverCircle3} />
      <View style={styles.coverContent}>
        <View style={styles.coverIconBg}>
          <Ionicons name={typeConfig.icon as any} size={28} color="rgba(255,255,255,0.88)" />
        </View>
        <View style={[styles.typePill, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
          <Text style={styles.typePillText}>{work.type}</Text>
        </View>
      </View>
    </View>
  );
}

const FILTER_ALL = 'Todos';
const TYPES: (typeof FILTER_ALL | WorkType)[] = [FILTER_ALL, 'TCC', 'Artigo', 'Tese', 'Dissertação'];
const AREAS: (typeof FILTER_ALL | WorkArea)[] = [
  FILTER_ALL, 'Computação', 'Medicina', 'Design', 'Física', 'Biologia', 'Engenharia',
];

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.primary : colors.container,
          borderColor: active ? colors.primary : colors.border,
        },
      ]}
    >
      <Text style={[styles.chipText, { color: active ? '#fff' : colors.textSecondary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function WorkCard({ work, onPress }: { work: Work; onPress: () => void }) {
  const { colors } = useTheme();
  const accent = COVER_ACCENT[work.coverColor] ?? '#e2e8f0';
  const areaConfig = AREA_CONFIG[work.area];
  const typeConfig = TYPE_CONFIG[work.type];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.container, borderColor: colors.border, opacity: pressed ? 0.93 : 1 },
      ]}
    >
      {/* Cover */}
      <WorkCover work={work} />

      {/* Body */}
      <View style={styles.cardBody}>
        {/* Badges */}
        <View style={styles.badgesRow}>
          <View style={[styles.typeBadge, { backgroundColor: `${typeConfig.color}20` }]}>
            <Ionicons name={typeConfig.icon as any} size={11} color={typeConfig.color} />
            <Text style={[styles.typeBadgeText, { color: typeConfig.color }]}>{work.type}</Text>
          </View>
          <View style={[styles.areaBadge, { backgroundColor: `${work.coverColor}40` }]}>
            <Ionicons name={areaConfig.icon as any} size={11} color={accent} />
            <Text style={[styles.areaBadgeText, { color: accent }]}>{work.area}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={2}>
          {work.title}
        </Text>

        {/* Authors */}
        <View style={styles.authorsRow}>
          {work.authors.slice(0, 3).map((author) => (
            <Avatar key={author.id} user={author} size={18} />
          ))}
          <Text style={[styles.authorsText, { color: colors.textMuted }]} numberOfLines={1}>
            {work.authors.map((a) => a.name.split(' ')[0]).join(', ')}
          </Text>
        </View>

        {/* Institution & year */}
        <View style={styles.metaRow}>
          <Ionicons name="business-outline" size={12} color={colors.textMuted} />
          <Text style={[styles.metaText, { color: colors.textMuted }]} numberOfLines={1}>
            {work.institution}
          </Text>
          <Text style={[styles.metaSep, { color: colors.borderDark }]}>·</Text>
          <Text style={[styles.metaYear, { color: colors.textMuted }]}>{work.year}</Text>
        </View>

        {/* Abstract */}
        <Text style={[styles.cardAbstract, { color: colors.textSecondary }]} numberOfLines={2}>
          {work.abstract}
        </Text>

        {/* Footer */}
        <View style={[styles.cardFooter, { borderTopColor: colors.borderDark }]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="download-outline" size={13} color={colors.textMuted} />
              <Text style={[styles.statText, { color: colors.textMuted }]}>
                {formatCount(work.downloadCount)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={13} color={colors.textMuted} />
              <Text style={[styles.statText, { color: colors.textMuted }]}>
                {formatCount(work.viewCount)}
              </Text>
            </View>
          </View>
          <View style={styles.keywordsRow}>
            {work.keywords.slice(0, 2).map((kw) => (
              <View key={kw} style={[styles.kwTag, { backgroundColor: colors.containerLight }]}>
                <Text style={[styles.kwTagText, { color: colors.textTertiary }]}>{kw}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function WorksScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeType, setActiveType] = useState<typeof FILTER_ALL | WorkType>(FILTER_ALL);
  const [activeArea, setActiveArea] = useState<typeof FILTER_ALL | WorkArea>(FILTER_ALL);

  const filtered = useMemo(() => {
    return INITIAL_WORKS.filter((w) => {
      const typeMatch = activeType === FILTER_ALL || w.type === activeType;
      const areaMatch = activeArea === FILTER_ALL || w.area === activeArea;
      return typeMatch && areaMatch;
    });
  }, [activeType, activeArea]);

  const bottomPad = Math.max(insets.bottom, 8) + 16 + 72 + 12;

  const handlePress = (work: Work) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(app)/work/${work.id}` as any);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.borderDark }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Trabalhos</Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>
            {INITIAL_WORKS.length} publicações na plataforma
          </Text>
        </View>
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          hitSlop={8}
          style={styles.headerBtn}
        >
          <Ionicons name="search-outline" size={24} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Filters — Tipo */}
      <View style={[styles.filterGroup, { borderBottomColor: colors.borderDark }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {TYPES.map((type) => (
            <FilterChip
              key={type}
              label={type}
              active={activeType === type}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveType(type as any);
              }}
            />
          ))}
        </ScrollView>

        {/* Filters — Área */}
        <View style={[styles.areaFilterDivider, { backgroundColor: colors.borderDark }]} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {AREAS.map((area) => (
            <FilterChip
              key={area}
              label={area}
              active={activeArea === area}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveArea(area as any);
              }}
            />
          ))}
        </ScrollView>
      </View>

      {/* Results count */}
      {(activeType !== FILTER_ALL || activeArea !== FILTER_ALL) && (
        <View style={[styles.resultsBar, { borderBottomColor: colors.borderDark }]}>
          <Text style={[styles.resultsText, { color: colors.textMuted }]}>
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </Text>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveType(FILTER_ALL);
              setActiveArea(FILTER_ALL);
            }}
            hitSlop={8}
          >
            <Text style={[styles.clearText, { color: colors.primary }]}>Limpar filtros</Text>
          </Pressable>
        </View>
      )}

      {/* List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContainer, { paddingBottom: bottomPad }]}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Nenhum trabalho encontrado.
            </Text>
          </View>
        ) : (
          filtered.map((work) => (
            <WorkCard key={work.id} work={work} onPress={() => handlePress(work)} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 12,
    marginTop: 1,
  },
  headerBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Filters
  filterGroup: {
    borderBottomWidth: 1,
    paddingBottom: 2,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    alignItems: 'center',
  },
  areaFilterDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Results bar
  resultsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  resultsText: {
    fontSize: 12,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // List
  listContainer: {
    padding: 16,
    gap: 16,
  },

  // Card
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardBody: {
    padding: 14,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  areaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  areaBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.2,
    lineHeight: 22,
  },

  // Authors
  authorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 5,
  },
  authorsText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },

  // Meta
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    flex: 1,
  },
  metaSep: {
    fontSize: 12,
  },
  metaYear: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Abstract
  cardAbstract: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },

  // Footer
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
  keywordsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  kwTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  kwTagText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Cover decorations
  coverContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  coverIconBg: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    padding: 12,
  },
  typePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typePillText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  coverCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  coverCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  coverCircle3: {
    position: 'absolute',
    top: 10,
    left: 50,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  // Empty
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
});
