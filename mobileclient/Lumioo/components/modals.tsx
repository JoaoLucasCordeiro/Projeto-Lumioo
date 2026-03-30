/**
 * Lumioo — Modal System
 *
 * Three primitives:
 *   ConfirmModal  — centered dialog for destructive / informational confirmations
 *   ActionSheet   — bottom sheet with a list of labelled actions
 *   InputModal    — bottom sheet with an editable text field
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Modal, View, Text, Pressable, TextInput,
  TouchableWithoutFeedback, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

// ─── ConfirmModal ─────────────────────────────────────────────────────────────

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  visible, title, message, confirmLabel = 'Confirmar',
  destructive = false, loading = false, onConfirm, onClose,
}: ConfirmModalProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
          <TouchableWithoutFeedback>
            <View className="w-full rounded-3xl p-6" style={{ backgroundColor: colors.container }}>

              {/* Icon + Text — linha única */}
              <View className="flex-row items-center gap-4 mb-6">
                <View
                  className="w-12 h-12 rounded-2xl items-center justify-center shrink-0"
                  style={{ backgroundColor: destructive ? `${colors.error}18` : `${colors.primary}18` }}
                >
                  <Ionicons
                    name={destructive ? 'trash-outline' : 'alert-circle-outline'}
                    size={24}
                    color={destructive ? colors.error : colors.primary}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold mb-1" style={{ color: colors.textPrimary }}>{title}</Text>
                  {!!message && (
                    <Text className="text-sm leading-5" style={{ color: colors.textTertiary }}>{message}</Text>
                  )}
                </View>
              </View>

              {/* Botões */}
              <View className="flex-row gap-2.5">
                <Pressable
                  onPress={onClose}
                  disabled={loading}
                  className="flex-1 h-12 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: colors.containerLight }}
                >
                  <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>Cancelar</Text>
                </Pressable>
                <Pressable
                  onPress={onConfirm}
                  disabled={loading}
                  className="flex-1 h-12 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: destructive ? colors.error : colors.primary, opacity: loading ? 0.7 : 1 }}
                >
                  {loading
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text className="text-sm font-semibold text-white">{confirmLabel}</Text>
                  }
                </Pressable>
              </View>

            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ─── ActionSheet ──────────────────────────────────────────────────────────────

export interface SheetAction {
  icon?: string;
  label: string;
  destructive?: boolean;
  onPress: () => void;
}

interface ActionSheetProps {
  visible: boolean;
  title?: string;
  actions: SheetAction[];
  onClose: () => void;
}

export function ActionSheet({ visible, title, actions, onClose }: ActionSheetProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
          <TouchableWithoutFeedback>
            <View
              className="rounded-t-3xl pt-3 px-5 pb-10"
              style={{ backgroundColor: colors.background }}
            >
              {/* Handle */}
              <View className="w-9 h-1 rounded-full self-center mb-4" style={{ backgroundColor: colors.containerLight }} />

              {/* Título */}
              {!!title && (
                <Text
                  className="text-xs font-semibold uppercase tracking-widest mb-2 px-1"
                  style={{ color: colors.textMuted }}
                >
                  {title}
                </Text>
              )}

              {/* Ações */}
              {actions.map((action, i) => (
                <Pressable
                  key={i}
                  onPress={() => { onClose(); setTimeout(action.onPress, 150); }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                >
                  <View
                    className="flex-row items-center gap-3 py-3.5 border-b"
                    style={{ borderColor: colors.borderDark }}
                  >
                    {!!action.icon && (
                      <View
                        className="w-10 h-10 rounded-xl items-center justify-center"
                        style={{ backgroundColor: action.destructive ? `${colors.error}18` : `${colors.textTertiary}14` }}
                      >
                        <Ionicons
                          name={action.icon as any}
                          size={20}
                          color={action.destructive ? colors.error : colors.textSecondary}
                        />
                      </View>
                    )}
                    <Text
                      className="text-base font-medium"
                      style={{ color: action.destructive ? colors.error : colors.textPrimary }}
                    >
                      {action.label}
                    </Text>
                  </View>
                </Pressable>
              ))}

              {/* Cancelar */}
              <Pressable
                onPress={onClose}
                className="mt-3 rounded-2xl py-3.5 items-center"
                style={{ backgroundColor: colors.container }}
              >
                <Text className="text-sm font-semibold" style={{ color: colors.textTertiary }}>Cancelar</Text>
              </Pressable>

            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ─── InputModal ───────────────────────────────────────────────────────────────

interface InputModalProps {
  visible: boolean;
  title: string;
  initialValue?: string;
  placeholder?: string;
  maxLength?: number;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: (text: string) => void;
  onClose: () => void;
}

export function InputModal({
  visible, title, initialValue = '', placeholder = '', maxLength = 500,
  confirmLabel = 'Salvar', loading = false, onConfirm, onClose,
}: InputModalProps) {
  const { colors } = useTheme();
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setValue(initialValue);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [visible, initialValue]);

  const canSubmit = value.trim().length > 0 && value.trim() !== initialValue.trim();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
            <TouchableWithoutFeedback>
              <View
                className="rounded-t-3xl pt-3 px-5 pb-10"
                style={{ backgroundColor: colors.background }}
              >
                {/* Handle */}
                <View className="w-9 h-1 rounded-full self-center mb-4" style={{ backgroundColor: colors.containerLight }} />

                {/* Cabeçalho */}
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-bold" style={{ color: colors.textPrimary }}>{title}</Text>
                  <Pressable onPress={onClose} hitSlop={10}>
                    <Ionicons name="close" size={22} color={colors.textSecondary} />
                  </Pressable>
                </View>

                {/* Campo de texto */}
                <View
                  className="rounded-2xl border px-4 py-3"
                  style={{ backgroundColor: colors.container, borderColor: colors.border, minHeight: 100, maxHeight: 200 }}
                >
                  <TextInput
                    ref={inputRef}
                    className="text-sm leading-6 p-0"
                    style={{ color: colors.textPrimary }}
                    value={value}
                    onChangeText={setValue}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textMuted}
                    multiline
                    maxLength={maxLength}
                    autoCapitalize="sentences"
                  />
                </View>

                {/* Contador */}
                <Text className="text-xs text-right mt-1.5 mb-4" style={{ color: colors.textMuted }}>
                  {value.length}/{maxLength}
                </Text>

                {/* Botões */}
                <View className="flex-row gap-2.5">
                  <Pressable
                    onPress={onClose}
                    disabled={loading}
                    className="flex-1 h-12 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: colors.containerLight }}
                  >
                    <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>Cancelar</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => onConfirm(value.trim())}
                    disabled={!canSubmit || loading}
                    className="flex-1 h-12 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: colors.primary, opacity: (!canSubmit || loading) ? 0.45 : 1 }}
                  >
                    {loading
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <Text className="text-sm font-semibold text-white">{confirmLabel}</Text>
                    }
                  </Pressable>
                </View>

              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}
