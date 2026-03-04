import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/Button';
import { useTheme } from '@/contexts/ThemeContext';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    // TODO: Implement forgot password logic
    setTimeout(() => {
      setIsLoading(false);
      router.push('/auth/recovery-code');
    }, 1000);
  };

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <View className="pt-16 pb-6 px-6">
        <Text className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
          Recuperar senha
        </Text>
        <Text className="text-base mt-2" style={{ color: colors.textTertiary }}>
          Informe seu email para receber o código de recuperação
        </Text>
      </View>

      {/* Icon */}
      <View className="items-center py-8">
        <View
          className="w-24 h-24 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.container }}
        >
          <Ionicons name="lock-open-outline" size={48} color={colors.primary} />
        </View>
      </View>

      {/* Form */}
      <View className="flex-1 px-6">
        <View className="mb-6">
          <Text
            className="text-sm font-medium mb-2"
            style={{ color: colors.textSecondary }}
          >
            Email
          </Text>
          <View
            className="flex-row items-center px-4 rounded-2xl border"
            style={{
              backgroundColor: colors.container,
              borderColor: email ? colors.primary : colors.borderDark,
              height: 52,
            }}
          >
            <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={{ marginRight: 12 }} />
            <TextInput
              className="flex-1 text-base"
              style={{ color: colors.textPrimary, padding: 0 }}
              placeholder="seu@email.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <Button
          title={isLoading ? 'Enviando...' : 'Enviar código'}
          onPress={handleSendCode}
          disabled={isLoading || !email}
          loading={isLoading}
          size="large"
          className="mb-6"
        />

        <View className="items-center">
          <Text className="text-sm" style={{ color: colors.textTertiary }}>
            Lembrou a senha?{' '}
            <Text
              className="font-semibold"
              style={{ color: colors.primary }}
              onPress={() => router.back()}
            >
              Voltar ao login
            </Text>
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View className="pb-8 items-center">
        <Text className="text-xs text-center" style={{ color: colors.textMuted }}>
          © 2026 Lumioo
        </Text>
      </View>
    </ScrollView>
  );
}
