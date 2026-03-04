import React, { useState } from 'react';
import { View, Text, Pressable, Image, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/Button';
import { useTheme } from '@/contexts/ThemeContext';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(app)/feed');
    }, 1000);
  };

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      {/* Logo */}
      <View className="items-center justify-center pt-16 pb-8">
        <Image
          source={require('@/assets/images/lumioo-logo.png')}
          className="w-56 h-56 mb-4"
          resizeMode="contain"
        />
        <Text
          className="text-2xl font-bold text-center mb-1"
          style={{ color: colors.textPrimary }}
        >
          Bem-vindo
        </Text>
        <Text
          className="text-center text-sm"
          style={{ color: colors.textTertiary }}
        >
          Entre na sua conta Lumioo
        </Text>
      </View>

      {/* Form */}
      <View className="flex-1 px-6">
        {/* Email Input */}
        <View className="mb-4">
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

        {/* Password Input */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text
              className="text-sm font-medium"
              style={{ color: colors.textSecondary }}
            >
              Senha
            </Text>
            <Pressable onPress={() => router.push('/auth/forgot-password')}>
              <Text
                className="text-xs font-medium"
                style={{ color: colors.primary }}
              >
                Esqueceu?
              </Text>
            </Pressable>
          </View>
          <View
            className="flex-row items-center px-4 rounded-2xl border"
            style={{
              backgroundColor: colors.container,
              borderColor: password ? colors.primary : colors.borderDark,
              height: 52,
            }}
          >
            <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={{ marginRight: 12 }} />
            <TextInput
              className="flex-1 text-base"
              style={{ color: colors.textPrimary, padding: 0 }}
              placeholder="•••••••••"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={colors.textMuted}
              />
            </Pressable>
          </View>
        </View>

        {/* Login Button */}
        <Button
          title={isLoading ? 'Entrando...' : 'Entrar'}
          onPress={handleLogin}
          disabled={isLoading || !email || !password}
          loading={isLoading}
          size="large"
          className="mb-4"
        />

        {/* Forgot Password Link */}
        <View className="items-center mb-6">
          <Pressable onPress={() => router.push('/auth/forgot-password')}>
            <Text
              className="text-sm font-medium"
              style={{ color: colors.primary }}
            >
              Esqueci a senha
            </Text>
          </Pressable>
        </View>

        {/* Register Link */}
        <View className="items-center">
          <Text
            className="text-sm"
            style={{ color: colors.textTertiary }}
          >
            Não tem uma conta?{' '}
            <Text
              className="font-semibold"
              style={{ color: colors.primary }}
              onPress={() => router.push('/auth/register')}
            >
              Criar conta
            </Text>
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View className="pb-8 items-center">
        <Text
          className="text-xs text-center"
          style={{ color: colors.textMuted }}
        >
          © 2026 Lumioo
        </Text>
      </View>
    </ScrollView>
  );
}
