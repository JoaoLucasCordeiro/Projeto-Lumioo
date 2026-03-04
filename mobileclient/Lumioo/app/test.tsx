import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function TestScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <View className="p-6">
        {/* Header */}
        <Text
          className="text-3xl font-bold mb-2"
          style={{ color: colors.textPrimary }}
        >
          Teste NativeWind ✅
        </Text>
        <Text
          className="text-base mb-6"
          style={{ color: colors.textTertiary }}
        >
          Verificando se o NativeWind está funcionando corretamente
        </Text>

        {/* Test Card with className */}
        <Card className="mb-4">
          <Text
            className="text-lg font-semibold mb-2"
            style={{ color: colors.textPrimary }}
          >
            Card com NativeWind
          </Text>
          <Text
            className="text-sm"
            style={{ color: colors.textSecondary }}
          >
            Este card usa classes Tailwind para layout + inline styles para cores
          </Text>
        </Card>

        {/* Test Icon */}
        <View
          className="flex-row items-center p-4 rounded-2xl mb-4"
          style={{
            backgroundColor: colors.container,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View
            className="w-12 h-12 rounded-xl items-center justify-center mr-4"
            style={{ backgroundColor: `${colors.primary}20` }}
          >
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text
              className="text-lg font-semibold"
              style={{ color: colors.textPrimary }}
            >
              NativeWind Funcionando!
            </Text>
            <Text
              className="text-sm"
              style={{ color: colors.textTertiary }}
            >
              Layout com classes, cores com inline styles
            </Text>
          </View>
        </View>

        {/* Test Button */}
        <View className="mb-6">
          <Text
            className="text-lg font-semibold mb-3"
            style={{ color: colors.textSecondary }}
          >
            Botões:
          </Text>
          <Button
            title="Botão Primário"
            onPress={() => {}}
            size="large"
            className="mb-3"
          />
          <Button
            title="Botão Outline"
            onPress={() => {}}
            variant="outline"
            size="large"
            className="mb-3"
          />
        </View>

        {/* Test Input */}
        <View className="mb-6">
          <Text
            className="text-lg font-semibold mb-3"
            style={{ color: colors.textSecondary }}
          >
            Inputs:
          </Text>
          <Input
            label="Email"
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            icon="mail-outline"
          />
          <Input
            label="Senha"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            icon="lock-closed-outline"
            secureTextEntry
          />
        </View>

        {/* Colors Display */}
        <View className="mb-6">
          <Text
            className="text-lg font-semibold mb-3"
            style={{ color: colors.textSecondary }}
          >
            Paleta de Cores:
          </Text>
          <View className="gap-2">
            <View
              className="p-3 rounded-lg"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white font-semibold">Primary (#ff3131)</Text>
            </View>
            <View
              className="p-3 rounded-lg"
              style={{ backgroundColor: colors.background }}
            >
              <Text style={{ color: colors.textPrimary }}>Background (#0F172A)</Text>
            </View>
            <View
              className="p-3 rounded-lg"
              style={{ backgroundColor: colors.container }}
            >
              <Text style={{ color: colors.textPrimary }}>Container (#1E293B)</Text>
            </View>
          </View>
        </View>

        {/* Success Message */}
        <View
          className="p-4 rounded-xl items-center"
          style={{ backgroundColor: `${colors.primary}20` }}
        >
          <Ionicons name="checkmark-circle" size={32} color={colors.primary} />
          <Text
            className="text-center font-semibold mt-2"
            style={{ color: colors.primary }}
          >
            Tudo configurado corretamente!
          </Text>
          <Text
            className="text-center text-sm mt-1"
            style={{ color: colors.textTertiary }}
          >
            NativeWind v4 + Tailwind CSS funcionando perfeitamente
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
