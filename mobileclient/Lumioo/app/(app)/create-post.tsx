import React, { useRef, useState } from 'react';
import {
  View, Text, Pressable, TextInput, Image,
  ScrollView, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/Avatar';
import api from '@/lib/api';

// ─── Chips de localização / hashtag ──────────────────────────────────────────

function Chip({ icon, label, onRemove, color }: {
  icon: string; label: string; onRemove: () => void; color: string;
}) {
  return (
    <View style={[s.chip, { backgroundColor: `${color}18`, borderColor: `${color}30` }]}>
      <Ionicons name={icon as any} size={13} color={color} />
      <Text style={[s.chipText, { color }]} numberOfLines={1}>{label}</Text>
      <Pressable onPress={onRemove} hitSlop={6}>
        <Ionicons name="close" size={13} color={color} />
      </Pressable>
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function CreatePostScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const inputRef = useRef<TextInput>(null);

  const [caption, setCaption] = useState('');
  const [image, setImage] = useState<{ uri: string; base64: string } | null>(null);
  const [location, setLocation] = useState('');
  const [hashtagsRaw, setHashtagsRaw] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [showHashtagInput, setShowHashtagInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = caption.trim().length > 0 && !isSubmitting;
  const charCount = caption.length;
  const charLimit = 2000;
  const charNearLimit = charCount > charLimit * 0.85;

  const parseHashtags = (raw: string): string[] =>
    raw.split(/[\s,]+/).map(t => t.replace(/^#/, '').trim()).filter(t => t.length > 0);

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
      setImage({
        uri: result.assets[0].uri,
        base64: `data:image/jpeg;base64,${result.assets[0].base64}`,
      });
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);
    try {
      const hashtags = parseHashtags(hashtagsRaw);
      await api.post('/posts', {
        caption: caption.trim(),
        ...(image ? { image: image.base64 } : {}),
        ...(location.trim() ? { location: location.trim() } : {}),
        ...(hashtags.length > 0 ? { hashtags } : {}),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Não foi possível publicar. Tente novamente.';
      Alert.alert('Erro', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const bg = colors.background;
  const border = colors.borderDark;

  return (
    <View style={[s.root, { backgroundColor: bg }]}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={[s.header, { paddingTop: insets.top + 10, borderBottomColor: border }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={[s.closeBtn, { backgroundColor: colors.containerLight }]}
        >
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </Pressable>

        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>Novo post</Text>

        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={[s.publishBtn, { backgroundColor: canSubmit ? '#ff3131' : '#ff313150' }]}
        >
          {isSubmitting
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={s.publishBtnText}>Publicar</Text>
          }
        </Pressable>
      </View>

      {/* ── Corpo (scrollável) + toolbar ────────────────────────────────────── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 8) + 16 + 72 + 72 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* Linha do composer: avatar + input */}
          <Pressable style={s.composerRow} onPress={() => inputRef.current?.focus()}>
            <View style={s.avatarCol}>
              <Avatar
                userImage={user?.avatar ?? null}
                username={user?.username ?? 'user'}
                size={44}
              />
              {/* linha vertical conectando avatar à barra inferior */}
              <View style={[s.avatarLine, { backgroundColor: border }]} />
            </View>

            <View style={s.inputCol}>
              <Text style={[s.composerName, { color: colors.textPrimary }]}>
                @{user?.username ?? ''}
              </Text>
              <TextInput
                ref={inputRef}
                style={[s.captionInput, { color: colors.textPrimary }]}
                value={caption}
                onChangeText={setCaption}
                placeholder="O que você quer compartilhar?"
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={charLimit}
                autoFocus
                autoCapitalize="sentences"
                textAlignVertical="top"
                scrollEnabled={false}
              />

              {/* Chips de localização e hashtags */}
              {(location || hashtagsRaw) ? (
                <View style={s.chipsRow}>
                  {!!location && (
                    <Chip
                      icon="location"
                      label={location}
                      color="#3b82f6"
                      onRemove={() => { setLocation(''); setShowLocationInput(false); }}
                    />
                  )}
                  {!!hashtagsRaw && (
                    <Chip
                      icon="pricetag"
                      label={parseHashtags(hashtagsRaw).map(t => `#${t}`).join(' ')}
                      color="#8b5cf6"
                      onRemove={() => { setHashtagsRaw(''); setShowHashtagInput(false); }}
                    />
                  )}
                </View>
              ) : null}
            </View>
          </Pressable>

          {/* Input de localização (expansível) */}
          {showLocationInput && !location && (
            <View style={[s.expandedInput, { borderColor: border, backgroundColor: colors.container }]}>
              <Ionicons name="location-outline" size={16} color="#3b82f6" />
              <TextInput
                style={[s.expandedInputText, { color: colors.textPrimary }]}
                value={location}
                onChangeText={setLocation}
                placeholder="Adicionar localização..."
                placeholderTextColor={colors.textMuted}
                autoFocus
                autoCapitalize="words"
                maxLength={200}
                returnKeyType="done"
                onSubmitEditing={() => setShowLocationInput(false)}
              />
            </View>
          )}

          {/* Input de hashtags (expansível) */}
          {showHashtagInput && !hashtagsRaw && (
            <View style={[s.expandedInput, { borderColor: border, backgroundColor: colors.container }]}>
              <Ionicons name="pricetag-outline" size={16} color="#8b5cf6" />
              <TextInput
                style={[s.expandedInputText, { color: colors.textPrimary }]}
                value={hashtagsRaw}
                onChangeText={setHashtagsRaw}
                placeholder="pesquisa ciencia inovacao..."
                placeholderTextColor={colors.textMuted}
                autoFocus
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={() => setShowHashtagInput(false)}
              />
            </View>
          )}

          {/* Preview da imagem */}
          {image && (
            <View style={s.imageWrapper}>
              <Image
                source={{ uri: image.uri }}
                style={s.imagePreview}
                resizeMode="cover"
              />
              <Pressable
                onPress={() => setImage(null)}
                style={s.imageRemoveBtn}
              >
                <Ionicons name="close" size={16} color="#fff" />
              </Pressable>
            </View>
          )}


        </ScrollView>

      </KeyboardAvoidingView>

      {/* ── Floating pill toolbar ──────────────────────────────────────────── */}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: 0, right: 0,
          bottom: Math.max(insets.bottom, 8) + 16 + 72 + 14,
          alignItems: 'center',
        }}
      >
        <View style={s.pill}>
          {/* Imagem */}
          <Pressable
            onPress={pickImage}
            hitSlop={8}
            style={({ pressed }) => [s.pillBtn, pressed && { opacity: 0.6 }]}
          >
            <Ionicons name={image ? 'image' : 'image-outline'} size={21} color={image ? '#fca5a5' : '#fff'} />
          </Pressable>

          <View style={s.pillDivider} />

          {/* Localização */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (location) { setLocation(''); setShowLocationInput(false); }
              else { setShowLocationInput(v => !v); setShowHashtagInput(false); }
            }}
            hitSlop={8}
            style={({ pressed }) => [s.pillBtn, pressed && { opacity: 0.6 }]}
          >
            <Ionicons name={location ? 'location' : 'location-outline'} size={21} color={location ? '#fca5a5' : '#fff'} />
          </Pressable>

          {/* Hashtag */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (hashtagsRaw) { setHashtagsRaw(''); setShowHashtagInput(false); }
              else { setShowHashtagInput(v => !v); setShowLocationInput(false); }
            }}
            hitSlop={8}
            style={({ pressed }) => [s.pillBtn, pressed && { opacity: 0.6 }]}
          >
            <Ionicons name={hashtagsRaw ? 'pricetag' : 'pricetag-outline'} size={20} color={hashtagsRaw ? '#fca5a5' : '#fff'} />
          </Pressable>

          <View style={s.pillDivider} />

          {/* Contador */}
          <Text style={[s.pillCount, { color: charNearLimit ? '#fde68a' : 'rgba(255,255,255,0.75)' }]}>
            {charLimit - charCount}
          </Text>
        </View>
      </View>

    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

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
  },
  publishBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  // Composer
  composerRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  avatarCol: {
    alignItems: 'center',
    width: 52,
    marginRight: 12,
  },
  avatarLine: {
    width: 2,
    flex: 1,
    minHeight: 20,
    marginTop: 8,
    borderRadius: 1,
  },
  inputCol: { flex: 1, paddingBottom: 12 },
  composerName: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  captionInput: {
    fontSize: 16,
    lineHeight: 24,
    padding: 0,
    minHeight: 80,
  },

  // Chips
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
    maxWidth: 200,
  },
  chipText: { fontSize: 12, fontWeight: '500', flexShrink: 1 },

  // Inputs expansíveis
  expandedInput: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginTop: 4,
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, height: 44,
  },
  expandedInputText: { flex: 1, fontSize: 14, padding: 0 },

  // Imagem
  imageWrapper: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  imagePreview: { width: '100%', height: 220 },
  imageRemoveBtn: {
    position: 'absolute', top: 10, right: 10,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Floating pill
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff3131',
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 10,
    shadowColor: '#ff3131',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 14,
  },
  pillBtn: { paddingHorizontal: 22, paddingVertical: 6 },
  pillDivider: {
    width: 1, height: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: 4,
  },
  pillCount: { fontSize: 13, fontWeight: '600', paddingHorizontal: 14 },
});
