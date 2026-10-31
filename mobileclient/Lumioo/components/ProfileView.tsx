import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, Image, Modal, ActivityIndicator, RefreshControl, Alert, StyleSheet,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/Avatar';
import { ActionSheet, ConfirmModal } from '@/components/modals';
import { UserListModal } from '@/components/UserList';
import ProfilePostGrid from '@/components/ProfilePostGrid';
import { createConversation } from '@/lib/chat';
import {
  ACADEMIC_LEVEL_LABEL, blockUser, fetchFollowers, fetchFollowing, fetchOwnProfile,
  fetchProfileByUsername, followUser, unfollowUser,
  type FollowUser, type ProfileData,
} from '@/lib/social';

type Tab = 'posts' | 'saved';
type ListKind = 'followers' | 'following' | null;
type IconName = React.ComponentProps<typeof Ionicons>['name'];

function formatDate(iso?: string, long = false): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', long
    ? { day: '2-digit', month: 'long', year: 'numeric' }
    : { month: 'short', year: 'numeric' });
}

// ─── Capa padrão (gradiente + ícones acadêmicos, como na web) ────────────────

const COVER_ICONS: { name: IconName; top: string; left: string; size: number; rotate: number; opacity: number }[] = [
  { name: 'school-outline', top: '12%', left: '4%', size: 44, rotate: -15, opacity: 0.1 },
  { name: 'book-outline', top: '55%', left: '14%', size: 32, rotate: 10, opacity: 0.08 },
  { name: 'code-slash-outline', top: '18%', left: '36%', size: 50, rotate: 8, opacity: 0.09 },
  { name: 'flask-outline', top: '60%', left: '52%', size: 28, rotate: -20, opacity: 0.08 },
  { name: 'planet-outline', top: '10%', left: '66%', size: 54, rotate: 25, opacity: 0.1 },
  { name: 'bulb-outline', top: '62%', left: '78%', size: 30, rotate: -8, opacity: 0.08 },
  { name: 'rocket-outline', top: '20%', left: '88%', size: 36, rotate: 12, opacity: 0.09 },
];

function DefaultCover() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['#0F172A', '#2b1118', '#0F172A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {COVER_ICONS.map((ic, i) => (
        <View
          key={i}
          style={{
            position: 'absolute', top: ic.top as any, left: ic.left as any,
            opacity: ic.opacity, transform: [{ rotate: `${ic.rotate}deg` }],
          }}
        >
          <Ionicons name={ic.name} size={ic.size} color="#fff" />
        </View>
      ))}
    </View>
  );
}

// ─── Modal "Informações do perfil" ───────────────────────────────────────────

function InfoModal({ profile, isOwn, onClose }: { profile: ProfileData; isOwn: boolean; onClose: () => void }) {
  const { colors } = useTheme();
  const rows = ([
    profile.academicLevel && { icon: 'school-outline', label: 'Nível acadêmico', value: ACADEMIC_LEVEL_LABEL[profile.academicLevel] ?? profile.academicLevel },
    profile.institution && { icon: 'business-outline', label: 'Instituição', value: profile.institution },
    profile.joinDate && { icon: 'person-add-outline', label: 'Membro desde', value: formatDate(profile.joinDate) },
    isOwn && profile.email && { icon: 'mail-outline', label: 'Email', value: profile.email },
    isOwn && profile.birthDate && { icon: 'calendar-outline', label: 'Data de nascimento', value: formatDate(profile.birthDate, true) },
  ].filter(Boolean)) as { icon: IconName; label: string; value: string }[];

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.modalBackdrop} onPress={onClose}>
        <Pressable style={[s.infoCard, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={() => {}}>
          <View style={[s.infoHeader, { borderBottomColor: colors.borderDark }]}>
            <Text style={[s.infoTitle, { color: colors.textPrimary }]}>Informações do perfil</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </Pressable>
          </View>
          <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
            {rows.map((r, i) => (
              <View key={r.label} style={[s.infoRow, i < rows.length - 1 && { borderBottomColor: colors.borderDark, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                <View style={[s.infoIcon, { backgroundColor: colors.container, borderColor: colors.border }]}>
                  <Ionicons name={r.icon} size={16} color={colors.textTertiary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.infoLabel, { color: colors.textMuted }]}>{r.label}</Text>
                  <Text style={[s.infoValue, { color: colors.textPrimary }]} numberOfLines={2}>{r.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/**
 * Perfil próprio (sem `username`) ou de outro usuário (com `username`).
 * `showBack` exibe o botão de voltar (perfil aberto fora da aba).
 */
export default function ProfileView({ username, showBack = false }: { username?: string; showBack?: boolean }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const isOwn = !username || username === user?.username;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<'unavailable' | 'generic' | null>(null);
  const [tab, setTab] = useState<Tab>('posts');
  const [listKind, setListKind] = useState<ListKind>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [blockVisible, setBlockVisible] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [messageBusy, setMessageBusy] = useState(false);

  const profileUserId = isOwn ? user?.id : profile?.id;

  const load = useCallback(async () => {
    try {
      const data = isOwn ? await fetchOwnProfile() : await fetchProfileByUsername(username!);
      setProfile(data);
      setError(null);
    } catch (err: any) {
      // 404 = perfil inexistente ou bloqueado (a API não distingue)
      setError(err?.response?.status === 404 ? 'unavailable' : 'generic');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isOwn, username]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  // Recarrega ao voltar (ex.: depois de editar o perfil ou um post); a montagem já carrega sozinha
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) { firstFocus.current = false; return; }
      load();
    }, [load]),
  );

  const fetchFollowersPage = useCallback((cursor?: string) => fetchFollowers(profileUserId ?? '', cursor), [profileUserId]);
  const fetchFollowingPage = useCallback((cursor?: string) => fetchFollowing(profileUserId ?? '', cursor), [profileUserId]);

  const openUser = (u: FollowUser) => {
    setListKind(null);
    if (u.username === profile?.username) return;
    router.push({ pathname: '/user/[username]', params: { username: u.username } } as any);
  };

  const handleToggleFollow = async () => {
    if (!profile?.id || followBusy) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const wasFollowing = !!profile.isFollowing;
    const apply = (following: boolean) =>
      setProfile(p => p ? { ...p, isFollowing: following, followers: Math.max(0, p.followers + (following ? 1 : -1)) } : p);
    apply(!wasFollowing);
    setFollowBusy(true);
    try {
      await (wasFollowing ? unfollowUser(profile.id) : followUser(profile.id));
    } catch (err: any) {
      // 409 = já seguia: o estado otimista está correto, não desfazer
      if (err?.response?.status !== 409) apply(wasFollowing);
    } finally {
      setFollowBusy(false);
    }
  };

  const handleMessage = async () => {
    if (!profile?.id || messageBusy) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMessageBusy(true);
    try {
      const conv = await createConversation(profile.id);
      router.push({ pathname: '/chat/[id]', params: { id: conv.id } } as any);
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir a conversa. Tente novamente.');
    } finally {
      setMessageBusy(false);
    }
  };

  const handleBlock = async () => {
    if (!profile?.id) return;
    setBlocking(true);
    try {
      await blockUser(profile.id);
      setBlockVisible(false);
      router.back();
    } catch {
      setBlockVisible(false);
    } finally {
      setBlocking(false);
    }
  };

  const navBarHeight = Math.max(insets.bottom, 8) + 16 + 72;

  const backButton = showBack ? (
    <View style={[s.topBar, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
      <Pressable onPress={() => router.back()} hitSlop={10} style={s.roundBtn}>
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </Pressable>
    </View>
  ) : null;

  if (loading) {
    return (
      <View style={[s.root, { backgroundColor: colors.background }]}>
        {backButton}
        <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      </View>
    );
  }

  if (error || !profile) {
    const unavailable = error === 'unavailable';
    return (
      <View style={[s.root, { backgroundColor: colors.background }]}>
        {backButton}
        <View style={s.center}>
          <View style={[s.errorIcon, { backgroundColor: colors.container, borderColor: colors.border }]}>
            <Ionicons name={unavailable ? 'ban-outline' : 'person-outline'} size={26} color={colors.textMuted} />
          </View>
          <Text style={[s.errorTitle, { color: colors.textPrimary }]}>
            {unavailable ? 'Perfil indisponível' : 'Não foi possível carregar'}
          </Text>
          <Text style={[s.errorText, { color: colors.textMuted }]}>
            {unavailable
              ? 'Este perfil não está disponível para você no momento.'
              : 'Verifique sua conexão e tente novamente.'}
          </Text>
          <Pressable
            onPress={() => {
              if (unavailable) router.replace('/(app)/feed' as any);
              else { setLoading(true); load(); }
            }}
            style={[s.pill, s.pillPrimary, { backgroundColor: colors.primary, marginTop: 20 }]}
          >
            <Text style={s.pillPrimaryText}>{unavailable ? 'Voltar ao feed' : 'Tentar novamente'}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const posts = tab === 'posts' ? profile.userPosts : profile.savedPosts;

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: navBarHeight + 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor={colors.primary}
            progressViewOffset={insets.top}
          />
        }
      >
        {/* Capa */}
        <View style={s.cover}>
          {profile.coverPhoto
            ? <Image source={{ uri: profile.coverPhoto }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            : <DefaultCover />}
          <LinearGradient
            colors={['transparent', 'rgba(15,23,42,0.6)']}
            style={s.coverFade}
            pointerEvents="none"
          />
        </View>

        <View style={s.body}>
          {/* Avatar + ações */}
          <View style={s.headRow}>
            <View style={[s.avatarRing, { borderColor: colors.background, backgroundColor: colors.background }]}>
              <Avatar userImage={profile.avatar} username={profile.username} size={88} />
            </View>
            <View style={s.actions}>
              {isOwn ? (
                <Pressable
                  onPress={() => router.push('/edit-profile' as any)}
                  style={[s.pill, s.pillPrimary, { backgroundColor: colors.primary }]}
                >
                  <Ionicons name="create-outline" size={15} color="#fff" />
                  <Text style={s.pillPrimaryText}>Editar perfil</Text>
                </Pressable>
              ) : (
                <>
                  <Pressable
                    onPress={handleToggleFollow}
                    disabled={followBusy}
                    style={[s.pill, s.pillCompact, profile.isFollowing ? { borderWidth: 1, borderColor: colors.border } : { backgroundColor: colors.primary }]}
                  >
                    <Text style={profile.isFollowing ? [s.pillOutlineText, { color: colors.textPrimary }] : s.pillPrimaryText}>
                      {profile.isFollowing ? 'Seguindo' : 'Seguir'}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleMessage}
                    disabled={messageBusy}
                    style={[s.pill, s.pillCompact, { borderWidth: 1, borderColor: colors.border }]}
                  >
                    {messageBusy
                      ? <ActivityIndicator size="small" color={colors.textPrimary} />
                      : <Ionicons name="chatbubble-outline" size={15} color={colors.textPrimary} />}
                    <Text style={[s.pillOutlineText, { color: colors.textPrimary }]}>Mensagem</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setMenuVisible(true)}
                    hitSlop={6}
                    style={[s.moreBtn, { borderColor: colors.border }]}
                  >
                    <Ionicons name="ellipsis-horizontal" size={18} color={colors.textTertiary} />
                  </Pressable>
                </>
              )}
            </View>
          </View>

          {/* Nome + Informações */}
          <Text style={[s.fullName, { color: colors.textPrimary }]}>{profile.fullName}</Text>
          <View style={s.userRow}>
            <Text style={[s.username, { color: colors.textMuted }]}>@{profile.username}</Text>
            <Pressable onPress={() => setInfoOpen(true)} hitSlop={6} style={s.infoBtn}>
              <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
              <Text style={[s.infoBtnText, { color: colors.textMuted }]}>Informações</Text>
            </Pressable>
          </View>

          {!!profile.bio && <Text style={[s.bio, { color: colors.textTertiary }]}>{profile.bio}</Text>}

          {/* Estatísticas */}
          <View style={s.stats}>
            <View style={s.stat}>
              <Text style={[s.statValue, { color: colors.textPrimary }]}>{profile.posts ?? 0}</Text>
              <Text style={[s.statLabel, { color: colors.textMuted }]}>publicações</Text>
            </View>
            <Pressable style={s.stat} onPress={() => profileUserId && setListKind('followers')} hitSlop={6}>
              <Text style={[s.statValue, { color: colors.textPrimary }]}>{profile.followers}</Text>
              <Text style={[s.statLabel, { color: colors.textMuted }]}>seguidores</Text>
            </Pressable>
            <Pressable style={s.stat} onPress={() => profileUserId && setListKind('following')} hitSlop={6}>
              <Text style={[s.statValue, { color: colors.textPrimary }]}>{profile.following}</Text>
              <Text style={[s.statLabel, { color: colors.textMuted }]}>seguindo</Text>
            </Pressable>
          </View>
        </View>

        {/* Controle segmentado (Salvos só no perfil próprio) */}
        <View style={s.segmentWrap}>
          <View style={[s.segment, { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.07)' }]}>
            <Pressable
              onPress={() => setTab('posts')}
              style={[s.segmentBtn, tab === 'posts' && { backgroundColor: colors.primary }]}
            >
              <Ionicons name="grid-outline" size={14} color={tab === 'posts' ? '#fff' : colors.textTertiary} />
              <Text style={[s.segmentText, { color: tab === 'posts' ? '#fff' : colors.textTertiary }]}>Publicações</Text>
            </Pressable>
            {isOwn && (
              <Pressable
                onPress={() => setTab('saved')}
                style={[s.segmentBtn, tab === 'saved' && { backgroundColor: colors.primary }]}
              >
                <Ionicons name="bookmark-outline" size={14} color={tab === 'saved' ? '#fff' : colors.textTertiary} />
                <Text style={[s.segmentText, { color: tab === 'saved' ? '#fff' : colors.textTertiary }]}>Salvos</Text>
              </Pressable>
            )}
          </View>
        </View>

        <ProfilePostGrid
          key={tab}
          posts={posts}
          currentUserId={user?.id}
          emptyMessage={tab === 'posts' ? 'Nenhuma publicação ainda.' : 'Nenhuma publicação salva.'}
          emptyHint={
            tab === 'saved'
              ? 'Quando você salvar publicações, elas aparecerão aqui.'
              : isOwn
                ? 'Quando você compartilhar publicações, elas aparecerão aqui.'
                : 'Este usuário ainda não compartilhou nenhuma publicação.'
          }
          onChanged={load}
        />
      </ScrollView>

      {backButton}

      {infoOpen && <InfoModal profile={profile} isOwn={isOwn} onClose={() => setInfoOpen(false)} />}

      <UserListModal
        visible={listKind === 'followers'}
        title="Seguidores"
        fetchPage={fetchFollowersPage}
        emptyText="Ninguém segue este perfil ainda."
        onClose={() => setListKind(null)}
        onSelectUser={openUser}
      />
      <UserListModal
        visible={listKind === 'following'}
        title="Seguindo"
        fetchPage={fetchFollowingPage}
        emptyText="Este perfil ainda não segue ninguém."
        onClose={() => setListKind(null)}
        onSelectUser={openUser}
      />

      <ActionSheet
        visible={menuVisible}
        title={`@${profile.username}`}
        actions={[{ icon: 'ban-outline', label: `Bloquear @${profile.username}`, destructive: true, onPress: () => setBlockVisible(true) }]}
        onClose={() => setMenuVisible(false)}
      />
      <ConfirmModal
        visible={blockVisible}
        title={`Bloquear @${profile.username}?`}
        message={'Vocês deixarão de se seguir mutuamente. Ele não poderá ver ou interagir com seu perfil. Você pode desfazer isso em Configurações.'}
        confirmLabel="Bloquear"
        destructive
        loading={blocking}
        onConfirm={handleBlock}
        onClose={() => setBlockVisible(false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingHorizontal: 16, paddingBottom: 8 },
  roundBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(15,23,42,0.65)', alignItems: 'center', justifyContent: 'center' },
  cover: { height: 150, overflow: 'hidden', backgroundColor: '#0F172A' },
  coverFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 48 },
  body: { paddingHorizontal: 16 },
  headRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: -44, marginBottom: 12 },
  avatarRing: { borderWidth: 4, borderRadius: 52 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, height: 38, borderRadius: 19, justifyContent: 'center' },
  pillCompact: { paddingHorizontal: 14, height: 36, borderRadius: 18 },
  pillPrimary: { shadowColor: '#ff3131', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  pillPrimaryText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  pillOutlineText: { fontSize: 14, fontWeight: '700' },
  moreBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  fullName: { fontSize: 22, fontWeight: '900', letterSpacing: -0.4 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  username: { fontSize: 14 },
  infoBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  infoBtnText: { fontSize: 12 },
  bio: { fontSize: 14, lineHeight: 21, marginTop: 10 },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 20, paddingVertical: 16 },
  stat: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  statValue: { fontSize: 14, fontWeight: '800' },
  statLabel: { fontSize: 12 },
  segmentWrap: { alignItems: 'center', paddingTop: 4, paddingBottom: 18 },
  segment: { flexDirection: 'row', alignItems: 'center', gap: 2, padding: 4, borderRadius: 24, borderWidth: 1 },
  segmentBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  segmentText: { fontSize: 13, fontWeight: '700' },
  errorIcon: { width: 56, height: 56, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  errorTitle: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
  errorText: { fontSize: 14, lineHeight: 20, textAlign: 'center', maxWidth: 280 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  infoCard: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  infoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14, borderBottomWidth: 1 },
  infoTitle: { fontSize: 15, fontWeight: '700' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  infoIcon: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: 12, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '600' },
});
