import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  className = '',
}: ButtonProps) {
  const { colors } = useTheme();

  const getHeight = () => {
    switch (size) {
      case 'small':
        return 40;
      case 'large':
        return 56;
      default:
        return 48;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  if (variant === 'primary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        className={`rounded-2xl overflow-hidden ${disabled || loading ? 'opacity-50' : ''} ${className}`}
        style={{ height: getHeight() }}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-row items-center justify-center flex-1"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className={`text-white font-semibold ${getTextSize()}`}>
              {title}
            </Text>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  if (variant === 'outline') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        className={`rounded-2xl items-center justify-center ${disabled || loading ? 'opacity-50' : ''} ${className}`}
        style={[
          {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: colors.primary,
            height: getHeight(),
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text style={[{ color: colors.primary }]} className={`font-semibold ${getTextSize()}`}>
            {title}
          </Text>
        )}
      </Pressable>
    );
  }

  // Secondary
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`rounded-2xl items-center justify-center ${disabled || loading ? 'opacity-50' : ''} ${className}`}
      style={[{ backgroundColor: colors.containerLight, height: getHeight() }]}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className="text-white font-semibold text-base">
          {title}
        </Text>
      )}
    </Pressable>
  );
}
