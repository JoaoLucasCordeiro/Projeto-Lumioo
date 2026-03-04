import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

export function Card({ children, className = '', style = {} }: CardProps) {
  const { colors } = useTheme();

  return (
    <View
      className={`rounded-2xl p-5 ${className}`}
      style={[
        {
          backgroundColor: colors.container,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
