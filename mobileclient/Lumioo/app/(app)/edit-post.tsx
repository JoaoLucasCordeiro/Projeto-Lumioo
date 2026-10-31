import React, { useEffect, useState } from 'react';
import {
  View, Text, Pressable, TextInput, Image, Alert,
  ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';
import { ConfirmModal } from '@/components/modals';
import api from '@/lib/api';

const CHAR_LIMIT = 2000;

export default function EditPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [caption, setCaption] = useState('');
  const [originalCaption, setOriginalCaption] = useState('');
  // `image` é o que está sendo exibido; `imageChanged` indica se precisa ir no PUT
  const [image, setImage] = useState<string | null>(null);
  const [imageChanged, setImageChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/posts/${id}`);
        setCaption(data.caption);
        setOriginalCaption(data.caption);
        setImage(data.image ?? null);
      } catch {
        setErrorMsg('Não foi possível carregar o post.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const hasChanges = caption.trim() !== originalCaption.trim() || imageChanged;
  const canSubmit = caption.trim().length > 0 && hasChanges && !isSubmitting && !isLoading;
  const charNearLimit = caption.length > CHAR_LIMIT * 0.85;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.75,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
      setImageChanged(true);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImageChanged(true);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);
    try {
      // Só envia a imagem se mudou; location/hashtags não são enviados e permanecem como estão.
      await api.put(`/posts/${id}`, {
        caption: caption.trim(),
        ...(imageChanged ? { image } : {}),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error ?? 'Não foi possível salvar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const border = colors.borderDark;

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <View style={[s.header, { paddingTop: insets.top + 10, borderBottomColor: border }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={[s.closeBtn, { backgroundColor: colors.containerLight }]}
        >
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </Pressable>

        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>Editar post</Text>

        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={[s.publishBtn, { backgroundColor: canSubmit ? '#ff3131' : '#ff313150' }]}
        >
          {isSubmitting
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={s.publishBtnText}>Salvar</Text>
          }
        </Pressable>
      </View>

      {isLoading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingBottom: Math.max(insets.bottom, 16) + 24 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TextInput
              style={[s.captionInput, { color: colors.textPrimary, borderColor: border, backgroundColor: colors.container }]}
              value={caption}
              onChangeText={setCaption}
              placeholder="O que você quer compartilhar?"
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={CHAR_LIMIT}
              autoCapitalize="sentences"
              textAlignVertical="top"
              scrollEnabled={false}
            />
            <Text style={[s.charCount, { color: charNearLimit ? '#ff3131' : colors.textMuted }]}>
              {caption.length}/{CHAR_LIMIT}
            </Text>

            {image ? (
              <View style={s.imageWrapper}>
                <Image source={{ uri: image }} style={s.imagePreview} resizeMode="cover" />
                <Pressable onPress={removeImage} style={s.imageRemoveBtn}>
                  <Ionicons name="close" size={16} color="#fff" />
                </Pressable>
              </View>
            ) : null}

            <Pressable
              onPress={pickImage}
              style={[s.pickerBtn, { borderColor: border, backgroundColor: colors.container }]}
            >
              <Ionicons name="image-outline" size={22} color={colors.textMuted} />
              <Text style={[s.pickerBtnText, { color: colors.textMuted }]}>
                {image ? 'Trocar imagem' : 'Adicionar imagem'}
              </Text>
            </Pressable>
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
  publishBtn: {
    paddingHorizontal: 18, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', minWidth: 90,
  },
  publishBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  captionInput: {
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 16, minHeight: 140,
  },
  charCount: { fontSize: 12, textAlign: 'right', marginTop: 6 },
  imageWrapper: { borderRadius: 16, overflow: 'hidden', marginTop: 16 },
  imagePreview: { width: '100%', height: 220 },
  imageRemoveBtn: {
    position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center',
  },
  pickerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderWidth: 1, borderStyle: 'dashed', borderRadius: 12,
    paddingVertical: 16, paddingHorizontal: 16, marginTop: 16,
  },
  pickerBtnText: { fontSize: 14, fontWeight: '500' },
});
