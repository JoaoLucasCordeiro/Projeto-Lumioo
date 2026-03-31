import React, { useState } from 'react';
import {
  View, Text, Pressable, TextInput, Image, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ConfirmModal } from '@/components/modals';
import api from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type ProjectStatus = 'IN_PROGRESS' | 'COMPLETED' | 'OPEN_FOR_APPLICATIONS';

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ['Computação', 'Medicina', 'Design', 'Física', 'Biologia', 'Engenharia', 'Outra'];

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'IN_PROGRESS', label: 'Em andamento' },
  { value: 'COMPLETED', label: 'Concluído' },
  { value: 'OPEN_FOR_APPLICATIONS', label: 'Aceita membros' },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CreateProjectScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('IN_PROGRESS');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [image, setImage] = useState<{ uri: string; base64: string } | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Add member inline form
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ── Validation ──────────────────────────────────────────────────────────────

  const canSubmit =
    title.trim().length > 0 &&
    category.length > 0 &&
    description.trim().length > 0 &&
    teamMembers.length >= 1 &&
    (status !== 'OPEN_FOR_APPLICATIONS' ||
      (contactEmail.trim().length > 0 && contactPhone.trim().length > 0)) &&
    !isSubmitting;

  // ── Image picker ────────────────────────────────────────────────────────────

  const pickImage = async () => {
    const { status: permStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permStatus !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.75,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      setImage({
        uri: result.assets[0].uri,
        base64: `data:image/jpeg;base64,${result.assets[0].base64}`,
      });
    }
  };

  // ── Team members ────────────────────────────────────────────────────────────

  const confirmAddMember = () => {
    if (!newMemberName.trim()) return;
    setTeamMembers(prev => [
      ...prev,
      { id: Date.now().toString(), name: newMemberName.trim(), role: newMemberRole.trim() },
    ]);
    setNewMemberName('');
    setNewMemberRole('');
    setShowAddMember(false);
  };

  const removeMember = (id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!canSubmit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);
    try {
      await api.post('/projects', {
        title: title.trim(),
        description: description.trim(),
        category,
        status,
        ...(image ? { image: image.base64 } : {}),
        ...(status === 'OPEN_FOR_APPLICATIONS'
          ? { contactEmail: contactEmail.trim(), contactPhone: contactPhone.trim() }
          : {}),
        teamMembers: teamMembers.map(m => ({ name: m.name, role: m.role, photo: null })),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error ?? 'Erro ao criar projeto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const bg = colors.background;
  const border = colors.borderDark;

  return (
    <View style={[s.root, { backgroundColor: bg }]}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <View style={[s.header, { paddingTop: insets.top + 10, borderBottomColor: border }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={[s.closeBtn, { backgroundColor: colors.containerLight }]}
        >
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </Pressable>

        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>Novo projeto</Text>

        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={[s.publishBtn, { backgroundColor: canSubmit ? colors.primary : `${colors.primary}50` }]}
        >
          {isSubmitting
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={s.publishBtnText}>Publicar</Text>
          }
        </Pressable>
      </View>

      {/* ── Scrollable body ───────────────────────────────────────────────── */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[s.scrollContent, { paddingBottom: Math.max(insets.bottom, 16) + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ── Título ──────────────────────────────────────────────────── */}
          <Section label="Título">
            <TextInput
              style={[s.textInput, { color: colors.textPrimary, borderColor: border, backgroundColor: colors.container }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Nome do projeto"
              placeholderTextColor={colors.textMuted}
              maxLength={200}
              autoFocus
              autoCapitalize="sentences"
            />
          </Section>

          {/* ── Categoria ───────────────────────────────────────────────── */}
          <Section label="Categoria">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
              {CATEGORIES.map(cat => {
                const selected = category === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      s.selectChip,
                      selected
                        ? { backgroundColor: colors.primary, borderColor: colors.primary }
                        : { backgroundColor: colors.container, borderColor: border },
                    ]}
                  >
                    <Text style={[s.selectChipText, { color: selected ? '#fff' : colors.textSecondary }]}>
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Section>

          {/* ── Status ──────────────────────────────────────────────────── */}
          <Section label="Status">
            <View style={s.chipsRow}>
              {STATUS_OPTIONS.map(opt => {
                const selected = status === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setStatus(opt.value)}
                    style={[
                      s.selectChip,
                      selected
                        ? { backgroundColor: colors.primary, borderColor: colors.primary }
                        : { backgroundColor: colors.container, borderColor: border },
                    ]}
                  >
                    <Text style={[s.selectChipText, { color: selected ? '#fff' : colors.textSecondary }]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Section>

          {/* ── Descrição ───────────────────────────────────────────────── */}
          <Section label="Descrição">
            <TextInput
              style={[s.textArea, { color: colors.textPrimary, borderColor: border, backgroundColor: colors.container }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Descreva o projeto..."
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={2000}
              autoCapitalize="sentences"
              textAlignVertical="top"
              scrollEnabled={false}
            />
            <Text style={[s.charCount, { color: colors.textMuted }]}>{description.length}/2000</Text>
          </Section>

          {/* ── Contato (condicional) ────────────────────────────────────── */}
          {status === 'OPEN_FOR_APPLICATIONS' && (
            <Section label="Contato">
              <TextInput
                style={[s.textInput, { color: colors.textPrimary, borderColor: border, backgroundColor: colors.container, marginBottom: 10 }]}
                value={contactEmail}
                onChangeText={setContactEmail}
                placeholder="E-mail de contato"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                style={[s.textInput, { color: colors.textPrimary, borderColor: border, backgroundColor: colors.container }]}
                value={contactPhone}
                onChangeText={setContactPhone}
                placeholder="Telefone de contato"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
              />
            </Section>
          )}

          {/* ── Imagem do projeto ────────────────────────────────────────── */}
          <Section label="Imagem do projeto (opcional)">
            {image ? (
              <View style={s.imageWrapper}>
                <Image source={{ uri: image.uri }} style={s.imagePreview} resizeMode="cover" />
                <Pressable onPress={() => setImage(null)} style={s.imageRemoveBtn}>
                  <Ionicons name="close" size={16} color="#fff" />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={pickImage}
                style={[s.imagePickerBtn, { borderColor: border, backgroundColor: colors.container }]}
              >
                <Ionicons name="image-outline" size={22} color={colors.textMuted} />
                <Text style={[s.imagePickerText, { color: colors.textMuted }]}>Selecionar imagem</Text>
              </Pressable>
            )}
          </Section>

          {/* ── Membros da equipe ────────────────────────────────────────── */}
          <Section label={`Membros da equipe${teamMembers.length > 0 ? ` (${teamMembers.length})` : ''}`}>

            {/* Member list */}
            {teamMembers.map(member => (
              <View
                key={member.id}
                style={[s.memberRow, { backgroundColor: colors.container, borderColor: border }]}
              >
                <View style={[s.memberAvatar, { backgroundColor: `${colors.primary}20` }]}>
                  <Ionicons name="person" size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.memberName, { color: colors.textPrimary }]}>{member.name}</Text>
                  {!!member.role && (
                    <Text style={[s.memberRole, { color: colors.textMuted }]}>{member.role}</Text>
                  )}
                </View>
                <Pressable onPress={() => removeMember(member.id)} hitSlop={10}>
                  <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                </Pressable>
              </View>
            ))}

            {/* Inline add form */}
            {showAddMember ? (
              <View style={[s.addMemberCard, { backgroundColor: colors.container, borderColor: colors.primary }]}>
                <TextInput
                  style={[s.textInput, { color: colors.textPrimary, borderColor: border, backgroundColor: colors.containerLight, marginBottom: 10 }]}
                  value={newMemberName}
                  onChangeText={setNewMemberName}
                  placeholder="Nome do membro"
                  placeholderTextColor={colors.textMuted}
                  autoFocus
                  autoCapitalize="words"
                />
                <TextInput
                  style={[s.textInput, { color: colors.textPrimary, borderColor: border, backgroundColor: colors.containerLight, marginBottom: 12 }]}
                  value={newMemberRole}
                  onChangeText={setNewMemberRole}
                  placeholder="Cargo / função"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={confirmAddMember}
                />
                <View style={s.addMemberActions}>
                  <Pressable
                    onPress={() => { setShowAddMember(false); setNewMemberName(''); setNewMemberRole(''); }}
                    style={[s.addMemberCancelBtn, { backgroundColor: colors.containerLight }]}
                  >
                    <Text style={[s.addMemberCancelText, { color: colors.textSecondary }]}>Cancelar</Text>
                  </Pressable>
                  <Pressable
                    onPress={confirmAddMember}
                    disabled={!newMemberName.trim()}
                    style={[
                      s.addMemberConfirmBtn,
                      { backgroundColor: newMemberName.trim() ? colors.primary : `${colors.primary}40` },
                    ]}
                  >
                    <Text style={s.addMemberConfirmText}>Adicionar</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => {
                  if (user?.fullName && teamMembers.length === 0) {
                    setNewMemberName(user.fullName);
                  }
                  setShowAddMember(true);
                }}
                style={[s.addMemberBtn, { borderColor: border, backgroundColor: colors.container }]}
              >
                <Ionicons name="person-add-outline" size={18} color={colors.primary} />
                <Text style={[s.addMemberBtnText, { color: colors.primary }]}>Adicionar membro</Text>
              </Pressable>
            )}

            {teamMembers.length === 0 && !showAddMember && (
              <Text style={[s.helperText, { color: colors.textMuted }]}>
                Pelo menos 1 membro é obrigatório.
              </Text>
            )}
          </Section>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Error modal ───────────────────────────────────────────────────── */}
      <ConfirmModal
        visible={!!errorMsg}
        title="Erro ao criar projeto"
        message={errorMsg}
        confirmLabel="OK"
        onConfirm={() => setErrorMsg('')}
        onClose={() => setErrorMsg('')}
      />
    </View>
  );
}

// ─── Section helper ──────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={s.section}>
      <Text style={[s.sectionLabel, { color: colors.textMuted }]}>{label.toUpperCase()}</Text>
      {children}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  publishBtn: {
    paddingHorizontal: 18, height: 36,
    borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    minWidth: 90,
  },
  publishBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  // Scroll
  scrollContent: { paddingTop: 8 },

  // Section
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 10,
  },

  // Text inputs
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 6,
  },

  // Chips
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  selectChipText: { fontSize: 13, fontWeight: '600' },

  // Image
  imageWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  imagePreview: { width: '100%', height: 200 },
  imageRemoveBtn: {
    position: 'absolute', top: 10, right: 10,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center', justifyContent: 'center',
  },
  imagePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  imagePickerText: { fontSize: 14, fontWeight: '500' },

  // Team members
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  memberAvatar: {
    width: 36, height: 36,
    borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  memberName: { fontSize: 14, fontWeight: '600' },
  memberRole: { fontSize: 12, marginTop: 2 },

  addMemberCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  addMemberActions: {
    flexDirection: 'row',
    gap: 10,
  },
  addMemberCancelBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMemberCancelText: { fontSize: 13, fontWeight: '600' },
  addMemberConfirmBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMemberConfirmText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addMemberBtnText: { fontSize: 14, fontWeight: '600' },

  helperText: { fontSize: 12, marginTop: 8 },
});
