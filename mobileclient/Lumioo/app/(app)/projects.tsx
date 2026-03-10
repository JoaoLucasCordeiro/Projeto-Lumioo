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
  INITIAL_PROJECTS,
  AREA_CONFIG,
  type Project,
  type ProjectArea,
} from '@/constants/projectsData';
import type { User } from '@/constants/feedData';

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ user, size = 32 }: { user: User; size?: number }) {
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

function ProjectCover({ project, height = 148 }: { project: Project; height?: number }) {
  return (
    <View style={{ height, backgroundColor: project.coverColor, overflow: 'hidden' }}>
      {/* Decorative circles */}
      <View style={styles.coverCircle1} />
      <View style={styles.coverCircle2} />
      <View style={styles.coverCircle3} />
      {/* Icon */}
      <View style={styles.coverIconWrap}>
        <View style={styles.coverIconBg}>
          <Ionicons name={project.areaIcon as any} size={34} color="rgba(255,255,255,0.88)" />
        </View>
      </View>
    </View>
  );
}

const FILTER_ALL = 'Todos';
const AREAS: (typeof FILTER_ALL | ProjectArea)[] = [
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

function ProjectCard({ project, onPress }: { project: Project; onPress: () => void }) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.container, borderColor: colors.border, opacity: pressed ? 0.93 : 1 },
      ]}
    >
      {/* Cover */}
      <ProjectCover project={project} />

      {/* Body */}
      <View style={styles.cardBody}>
        {/* Badges row */}
        <View style={styles.badgesRow}>
          <View style={[styles.areaBadge, { backgroundColor: `${project.coverColor}40` }]}>
            <Ionicons name={project.areaIcon as any} size={11} color={project.coverColor === '#1e3a8a' ? '#93c5fd' : lightenCover(project.coverColor)} />
            <Text style={[styles.areaBadgeText, { color: lightenCover(project.coverColor) }]}>
              {project.area}
            </Text>
          </View>

          <View
            style={[
              styles.membersBadge,
              {
                backgroundColor: project.acceptingMembers
                  ? 'rgba(16,185,129,0.12)'
                  : 'rgba(100,116,139,0.15)',
              },
            ]}
          >
            <View
              style={[
                styles.membersDot,
                { backgroundColor: project.acceptingMembers ? '#10b981' : colors.textMuted },
              ]}
            />
            <Text
              style={[
                styles.membersBadgeText,
                { color: project.acceptingMembers ? '#10b981' : colors.textMuted },
              ]}
            >
              {project.acceptingMembers ? 'Aceita membros' : 'Equipe completa'}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {project.title}
        </Text>

        {/* Author */}
        <View style={styles.authorRow}>
          <Avatar user={project.author} size={20} />
          <Text style={[styles.authorName, { color: colors.textMuted }]}>
            {project.author.name}
          </Text>
          <Text style={[styles.authorSep, { color: colors.borderDark }]}>·</Text>
          <Text style={[styles.authorInstitution, { color: colors.textMuted }]} numberOfLines={1}>
            {project.author.institution}
          </Text>
        </View>

        {/* Description */}
        <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
          {project.shortDescription}
        </Text>

        {/* Footer */}
        <View style={[styles.cardFooter, { borderTopColor: colors.borderDark }]}>
          <View style={styles.membersCount}>
            <Ionicons name="people-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.membersCountText, { color: colors.textMuted }]}>
              {project.members.length} membro{project.members.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.tagsRow}>
            {project.tags.slice(0, 2).map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: colors.containerLight }]}>
                <Text style={[styles.tagText, { color: colors.textTertiary }]}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// Lightens a hex color for text contrast on dark badge backgrounds
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

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProjectsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState<typeof FILTER_ALL | ProjectArea>(FILTER_ALL);

  const filtered = useMemo(
    () =>
      activeFilter === FILTER_ALL
        ? INITIAL_PROJECTS
        : INITIAL_PROJECTS.filter((p) => p.area === activeFilter),
    [activeFilter]
  );

  const bottomPad = Math.max(insets.bottom, 8) + 16 + 72 + 12;

  const handlePress = (project: Project) => {
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
            {INITIAL_PROJECTS.length} projetos na plataforma
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
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="folder-open-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Nenhum projeto nesta área ainda.
            </Text>
          </View>
        ) : (
          filtered.map((project) => (
            <ProjectCard key={project.id} project={project} onPress={() => handlePress(project)} />
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
  },
  authorSep: {
    fontSize: 12,
  },
  authorInstitution: {
    fontSize: 12,
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
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
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
