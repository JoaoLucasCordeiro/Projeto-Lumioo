import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Button } from '@/components/Button';
import { useTheme } from '@/contexts/ThemeContext';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: colors.background }}
    >
      {/* Hero Section */}
      <View className="pt-16 pb-8 px-6 items-center">
        <Image
          source={require('@/assets/images/lumioo-logo.png')}
          className="w-56 h-56 mb-4"
          contentFit="contain"
        />
        <Text
          className="text-3xl font-bold text-center mb-2"
          style={{ color: colors.textPrimary }}
        >
          Lumioo
        </Text>
        <Text
          className="text-center text-base"
          style={{ color: colors.textTertiary }}
        >
          Rede social acadêmica
        </Text>
      </View>

      {/* Buttons */}
      <View className="px-6 mb-8">
        <Button
          title="Fazer Login"
          onPress={() => {
            handlePress();
            router.push('/auth/login');
          }}
          size="large"
          className="mb-3"
        />
        <Button
          title="Criar Conta"
          onPress={() => {
            handlePress();
            router.push('/auth/register');
          }}
          variant="outline"
          size="large"
        />
      </View>

      {/* Features Section */}
      <View className="px-6 pb-8">
        <Text
          className="text-xl font-bold mb-4"
          style={{ color: colors.textPrimary }}
        >
          O que você pode fazer
        </Text>

        <View className="gap-3">
          {/* Feature 1 */}
          <View
            className="flex-row items-center p-4 rounded-2xl border"
            style={{ backgroundColor: colors.container, borderColor: colors.border }}
          >
            <View
              className="w-10 h-10 rounded-xl items-center justify-center mr-4"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <Ionicons name="people-outline" size={20} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text
                className="font-semibold mb-0.5"
                style={{ color: colors.textPrimary }}
              >
                Conecte-se
              </Text>
              <Text
                className="text-sm"
                style={{ color: colors.textTertiary }}
              >
                Encontre colegas da sua área
              </Text>
            </View>
          </View>

          {/* Feature 2 */}
          <View
            className="flex-row items-center p-4 rounded-2xl border"
            style={{ backgroundColor: colors.container, borderColor: colors.border }}
          >
            <View
              className="w-10 h-10 rounded-xl items-center justify-center mr-4"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <Ionicons name="library-outline" size={20} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text
                className="font-semibold mb-0.5"
                style={{ color: colors.textPrimary }}
              >
                Compartilhe Projetos
              </Text>
              <Text
                className="text-sm"
                style={{ color: colors.textTertiary }}
              >
                Mostre seus trabalhos
              </Text>
            </View>
          </View>

          {/* Feature 3 */}
          <View
            className="flex-row items-center p-4 rounded-2xl border"
            style={{ backgroundColor: colors.container, borderColor: colors.border }}
          >
            <View
              className="w-10 h-10 rounded-xl items-center justify-center mr-4"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <Ionicons name="chatbubbles-outline" size={20} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text
                className="font-semibold mb-0.5"
                style={{ color: colors.textPrimary }}
              >
                Colabore
              </Text>
              <Text
                className="text-sm"
                style={{ color: colors.textTertiary }}
              >
                Participe de discussões
              </Text>
            </View>
          </View>

          {/* Feature 4 */}
          <View
            className="flex-row items-center p-4 rounded-2xl border"
            style={{ backgroundColor: colors.container, borderColor: colors.border }}
          >
            <View
              className="w-10 h-10 rounded-xl items-center justify-center mr-4"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <Ionicons name="school-outline" size={20} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text
                className="font-semibold mb-0.5"
                style={{ color: colors.textPrimary }}
              >
                Aprenda
              </Text>
              <Text
                className="text-sm"
                style={{ color: colors.textTertiary }}
              >
                Acesse conteúdo exclusivo
              </Text>
            </View>
          </View>
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
