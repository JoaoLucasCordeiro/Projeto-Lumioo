import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/Button';
import { useTheme } from '@/contexts/ThemeContext';

export default function RecoveryCodeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const isComplete = code.every((d) => d !== '');

  const handleVerify = async () => {
    if (!isComplete) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    // TODO: Implement code verification logic
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Código verificado', 'Agora você pode redefinir sua senha.', [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    }, 1000);
  };

  const handleResend = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implement resend logic
    Alert.alert('Código reenviado', 'Verifique seu email.');
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
          Código de recuperação
        </Text>
        <Text className="text-base mt-2" style={{ color: colors.textTertiary }}>
          Insira o código de 6 dígitos enviado para o seu email
        </Text>
      </View>

      {/* Icon */}
      <View className="items-center py-8">
        <View
          className="w-24 h-24 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.container }}
        >
          <Ionicons name="shield-checkmark-outline" size={48} color={colors.primary} />
        </View>
      </View>

      {/* OTP Input */}
      <View className="flex-1 px-6">
        <View className="flex-row justify-center gap-3 mb-8">
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputs.current[index] = ref; }}
              style={{
                width: 48,
                height: 56,
                textAlign: 'center',
                fontSize: 20,
                fontWeight: 'bold',
                borderRadius: 16,
                borderWidth: 1,
                backgroundColor: colors.container,
                borderColor: digit ? colors.primary : colors.borderDark,
                color: colors.textPrimary,
              }}
              value={digit}
              onChangeText={(text) => handleCodeChange(text.slice(-1), index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <Button
          title={isLoading ? 'Verificando...' : 'Verificar código'}
          onPress={handleVerify}
          disabled={isLoading || !isComplete}
          loading={isLoading}
          size="large"
          className="mb-6"
        />

        <View className="items-center mb-4">
          <Text className="text-sm" style={{ color: colors.textTertiary }}>
            Não recebeu o código?{' '}
            <Text
              className="font-semibold"
              style={{ color: colors.primary }}
              onPress={handleResend}
            >
              Reenviar
            </Text>
          </Text>
        </View>

        <View className="items-center">
          <Text
            className="text-sm font-semibold"
            style={{ color: colors.primary }}
            onPress={() => router.back()}
          >
            Voltar
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
