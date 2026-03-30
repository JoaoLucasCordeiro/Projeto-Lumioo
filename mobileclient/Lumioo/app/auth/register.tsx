import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, Alert, Modal,
  TouchableOpacity, TextInput, TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Button } from '@/components/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/context/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  fullName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  institution: string;
  academicLevel: string;
}

const ACADEMIC_LEVELS: { label: string; value: string }[] = [
  { label: 'Graduação', value: 'UNDERGRADUATE' },
  { label: 'Mestrado', value: 'MASTER' },
  { label: 'Doutorado', value: 'PHD' },
  { label: 'Professor', value: 'PROFESSOR' },
];

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const ITEM_HEIGHT = 48;
const VISIBLE = 5; // number of visible rows in each wheel

// ─── RenderInput (outside component to avoid re-mount on state change) ────────

interface InputProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  icon: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  showToggle?: boolean;
  showPassword?: boolean;
  onToggle?: () => void;
  keyboardType?: any;
  error?: string;
  maxLength?: number;
  colors: any;
}

function RenderInput({
  label, value, onChangeText, icon, secureTextEntry, showToggle,
  showPassword, onToggle, keyboardType, placeholder, error, maxLength, colors,
}: InputProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8, color: colors.textSecondary }}>
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
          borderRadius: 16, borderWidth: 1, backgroundColor: colors.container,
          borderColor: value && !error ? colors.primary : error ? colors.error : colors.borderDark,
          height: 52,
        }}
      >
        <Ionicons name={icon as any} size={20} color={colors.textMuted} style={{ marginRight: 12 }} />
        <TextInput
          style={{ flex: 1, fontSize: 16, color: colors.textPrimary, padding: 0 }}
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
              size={20} color={colors.textMuted}
            />
          </Pressable>
        )}
      </View>
      {error && <Text style={{ color: '#f87171', fontSize: 12, marginTop: 4, marginLeft: 4 }}>{error}</Text>}
    </View>
  );
}

// ─── WheelColumn ──────────────────────────────────────────────────────────────

interface WheelColumnProps {
  data: (string | number)[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

function WheelColumn({ data, selectedIndex, onSelect }: WheelColumnProps) {
  const scrollRef = useRef<ScrollView>(null);

  // scroll to initial position after layout
  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
    }, 50);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={{ flex: 1, height: ITEM_HEIGHT * VISIBLE, overflow: 'hidden' }}>
      {/* selection highlight bar */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute', top: ITEM_HEIGHT * 2, left: 4, right: 4,
          height: ITEM_HEIGHT, borderRadius: 10,
          backgroundColor: '#ff313120',
          borderWidth: 1.5, borderColor: '#ff3131',
          zIndex: 1,
        }}
      />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
        onMomentumScrollEnd={(e) => {
          const index = Math.max(0, Math.min(
            Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT),
            data.length - 1,
          ));
          onSelect(index);
        }}
        onScrollEndDrag={(e) => {
          // handle slow drags that don't trigger momentum
          const index = Math.max(0, Math.min(
            Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT),
            data.length - 1,
          ));
          onSelect(index);
        }}
      >
        {data.map((item, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.7}
            style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' }}
            onPress={() => {
              onSelect(index);
              scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
            }}
          >
            <Text
              style={{
                fontSize: index === selectedIndex ? 19 : 15,
                fontWeight: index === selectedIndex ? '700' : '400',
                color: index === selectedIndex ? '#ff3131' : '#CBD5E1',
                opacity: index === selectedIndex ? 1 : 0.55,
              }}
            >
              {String(item).padStart(typeof item === 'number' ? 2 : 0, '0')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── DatePickerModal ──────────────────────────────────────────────────────────

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initialDate: Date;
  colors: any;
}

function DatePickerModal({ visible, onClose, onConfirm, initialDate, colors }: DatePickerModalProps) {
  const today = new Date();
  const minYear = today.getFullYear() - 100;
  const maxYear = today.getFullYear() - 10;

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  const [dayIdx, setDayIdx] = useState(initialDate.getDate() - 1);
  const [monthIdx, setMonthIdx] = useState(initialDate.getMonth());
  const [yearIdx, setYearIdx] = useState(
    years.indexOf(initialDate.getFullYear()) === -1 ? 0 : years.indexOf(initialDate.getFullYear())
  );

  // Dias do mês correto, incluindo ano bissexto (new Date(ano, mês+1, 0).getDate())
  const maxDays = new Date(years[yearIdx], monthIdx + 1, 0).getDate();
  const days = Array.from({ length: maxDays }, (_, i) => i + 1);
  // Garante que o dia selecionado não ultrapasse o máximo do mês
  const safeDayIdx = Math.min(dayIdx, maxDays - 1);

  // Clamp o dayIdx sempre que mês ou ano mudar
  useEffect(() => {
    if (dayIdx > maxDays - 1) {
      setDayIdx(maxDays - 1);
    }
  }, [monthIdx, yearIdx]);

  const handleConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const date = new Date(years[yearIdx], monthIdx, days[safeDayIdx]);
    onConfirm(date);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        {/* dimmed backdrop — tap to close */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' }} />
        </TouchableWithoutFeedback>

        {/* picker sheet */}
        <View style={{ backgroundColor: colors.container, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>
              Data de Nascimento
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Column labels */}
          <View style={{ flexDirection: 'row', marginBottom: 4 }}>
            {['Dia', 'Mês', 'Ano'].map((label) => (
              <Text key={label} style={{ flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600', color: colors.textSecondary, letterSpacing: 0.5 }}>
                {label.toUpperCase()}
              </Text>
            ))}
          </View>

          {/* Wheel columns */}
          <View style={{ flexDirection: 'row' }}>
            <WheelColumn key={maxDays} data={days} selectedIndex={safeDayIdx} onSelect={setDayIdx} />
            <WheelColumn data={MONTHS} selectedIndex={monthIdx} onSelect={setMonthIdx} />
            <WheelColumn data={years} selectedIndex={yearIdx} onSelect={setYearIdx} />
          </View>

          {/* Confirm button */}
          <TouchableOpacity
            onPress={handleConfirm}
            style={{
              marginTop: 24, height: 52, borderRadius: 16,
              backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── RegisterScreen ───────────────────────────────────────────────────────────

export default function RegisterScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { register } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    institution: '',
    academicLevel: '',
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'birthDate', string>>>({});
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);

  const defaultPickerDate = new Date(2000, 0, 1);

  const formatDate = (date: Date) => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData | 'birthDate', string>> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Obrigatório';

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
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas diferentes';
    }

    if (!formData.institution.trim()) newErrors.institution = 'Obrigatória';
    if (!formData.academicLevel) newErrors.academicLevel = 'Obrigatório';
    if (!selectedDate) newErrors.birthDate = 'Obrigatória';

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

    try {
      const y = selectedDate!.getFullYear();
      const m = String(selectedDate!.getMonth() + 1).padStart(2, '0');
      const d = String(selectedDate!.getDate()).padStart(2, '0');
      const isoDate = `${y}-${m}-${d}`;

      await register({
        fullName: formData.fullName,
        academicEmail: formData.email,
        username: formData.username,
        password: formData.password,
        institution: formData.institution,
        academicLevel: formData.academicLevel,
        dateOfBirth: isoDate,
      });

      router.replace('/(app)/feed');
    } catch (error: any) {
      console.error('[Register] erro:', error?.response?.status, error?.response?.data ?? error?.message);
      const status = error?.response?.status;
      const message = error?.response?.data?.error;
      if (status === 409) {
        Alert.alert('Erro', 'Email ou nome de usuário já em uso.');
      } else if (status === 400 && message) {
        Alert.alert('Dados inválidos', message);
      } else if (message) {
        Alert.alert('Erro', message);
      } else {
        Alert.alert('Erro', `Não foi possível criar a conta. (${status ?? 'sem resposta'})`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: colors.background }}
      keyboardShouldPersistTaps="handled"
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
          label="Nome Completo" placeholder="Seu nome completo"
          value={formData.fullName} onChangeText={(v) => updateField('fullName', v)}
          icon="person-outline" error={errors.fullName} colors={colors}
        />
        <RenderInput
          label="Email Acadêmico" placeholder="seu@email.com"
          value={formData.email} onChangeText={(v) => updateField('email', v)}
          icon="mail-outline" keyboardType="email-address" error={errors.email} colors={colors}
        />
        <RenderInput
          label="Nome de Usuário" placeholder="@usuario"
          value={formData.username} onChangeText={(v) => updateField('username', v)}
          icon="at-outline" error={errors.username} colors={colors}
        />
        <RenderInput
          label="Senha" placeholder="Mínimo 8 caracteres"
          value={formData.password} onChangeText={(v) => updateField('password', v)}
          icon="lock-closed-outline" secureTextEntry showToggle
          showPassword={showPassword}
          onToggle={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowPassword(p => !p); }}
          error={errors.password} colors={colors}
        />
        <RenderInput
          label="Confirmar Senha" placeholder="Confirme sua senha"
          value={formData.confirmPassword} onChangeText={(v) => updateField('confirmPassword', v)}
          icon="lock-closed-outline" secureTextEntry showToggle
          showPassword={showConfirmPassword}
          onToggle={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowConfirmPassword(p => !p); }}
          error={errors.confirmPassword} colors={colors}
        />
        <RenderInput
          label="Faculdade/Instituição" placeholder="Nome da instituição"
          value={formData.institution} onChangeText={(v) => updateField('institution', v)}
          icon="school-outline" error={errors.institution} colors={colors}
        />

        {/* Academic Level */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8, color: colors.textSecondary }}>
            Nível Acadêmico
          </Text>
          <TouchableOpacity
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowLevelModal(true); }}
            style={{
              flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
              borderRadius: 16, borderWidth: 1, backgroundColor: colors.container,
              borderColor: formData.academicLevel ? colors.primary : errors.academicLevel ? colors.error : colors.borderDark,
              height: 52,
            }}
          >
            <Ionicons name="book-outline" size={20} color={colors.textMuted} style={{ marginRight: 12 }} />
            <Text style={{ flex: 1, fontSize: 16, color: formData.academicLevel ? colors.textPrimary : colors.textMuted }}>
              {ACADEMIC_LEVELS.find(l => l.value === formData.academicLevel)?.label || 'Selecione seu nível'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          {errors.academicLevel && (
            <Text style={{ color: '#f87171', fontSize: 12, marginTop: 4, marginLeft: 4 }}>{errors.academicLevel}</Text>
          )}
        </View>

        {/* Birth Date Picker */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8, color: colors.textSecondary }}>
            Data de Nascimento
          </Text>
          <TouchableOpacity
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowDateModal(true); }}
            style={{
              flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
              borderRadius: 16, borderWidth: 1, backgroundColor: colors.container,
              borderColor: selectedDate ? colors.primary : errors.birthDate ? colors.error : colors.borderDark,
              height: 52,
            }}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.textMuted} style={{ marginRight: 12 }} />
            <Text style={{ flex: 1, fontSize: 16, color: selectedDate ? colors.textPrimary : colors.textMuted }}>
              {selectedDate ? formatDate(selectedDate) : 'Selecione sua data'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          {errors.birthDate && (
            <Text style={{ color: '#f87171', fontSize: 12, marginTop: 4, marginLeft: 4 }}>{errors.birthDate}</Text>
          )}
        </View>

        {/* Terms */}
        <TouchableOpacity
          className="flex-row items-start mb-6"
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAcceptTerms(p => !p); }}
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

        <Button
          title={isLoading ? 'Criando...' : 'Criar Conta'}
          onPress={handleRegister}
          disabled={isLoading}
          loading={isLoading}
          size="large"
          className="mb-4"
        />

        <View className="items-center">
          <Text className="text-sm" style={{ color: colors.textTertiary }}>
            Já tem conta?{' '}
            <Text className="font-semibold" style={{ color: colors.primary }} onPress={() => router.back()}>
              Entrar
            </Text>
          </Text>
        </View>
      </View>

      {/* Academic Level Modal */}
      <Modal visible={showLevelModal} transparent animationType="slide" onRequestClose={() => setShowLevelModal(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={() => setShowLevelModal(false)}>
          <Pressable style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>Nível Acadêmico</Text>
                <Pressable onPress={() => setShowLevelModal(false)} hitSlop={10}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </Pressable>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {ACADEMIC_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      updateField('academicLevel', level.value);
                      setShowLevelModal(false);
                    }}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.borderDark }}
                  >
                    <Text style={{ flex: 1, fontSize: 16, color: colors.textSecondary }}>{level.label}</Text>
                    {formData.academicLevel === level.value && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDateModal}
        onClose={() => setShowDateModal(false)}
        onConfirm={(date) => {
          setSelectedDate(date);
          setErrors(prev => ({ ...prev, birthDate: undefined }));
          setShowDateModal(false);
        }}
        initialDate={selectedDate ?? defaultPickerDate}
        colors={colors}
      />
    </ScrollView>
  );
}
