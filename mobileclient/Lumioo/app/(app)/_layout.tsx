import { Stack } from 'expo-router';
import { View } from 'react-native';

import NavFloatBar from '@/components/NavFloatBar';
import { useTheme } from '@/contexts/ThemeContext';

export default function AppLayout() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack screenOptions={{ headerShown: false }} />
      <NavFloatBar />
    </View>
  );
}
