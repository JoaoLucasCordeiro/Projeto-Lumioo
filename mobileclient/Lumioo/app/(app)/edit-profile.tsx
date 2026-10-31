import React, { useEffect, useState } from 'react';
import {
  View, Text, Pressable, TextInput, Image, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform, Alert, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/Avatar';
import { ConfirmModal } from '@/components/modals';
import { fetchOwnProfile, updateProfile } from '@/lib/social';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;
const BIO_LIMIT = 200; // mesmo limite da web

type ImageState = { value: string | null; changed: boolean };

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<ImageState>({ value: null, changed: false });
  const [cover, setCover] = useState<ImageState>({ value: null, changed: false });
  const [original, setOriginal] = useState({ fullName: '', username: '', bio: '' });

  useEffect(() => {
    (async () => {
      try {
        const p = await fetchOwnProfile();
        setFullName(p.fullName);
        setUsername(p.username);
        setBio(p.bio ?? '');
        setAvatar({ value: p.avatar, changed: false });
        setCover({ value: p.coverPhoto, changed: false });
        setOriginal({ fullName: p.fullName, username: p.username, bio: p.bio ?? '' });
      } catch {
        setErrorMsg('Não foi possível carregar seu perfil.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const usernameValid = USERNAME_RE.test(username.trim());
  const dirty =
    fullName.trim() !== original.fullName ||
    username.trim() !== original.username ||
    bio.trim() !== original.bio ||
    avatar.changed || cover.changed;
  const canSave =
    dirty && fullName.trim().length > 0 && usernameValid && !saving && !loading;

  const pickImage = async (kind: 'avatar' | 'cover') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: kind === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      const value = `data:image/jpeg;base64,${result.assets[0].base64}`;
      (kind === 'avatar' ? setAvatar : setCover)({ value, changed: true });
    }
  };

  const handleSave = async () => {
    if (!canSave) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    try {
      // Só envia o que mudou; imagens vão como data URI (ou null para remover)
      const updated = await updateProfile({
        ...(fullName.trim() !== original.fullName ? { fullName: fullName.trim() } : {}),
        ...(username.trim() !== original.username ? { username: username.trim() } : {}),
        ...(bio.trim() !== original.bio ? { bio: bio.trim() } : {}),
        ...(avatar.changed ? { avatar: avatar.value } : {}),
        ...(cover.changed ? { coverPhoto: cover.value } : {}),
      });
      await updateUser({
        fullName: updated.fullName,
        username: updated.username,
        bio: updated.bio,
        avatar: updated.avatar,
        coverPhoto: updated.coverPhoto,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err: any) {
      setErrorMsg(
        err?.response?.status === 409
          ? 'Este nome de usuário já está em uso.'
          : err?.response?.data?.error ?? 'Não foi possível salvar. Tente novamente.',
      );
    } finally {
      setSaving(false);
    }
  };

  const border = colors.borderDark;
  const inputStyle = [s.input, { color: colors.textPrimary, borderColor: border, backgroundColor: colors.container }];

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <View style={[s.header, { paddingTop: insets.top + 10, borderBottomColor: border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={[s.closeBtn, { backgroundColor: colors.containerLight }]}>
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </Pressable>
        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>Editar perfil</Text>
        <Pressable
          onPress={handleSave}
          disabled={!canSave}
          style={[s.saveBtn, { backgroundColor: canSave ? colors.primary : `${colors.primary}50` }]}
        >
          {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.saveBtnText}>Salvar</Text>}
        </Pressable>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
          >
            {/* Capa */}
            <Pressable onPress={() => pickImage('cover')}>
              {cover.value
                ? <Image source={{ uri: cover.value }} style={s.cover} resizeMode="cover" />
                : <View style={[s.cover, { backgroundColor: colors.containerLight }]} />}
              <View style={s.coverBadge}>
                <Ionicons name="camera-outline" size={16} color="#fff" />
                <Text style={s.badgeText}>Alterar capa</Text>
              </View>
            </Pressable>
            {!!cover.value && (
              <Pressable onPress={() => setCover({ value: null, changed: true })} style={s.removeLink}>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>Remover capa</Text>
              </Pressable>
            )}

            {/* Avatar */}
            <View style={s.avatarRow}>
              <Pressable onPress={() => pickImage('avatar')} style={[s.avatarRing, { borderColor: colors.background, backgroundColor: colors.background }]}>
                <Avatar userImage={avatar.value} username={username || 'user'} size={88} />
                <View style={[s.avatarBadge, { backgroundColor: colors.primary }]}>
                  <Ionicons name="camera" size={14} color="#fff" />
                </View>
              </Pressable>
              {!!avatar.value && (
                <Pressable onPress={() => setAvatar({ value: null, changed: true })} style={{ marginLeft: 12, marginBottom: 8 }}>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>Remover foto</Text>
                </Pressable>
              )}
            </View>

            <View style={s.form}>
              <Text style={[s.label, { color: colors.textMuted }]}>NOME COMPLETO</Text>
              <TextInput
                style={inputStyle}
                value={fullName}
                onChangeText={setFullName}
                maxLength={100}
                autoCapitalize="words"
                placeholder="Seu nome"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[s.label, { color: colors.textMuted }]}>NOME DE USUÁRIO</Text>
              <TextInput
                style={[inputStyle, !usernameValid && username.length > 0 && { borderColor: colors.error }]}
                value={username}
                onChangeText={setUsername}
                maxLength={30}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="usuario_123"
                placeholderTextColor={colors.textMuted}
              />
              {!usernameValid && username.length > 0 && (
                <Text style={[s.hint, { color: colors.error }]}>
                  3 a 30 caracteres: letras, números e _.
                </Text>
              )}

              <Text style={[s.label, { color: colors.textMuted }]}>BIOGRAFIA</Text>
              <TextInput
                style={[inputStyle, s.bio]}
                value={bio}
                onChangeText={setBio}
                maxLength={BIO_LIMIT}
                multiline
                textAlignVertical="top"
                placeholder="Fale um pouco sobre você e sua pesquisa"
                placeholderTextColor={colors.textMuted}
                scrollEnabled={false}
              />
              <Text style={[s.hint, { color: colors.textMuted, textAlign: 'right' }]}>{bio.length}/{BIO_LIMIT}</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      <ConfirmModal
        visible={!!errorMsg}
        title="Erro"
        message={errorMsg}
        confirmLabel="OK"
        onConfirm={() => setErrorMsg('')}
        onClose={() => setErrorMsg('')}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1,
  },
  closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  saveBtn: { paddingHorizontal: 18, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', minWidth: 80 },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  cover: { width: '100%', height: 150 },
  coverBadge: {
    position: 'absolute', right: 12, bottom: 12, flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  removeLink: { alignSelf: 'flex-end', paddingHorizontal: 16, paddingTop: 8 },
  avatarRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, marginTop: -44 },
  avatarRing: { borderWidth: 4, borderRadius: 48 },
  avatarBadge: {
    position: 'absolute', right: 0, bottom: 0, width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  form: { paddingHorizontal: 16, marginTop: 8 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginTop: 20, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  bio: { minHeight: 100 },
  hint: { fontSize: 12, marginTop: 6 },
});
