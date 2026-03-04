import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/contexts/ThemeContext';

export default function ProfileScreen() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <Ionicons name="person-outline" size={52} color={colors.textMuted} />
      <Text style={{ color: colors.textTertiary, marginTop: 14, fontSize: 16 }}>Perfil em breve</Text>
    </View>
  );
}
