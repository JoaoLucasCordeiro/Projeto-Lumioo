import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert, Modal, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Button } from '@/components/Button';
import { useTheme } from '@/contexts/ThemeContext';

interface FormData {
  fullName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  institution: string;
  academicLevel: string;
  birthDate: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    institution: '',
    academicLevel: '',
    birthDate: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);

  const academicLevels = [
    'Graduação - 1º ano',
    'Graduação - 2º ano',
    'Graduação - 3º ano',
    'Graduação - 4º ano',
    'Graduação - 5º ano ou mais',
    'Pós-graduação',
    'Mestrado',
    'Doutorado',
    'Pós-doutorado',
    'Professor',
  ];

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Obrigatório';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Mínimo 3 caracteres';
    }

    if (!formData.password) {
      newErrors.password = 'Obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas diferentes';
    }

    if (!formData.institution.trim()) {
      newErrors.institution = 'Obrigatória';
    }

    if (!formData.academicLevel) {
      newErrors.academicLevel = 'Obrigatório';
    }

    if (!formData.birthDate.trim()) {
      newErrors.birthDate = 'Obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!acceptTerms) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Alert.alert('Atenção', 'Aceite os termos para continuar');
      return;
    }

    if (!validateForm()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    // TODO: Implement registration logic
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Sucesso', 'Cadastro realizado!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }, 1000);
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTogglePassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowConfirmPassword(!showConfirmPassword);
  };

  const RenderInput = ({
    label,
    value,
    onChangeText,
    icon,
    secureTextEntry,
    showToggle,
    showPassword,
    onToggle,
    keyboardType,
    placeholder,
    error,
    maxLength,
  }: any) => (
    <View className="mb-4">
      <Text className="text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
        {label}
      </Text>
      <View
        className="flex-row items-center px-4 rounded-2xl border"
        style={{
          backgroundColor: colors.container,
          borderColor: value && !error ? colors.primary : error ? colors.error : colors.borderDark,
          height: 52,
        }}
      >
        <Ionicons name={icon} size={20} color={colors.textMuted} style={{ marginRight: 12 }} />
        <TextInput
          className="flex-1 text-base"
          style={{ color: colors.textPrimary, padding: 0 }}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize="none"
        />
        {showToggle && onToggle && (
          <Pressable onPress={onToggle} hitSlop={10}>
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        )}
      </View>
      {error && <Text className="text-red-400 text-xs mt-1 ml-1">{error}</Text>}
    </View>
  );

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <View className="pt-16 pb-6 px-6">
        <Text className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
          Criar conta
        </Text>
        <Text className="text-base mt-1" style={{ color: colors.textTertiary }}>
          Preencha para se cadastrar
        </Text>
      </View>

      {/* Form */}
      <View className="px-6 pb-8">
        <RenderInput
          label="Nome Completo"
          placeholder="Seu nome completo"
          value={formData.fullName}
          onChangeText={(v) => updateField('fullName', v)}
          icon="person-outline"
          error={errors.fullName}
        />

        <RenderInput
          label="Email Acadêmico"
          placeholder="seu@email.com"
          value={formData.email}
          onChangeText={(v) => updateField('email', v)}
          icon="mail-outline"
          keyboardType="email-address"
          error={errors.email}
        />

        <RenderInput
          label="Nome de Usuário"
          placeholder="@usuario"
          value={formData.username}
          onChangeText={(v) => updateField('username', v)}
          icon="at-outline"
          error={errors.username}
        />

        <RenderInput
          label="Senha"
          placeholder="Mínimo 6 caracteres"
          value={formData.password}
          onChangeText={(v) => updateField('password', v)}
          icon="lock-closed-outline"
          secureTextEntry
          showToggle
          showPassword={showPassword}
          onToggle={handleTogglePassword}
          error={errors.password}
        />

        <RenderInput
          label="Confirmar Senha"
          placeholder="Confirme sua senha"
          value={formData.confirmPassword}
          onChangeText={(v) => updateField('confirmPassword', v)}
          icon="lock-closed-outline"
          secureTextEntry
          showToggle
          showPassword={showConfirmPassword}
          onToggle={handleToggleConfirmPassword}
          error={errors.confirmPassword}
        />

        <RenderInput
          label="Faculdade/Instituição"
          placeholder="Nome da instituição"
          value={formData.institution}
          onChangeText={(v) => updateField('institution', v)}
          icon="school-outline"
          error={errors.institution}
        />

        {/* Academic Level Select */}
        <View className="mb-4">
          <Text className="text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
            Nível Acadêmico
          </Text>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowLevelModal(true);
            }}
            className="flex-row items-center px-4 rounded-2xl border"
            style={{
              backgroundColor: colors.container,
              borderColor: formData.academicLevel ? colors.primary : errors.academicLevel ? colors.error : colors.borderDark,
              height: 52,
            }}
          >
            <Ionicons name="book-outline" size={20} color={colors.textMuted} style={{ marginRight: 12 }} />
            <Text
              className="flex-1 text-base"
              style={{ color: formData.academicLevel ? colors.textPrimary : colors.textMuted }}
            >
              {formData.academicLevel || 'Selecione seu nível'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          {errors.academicLevel && <Text className="text-red-400 text-xs mt-1 ml-1">{errors.academicLevel}</Text>}
        </View>

        {/* Birth Date */}
        <View className="mb-6">
          <Text className="text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
            Data de Nascimento
          </Text>
          <View
            className="flex-row items-center px-4 rounded-2xl border"
            style={{
              backgroundColor: colors.container,
              borderColor: formData.birthDate ? colors.primary : errors.birthDate ? colors.error : colors.borderDark,
              height: 52,
            }}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.textMuted} style={{ marginRight: 12 }} />
            <TextInput
              className="flex-1 text-base"
              style={{ color: colors.textPrimary, padding: 0 }}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.textMuted}
              value={formData.birthDate}
              onChangeText={(v) => updateField('birthDate', v)}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
          {errors.birthDate && <Text className="text-red-400 text-xs mt-1 ml-1">{errors.birthDate}</Text>}
        </View>

        {/* Terms */}
        <TouchableOpacity
          className="flex-row items-start mb-6"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setAcceptTerms(!acceptTerms);
          }}
          activeOpacity={0.7}
        >
          <View
            className="w-5 h-5 rounded items-center justify-center mr-3 mt-0.5 border"
            style={{
              borderColor: acceptTerms ? colors.primary : colors.border,
              backgroundColor: acceptTerms ? colors.primary : 'transparent',
            }}
          >
            {acceptTerms && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
          <View className="flex-1">
            <Text className="text-sm" style={{ color: colors.textTertiary }}>
              Aceito os{' '}
              <Text style={{ color: colors.primary }}>Termos de Uso</Text>
              {' '}e{' '}
              <Text style={{ color: colors.primary }}>Política de Privacidade</Text>
            </Text>
          </View>
        </TouchableOpacity>

        {/* Register Button */}
        <Button
          title={isLoading ? 'Criando...' : 'Criar Conta'}
          onPress={handleRegister}
          disabled={isLoading}
          loading={isLoading}
          size="large"
          className="mb-4"
        />

        {/* Login Link */}
        <View className="items-center">
          <Text className="text-sm" style={{ color: colors.textTertiary }}>
            Já tem conta?{' '}
            <Text
              className="font-semibold"
              style={{ color: colors.primary }}
              onPress={() => router.back()}
            >
              Entrar
            </Text>
          </Text>
        </View>
      </View>

      {/* Academic Level Modal */}
      <Modal
        visible={showLevelModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLevelModal(false)}
      >
        <Pressable
          className="flex-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setShowLevelModal(false)}
        >
          <Pressable className="flex-1 justify-end">
            <View
              className="rounded-t-3xl p-6"
              style={{ backgroundColor: colors.background }}
            >
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                  Nível Acadêmico
                </Text>
                <Pressable onPress={() => setShowLevelModal(false)} hitSlop={10}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </Pressable>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {academicLevels.map((level) => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      updateField('academicLevel', level);
                      setShowLevelModal(false);
                    }}
                    className="flex-row items-center py-4 border-b"
                    style={{ borderColor: colors.borderDark }}
                  >
                    <Text
                      className="flex-1 text-base"
                      style={{ color: colors.textSecondary }}
                    >
                      {level}
                    </Text>
                    {formData.academicLevel === level && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
