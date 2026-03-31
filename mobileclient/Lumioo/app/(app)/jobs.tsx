import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';
import {
  useWorks,
  WORK_TYPE_CONFIG,
  WORK_TYPE_LABEL,
  WORK_LABEL_TO_API,
  WORKS_COVER_ACCENT,
  type ApiWork,
} from '@/lib/hooks/useWorks';

// ─── Sub-components ───────────────────────────────────────────────────────────

function WorkCover({
  coverColor,
  typeIcon,
  typeLabel,
  height = 120,
}: {
  coverColor: string;
  typeIcon: string;
  typeLabel: string;
  height?: number;
}) {
  return (
    <View style={{ height, backgroundColor: coverColor, overflow: 'hidden' }}>
      <View style={styles.coverCircle1} />
      <View style={styles.coverCircle2} />
      <View style={styles.coverCircle3} />
      <View style={styles.coverContent}>
        <View style={styles.coverIconBg}>
          <Ionicons name={typeIcon as any} size={28} color="rgba(255,255,255,0.88)" />
        </View>
        <View style={[styles.typePill, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
          <Text style={styles.typePillText}>{typeLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const FILTER_ALL = 'Todos';
const TYPE_LABELS = [FILTER_ALL, 'TCC', 'Artigo', 'Tese', 'Dissertação'];
const AREA_LABELS = [FILTER_ALL, 'Computação', 'Medicina', 'Biologia', 'Engenharia', 'Física'];

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

function WorkCard({ work, onPress }: { work: ApiWork; onPress: () => void }) {
  const { colors } = useTheme();
  const typeConfig = WORK_TYPE_CONFIG[work.type];
  const coverColor = typeConfig.coverColor;
  const accent = WORKS_COVER_ACCENT[coverColor] ?? '#e2e8f0';
  const displayType = WORK_TYPE_LABEL[work.type];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.container, borderColor: colors.border, opacity: pressed ? 0.93 : 1 },
      ]}
    >
      {/* Cover */}
      <WorkCover
        coverColor={coverColor}
        typeIcon={typeConfig.icon}
        typeLabel={displayType}
      />

      {/* Body */}
      <View style={styles.cardBody}>
        {/* Badges */}
        <View style={styles.badgesRow}>
          <View style={[styles.typeBadge, { backgroundColor: `${typeConfig.color}20` }]}>
            <Ionicons name={typeConfig.icon as any} size={11} color={typeConfig.color} />
            <Text style={[styles.typeBadgeText, { color: typeConfig.color }]}>{displayType}</Text>
          </View>
          <View style={[styles.areaBadge, { backgroundColor: `${coverColor}40` }]}>
            <Text style={[styles.areaBadgeText, { color: accent }]}>{work.area}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={2}>
          {work.title}
        </Text>

        {/* Author */}
        <View style={styles.authorsRow}>
          <Text style={[styles.authorsText, { color: colors.textMuted }]} numberOfLines={1}>
            {work.author}
          </Text>
        </View>

        {/* Institution & year */}
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
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
                {formatCount(work.downloads)}
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

  const [activeTypeLabel, setActiveTypeLabel] = useState<string>(FILTER_ALL);
  const [activeArea, setActiveArea] = useState<string>(FILTER_ALL);

  const apiType =
    activeTypeLabel === FILTER_ALL ? 'all' : WORK_LABEL_TO_API[activeTypeLabel] ?? 'all';
  const apiArea = activeArea === FILTER_ALL ? 'all' : activeArea;

  const { data: works, isLoading, isError, refetch } = useWorks(apiType, apiArea);

  const bottomPad = Math.max(insets.bottom, 8) + 16 + 72 + 12;

  const handlePress = (work: ApiWork) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(app)/work/${work.id}` as any);
  };

  const hasFilters = activeTypeLabel !== FILTER_ALL || activeArea !== FILTER_ALL;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.borderDark }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Trabalhos</Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>
            {works?.length ?? 0} publicações na plataforma
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
          {TYPE_LABELS.map((label) => (
            <FilterChip
              key={label}
              label={label}
              active={activeTypeLabel === label}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTypeLabel(label);
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
          {AREA_LABELS.map((area) => (
            <FilterChip
              key={area}
              label={area}
              active={activeArea === area}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveArea(area);
              }}
            />
          ))}
        </ScrollView>
      </View>

      {/* Results count */}
      {hasFilters && (
        <View style={[styles.resultsBar, { borderBottomColor: colors.borderDark }]}>
          <Text style={[styles.resultsText, { color: colors.textMuted }]}>
            {works?.length ?? 0} resultado{(works?.length ?? 0) !== 1 ? 's' : ''}
          </Text>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTypeLabel(FILTER_ALL);
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
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : isError ? (
          <View style={styles.centered}>
            <Ionicons name="cloud-offline-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.errorText, { color: colors.textMuted }]}>
              Erro ao carregar trabalhos.
            </Text>
            <Pressable
              onPress={() => refetch()}
              style={[styles.retryBtn, { borderColor: colors.primary }]}
            >
              <Text style={[styles.retryText, { color: colors.primary }]}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : (works ?? []).length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Nenhum trabalho encontrado.
            </Text>
          </View>
        ) : (
          (works ?? []).map((work) => (
            <WorkCard key={work.id} work={work} onPress={() => handlePress(work)} />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <View pointerEvents="box-none" style={{ position: 'absolute', right: 20, bottom: Math.max(insets.bottom, 8) + 16 + 72 + 16 }}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/(app)/create-work' as any); }}
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        >
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 10 }}>
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

  // Centered (loading / error)
  centered: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
  },
  retryBtn: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '600',
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
