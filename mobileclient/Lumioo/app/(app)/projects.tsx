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
  useProjects,
  getCategoryConfig,
  PROJECT_ACCENT,
  type ApiProject,
} from '@/lib/hooks/useProjects';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function lightColor(hex: string): string {
  return PROJECT_ACCENT[hex] ?? '#e2e8f0';
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?';
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProjectCover({
  coverColor,
  areaIcon,
  height = 148,
}: {
  coverColor: string;
  areaIcon: string;
  height?: number;
}) {
  return (
    <View style={{ height, backgroundColor: coverColor, overflow: 'hidden' }}>
      {/* Decorative circles */}
      <View style={styles.coverCircle1} />
      <View style={styles.coverCircle2} />
      <View style={styles.coverCircle3} />
      {/* Icon */}
      <View style={styles.coverIconWrap}>
        <View style={styles.coverIconBg}>
          <Ionicons name={areaIcon as any} size={34} color="rgba(255,255,255,0.88)" />
        </View>
      </View>
    </View>
  );
}

const FILTER_ALL = 'Todos';
const AREAS = [FILTER_ALL, 'Computação', 'Medicina', 'Design', 'Física', 'Biologia', 'Engenharia'];

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

type EnrichedProject = ApiProject & { coverColor: string; areaIcon: string; accent: string };

function ProjectCard({ project, onPress }: { project: EnrichedProject; onPress: () => void }) {
  const { colors } = useTheme();
  const isOpen = project.status === 'OPEN_FOR_APPLICATIONS';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.container, borderColor: colors.border, opacity: pressed ? 0.93 : 1 },
      ]}
    >
      {/* Cover */}
      <ProjectCover coverColor={project.coverColor} areaIcon={project.areaIcon} />

      {/* Body */}
      <View style={styles.cardBody}>
        {/* Badges row */}
        <View style={styles.badgesRow}>
          <View style={[styles.areaBadge, { backgroundColor: `${project.coverColor}40` }]}>
            <Ionicons name={project.areaIcon as any} size={11} color={project.accent} />
            <Text style={[styles.areaBadgeText, { color: project.accent }]}>
              {project.category}
            </Text>
          </View>

          <View
            style={[
              styles.membersBadge,
              {
                backgroundColor: isOpen
                  ? 'rgba(16,185,129,0.12)'
                  : 'rgba(100,116,139,0.15)',
              },
            ]}
          >
            <View
              style={[
                styles.membersDot,
                { backgroundColor: isOpen ? '#10b981' : colors.textMuted },
              ]}
            />
            <Text
              style={[
                styles.membersBadgeText,
                { color: isOpen ? '#10b981' : colors.textMuted },
              ]}
            >
              {isOpen ? 'Aceita membros' : 'Equipe completa'}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {project.title}
        </Text>

        {/* Author (institution = author fullName per API) */}
        <View style={styles.authorRow}>
          <View
            style={{
              width: 20, height: 20, borderRadius: 10,
              backgroundColor: project.coverColor,
              alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 7 }}>
              {getInitials(project.institution)}
            </Text>
          </View>
          <Text style={[styles.authorName, { color: colors.textMuted }]} numberOfLines={1}>
            {project.institution}
          </Text>
        </View>

        {/* Description */}
        <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
          {project.description}
        </Text>

        {/* Footer */}
        <View style={[styles.cardFooter, { borderTopColor: colors.borderDark }]}>
          <View style={styles.membersCount}>
            <Ionicons name="people-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.membersCountText, { color: colors.textMuted }]}>
              {project.members} membro{project.members !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProjectsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState<string>(FILTER_ALL);

  const apiCategory = activeFilter === FILTER_ALL ? 'all' : activeFilter;
  const { data: projects, isLoading, isError, refetch } = useProjects(apiCategory);

  const enriched: EnrichedProject[] = (projects ?? []).map((p) => {
    const cfg = getCategoryConfig(p.category);
    return {
      ...p,
      coverColor: cfg.color,
      areaIcon: cfg.icon,
      accent: lightColor(cfg.color),
    };
  });

  const bottomPad = Math.max(insets.bottom, 8) + 16 + 72 + 12;

  const handlePress = (project: ApiProject) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(app)/project/${project.id}` as any);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.borderDark }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Projetos</Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>
            {projects?.length ?? 0} projetos na plataforma
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

      {/* Filters */}
      <View style={[styles.filtersWrapper, { borderBottomColor: colors.borderDark }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {AREAS.map((area) => (
            <FilterChip
              key={area}
              label={area}
              active={activeFilter === area}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveFilter(area);
              }}
            />
          ))}
        </ScrollView>
      </View>

      {/* Project list */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          { paddingBottom: bottomPad },
        ]}
      >
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : isError ? (
          <View style={styles.centered}>
            <Ionicons name="cloud-offline-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.errorText, { color: colors.textMuted }]}>
              Erro ao carregar projetos.
            </Text>
            <Pressable
              onPress={() => refetch()}
              style={[styles.retryBtn, { borderColor: colors.primary }]}
            >
              <Text style={[styles.retryText, { color: colors.primary }]}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : enriched.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="folder-open-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Nenhum projeto nesta área ainda.
            </Text>
          </View>
        ) : (
          enriched.map((project) => (
            <ProjectCard key={project.id} project={project} onPress={() => handlePress(project)} />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <View pointerEvents="box-none" style={{ position: 'absolute', right: 20, bottom: Math.max(insets.bottom, 8) + 16 + 72 + 16 }}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/(app)/create-project' as any); }}
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
  filtersWrapper: {
    borderBottomWidth: 1,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    alignItems: 'center',
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
  membersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  membersDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  membersBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  authorName: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  membersCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  membersCountText: {
    fontSize: 12,
  },

  // Cover decorations
  coverCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  coverCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  coverCircle3: {
    position: 'absolute',
    top: 20,
    left: 60,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  coverIconWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverIconBg: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 22,
    padding: 16,
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
