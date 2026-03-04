import React from 'react';
import { View, TextInput, Text, TouchableOpacity, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  onTogglePassword?: () => void;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  className?: string;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  icon,
  error,
  onTogglePassword,
  showPasswordToggle = false,
  showPassword = false,
  className = '',
  ...rest
}: InputProps) {
  const { colors } = useTheme();

  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text
          className="font-semibold mb-2 ml-1 text-sm"
          style={{ color: colors.textSecondary }}
        >
          {label}
        </Text>
      )}
      <View className="relative">
        {icon && (
          <View className="absolute inset-y-0 left-0 pl-3 items-center justify-center z-10">
            <Ionicons name={icon} size={20} color={colors.textMuted} />
          </View>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          className={`rounded-xl text-base ${icon ? 'pl-10' : 'pl-4'} ${showPasswordToggle ? 'pr-12' : 'pr-4'}`}
          style={[
            {
              backgroundColor: colors.container,
              color: colors.textPrimary,
              borderWidth: 1,
              borderColor: error ? colors.error : 'transparent',
              paddingVertical: 12,
            },
          ]}
          {...rest}
        />
        {showPasswordToggle && onTogglePassword && (
          <TouchableOpacity
            className="absolute inset-y-0 right-0 pr-3 items-center justify-center"
            onPress={onTogglePassword}
          >
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-red-400 text-sm mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
}
