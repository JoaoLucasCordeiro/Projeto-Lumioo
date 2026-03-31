import React, { useState } from 'react';
import {
  View, Text, Pressable, TextInput, Image, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import * as DocumentPicker from 'expo-document-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ConfirmModal } from '@/components/modals';
import api from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type WorkType = 'TCC' | 'Artigo' | 'Tese' | 'Dissertação';

const WORK_TYPE_MAP: Record<WorkType, string> = {
  TCC: 'TCC',
  Artigo: 'ARTICLE',
  Tese: 'THESIS',
  Dissertação: 'DISSERTATION',
};

const WORK_TYPES: WorkType[] = ['TCC', 'Artigo', 'Tese', 'Dissertação'];

interface PdfFile {
  name: string;
  base64: string;
}

// ─── Helper: blob to base64 via FileReader ────────────────────────────────────

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CreateWorkScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  // Form state
  const [title, setTitle] = useState('');
  const [workType, setWorkType] = useState<WorkType | ''>('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [advisor, setAdvisor] = useState('');
  const [institution, setInstitution] = useState(user?.institution ?? '');
  const [department, setDepartment] = useState('');

  // Keywords
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');

  // References
  const [references, setReferences] = useState<string[]>([]);
  const [referenceInput, setReferenceInput] = useState('');

  // Cover image
  const [coverImage, setCoverImage] = useState<{ uri: string; base64: string } | null>(null);

  // PDF
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ── Validation ──────────────────────────────────────────────────────────────

  const canSubmit =
    title.trim().length > 0 &&
    workType !== '' &&
    summary.trim().length > 0 &&
    description.trim().length > 0 &&
    keywords.length >= 3 &&
    advisor.trim().length > 0 &&
    institution.trim().length > 0 &&
    pdfFile !== null &&
    !isSubmitting;

  // ── Keywords ────────────────────────────────────────────────────────────────

  const addKeyword = () => {
    const kw = keywordInput.trim();
    if (!kw || keywords.includes(kw) || keywords.length >= 5) return;
    setKeywords(prev => [...prev, kw]);
    setKeywordInput('');
  };

  const removeKeyword = (kw: string) => {
    setKeywords(prev => prev.filter(k => k !== kw));
  };

  // ── References ──────────────────────────────────────────────────────────────

  const addReference = () => {
    const ref = referenceInput.trim();
    if (!ref) return;
    setReferences(prev => [...prev, ref]);
    setReferenceInput('');
  };

  const removeReference = (index: number) => {
    setReferences(prev => prev.filter((_, i) => i !== index));
  };

  // ── Cover image ─────────────────────────────────────────────────────────────

  const pickCoverImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.75,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      setCoverImage({
        uri: result.assets[0].uri,
        base64: `data:image/jpeg;base64,${result.assets[0].base64}`,
      });
    }
  };

  // ── PDF picker ──────────────────────────────────────────────────────────────

  const pickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      setIsPdfLoading(true);

      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const base64 = await blobToBase64(blob);

      setPdfFile({ name: asset.name, base64 });
    } catch (err: any) {
      setErrorMsg('Não foi possível carregar o PDF. Tente novamente.');
    } finally {
      setIsPdfLoading(false);
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!canSubmit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);
    try {
      await api.post('/works', {
        title: title.trim(),
        workType: WORK_TYPE_MAP[workType as WorkType],
        summary: summary.trim(),
        description: description.trim(),
        keywords,
        references,
        advisor: advisor.trim(),
        institution: institution.trim(),
        ...(department.trim() ? { department: department.trim() } : {}),
        ...(coverImage ? { coverImage: coverImage.base64 } : {}),
        pdfFile: pdfFile!.base64,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error ?? 'Erro ao publicar trabalho.');
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

        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>Novo trabalho</Text>

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
              placeholder="Título do trabalho"
              placeholderTextColor={colors.textMuted}
              maxLength={300}
              autoFocus
              autoCapitalize="sentences"
            />
          </Section>

          {/* ── Tipo ────────────────────────────────────────────────────── */}
          <Section label="Tipo">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
              {WORK_TYPES.map(type => {
                const selected = workType === type;
                return (
                  <Pressable
                    key={type}
                    onPress={() => setWorkType(type)}
                    style={[
                      s.selectChip,
                      selected
                        ? { backgroundColor: colors.primary, borderColor: colors.primary }
                        : { backgroundColor: colors.container, borderColor: border },
                    ]}
                  >
                    <Text style={[s.selectChipText, { color: selected ? '#fff' : colors.textSecondary }]}>
                      {type}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Section>

          {/* ── Resumo ──────────────────────────────────────────────────── */}
          <Section label="Resumo">
            <TextInput
              style={[s.textArea, { color: colors.textPrimary, borderColor: border, backgroundColor: colors.container }]}
              value={summary}
              onChangeText={setSummary}
              placeholder="Abstract do trabalho..."
              placeholderTextColor={colors.textMuted}
              multiline
              autoCapitalize="sentences"
              textAlignVertical="top"
              scrollEnabled={false}
            />
          </Section>

          {/* ── Descrição completa ──────────────────────────────────────── */}
          <Section label="Descrição completa">
            <TextInput
              style={[s.textAreaLarge, { color: colors.textPrimary, borderColor: border, backgroundColor: colors.container }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Descrição detalhada..."
              placeholderTextColor={colors.textMuted}
              multiline
              autoCapitalize="sentences"
              textAlignVertical="top"
              scrollEnabled={false}
            />
          </Section>

          {/* ── Palavras-chave ──────────────────────────────────────────── */}
          <Section label="Palavras-chave">
            <View style={s.addRow}>
              <TextInput
                style={[s.addInput, { color: colors.textPrimary, borderColor: border, backgroundColor: colors.container }]}
                value={keywordInput}
                onChangeText={setKeywordInput}
                placeholder="Ex: aprendizado de máquina"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={addKeyword}
                editable={keywords.length < 5}
              />
              <Pressable
                onPress={addKeyword}
                disabled={!keywordInput.trim() || keywords.length >= 5}
                style={[
                  s.addBtn,
                  {
                    backgroundColor:
                      keywordInput.trim() && keywords.length < 5 ? colors.primary : `${colors.primary}40`,
                  },
                ]}
              >
                <Text style={s.addBtnText}>Adicionar</Text>
              </Pressable>
            </View>

            <View style={[s.chipsRow, { marginTop: 10 }]}>
              {keywords.map(kw => (
                <View
                  key={kw}
                  style={[s.kwChip, { backgroundColor: `${colors.primary}18`, borderColor: `${colors.primary}30` }]}
                >
                  <Text style={[s.kwChipText, { color: colors.primary }]}>{kw}</Text>
                  <Pressable onPress={() => removeKeyword(kw)} hitSlop={6}>
                    <Ionicons name="close" size={13} color={colors.primary} />
                  </Pressable>
                </View>
              ))}
            </View>

            <Text style={[s.counter, { color: keywords.length < 3 ? colors.textMuted : colors.primary }]}>
              {keywords.length}/5 {keywords.length < 3 ? '(mínimo 3)' : ''}
            </Text>
          </Section>

          {/* ── Orientador ──────────────────────────────────────────────── */}
          <Section label="Orientador">
            <TextInput
              style={[s.textInput, { color: colors.textPrimary, borderColor: border, backgroundColor: colors.container }]}
              value={advisor}
              onChangeText={setAdvisor}
              placeholder="Nome do orientador"
              placeholderTextColor={colors.textMuted}
              maxLength={200}
              autoCapitalize="words"
            />
          </Section>

          {/* ── Instituição ─────────────────────────────────────────────── */}
          <Section label="Instituição">
            <TextInput
              style={[s.textInput, { color: colors.textPrimary, borderColor: border, backgroundColor: colors.container }]}
              value={institution}
              onChangeText={setInstitution}
              placeholder="Nome da instituição"
              placeholderTextColor={colors.textMuted}
              maxLength={200}
              autoCapitalize="words"
            />
          </Section>

          {/* ── Departamento ────────────────────────────────────────────── */}
          <Section label="Departamento (opcional)">
            <TextInput
              style={[s.textInput, { color: colors.textPrimary, borderColor: border, backgroundColor: colors.container }]}
              value={department}
              onChangeText={setDepartment}
              placeholder="Ex: Ciência da Computação"
              placeholderTextColor={colors.textMuted}
              maxLength={200}
              autoCapitalize="words"
            />
          </Section>

          {/* ── Referências ─────────────────────────────────────────────── */}
          <Section label="Referências (opcional)">
            <View style={s.addRow}>
              <TextInput
                style={[s.addInput, { color: colors.textPrimary, borderColor: border, backgroundColor: colors.container }]}
                value={referenceInput}
                onChangeText={setReferenceInput}
                placeholder="Ex: AUTOR, Nome. Título. Ano."
                placeholderTextColor={colors.textMuted}
                autoCapitalize="sentences"
                returnKeyType="done"
                onSubmitEditing={addReference}
              />
              <Pressable
                onPress={addReference}
                disabled={!referenceInput.trim()}
                style={[
                  s.addBtn,
                  { backgroundColor: referenceInput.trim() ? colors.primary : `${colors.primary}40` },
                ]}
              >
                <Text style={s.addBtnText}>Adicionar</Text>
              </Pressable>
            </View>

            {references.map((ref, i) => (
              <View
                key={i}
                style={[s.refRow, { backgroundColor: colors.container, borderColor: border }]}
              >
                <Text style={[s.refText, { color: colors.textSecondary }]} numberOfLines={2}>{ref}</Text>
                <Pressable onPress={() => removeReference(i)} hitSlop={10}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </Pressable>
              </View>
            ))}
          </Section>

          {/* ── Capa ────────────────────────────────────────────────────── */}
          <Section label="Capa (opcional)">
            {coverImage ? (
              <View style={s.imageWrapper}>
                <Image source={{ uri: coverImage.uri }} style={s.imagePreview} resizeMode="cover" />
                <Pressable onPress={() => setCoverImage(null)} style={s.imageRemoveBtn}>
                  <Ionicons name="close" size={16} color="#fff" />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={pickCoverImage}
                style={[s.pickerBtn, { borderColor: border, backgroundColor: colors.container }]}
              >
                <Ionicons name="image-outline" size={22} color={colors.textMuted} />
                <Text style={[s.pickerBtnText, { color: colors.textMuted }]}>Selecionar imagem de capa</Text>
              </Pressable>
            )}
          </Section>

          {/* ── Arquivo PDF ─────────────────────────────────────────────── */}
          <Section label="Arquivo PDF">
            {isPdfLoading ? (
              <View style={[s.pickerBtn, { borderColor: border, backgroundColor: colors.container }]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[s.pickerBtnText, { color: colors.textMuted }]}>Carregando PDF...</Text>
              </View>
            ) : pdfFile ? (
              <View style={[s.pdfRow, { backgroundColor: colors.container, borderColor: border }]}>
                <View style={[s.pdfIconBox, { backgroundColor: `${colors.primary}20` }]}>
                  <Ionicons name="document-text" size={20} color={colors.primary} />
                </View>
                <Text style={[s.pdfName, { color: colors.textPrimary }]} numberOfLines={1}>{pdfFile.name}</Text>
                <Pressable onPress={() => setPdfFile(null)} hitSlop={10}>
                  <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={pickPdf}
                style={[s.pickerBtn, { borderColor: colors.primary, backgroundColor: `${colors.primary}10` }]}
              >
                <Ionicons name="document-attach-outline" size={22} color={colors.primary} />
                <Text style={[s.pickerBtnText, { color: colors.primary }]}>Selecionar PDF</Text>
              </Pressable>
            )}
            {!pdfFile && !isPdfLoading && (
              <Text style={[s.helperText, { color: colors.textMuted }]}>Arquivo PDF obrigatório.</Text>
            )}
          </Section>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Error modal ───────────────────────────────────────────────────── */}
      <ConfirmModal
        visible={!!errorMsg}
        title="Erro ao publicar"
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
    minHeight: 100,
  },
  textAreaLarge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 140,
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

  // Keywords
  addRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  addInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  kwChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  kwChipText: { fontSize: 12, fontWeight: '600' },

  counter: { fontSize: 12, marginTop: 8 },

  // References
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
  },
  refText: { flex: 1, fontSize: 13, lineHeight: 18 },

  // Image
  imageWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  imagePreview: { width: '100%', height: 180 },
  imageRemoveBtn: {
    position: 'absolute', top: 10, right: 10,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Generic picker button
  pickerBtn: {
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
  pickerBtnText: { fontSize: 14, fontWeight: '500' },

  // PDF
  pdfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  pdfIconBox: {
    width: 40, height: 40,
    borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  pdfName: { flex: 1, fontSize: 14, fontWeight: '500' },

  helperText: { fontSize: 12, marginTop: 8 },
});
