import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { ThemeProvider as LumiooThemeProvider } from '@/contexts/ThemeContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <LumiooThemeProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="test" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
          <Stack.Screen
            name="auth/login"
            options={{ headerShown: false, presentation: 'card' }}
          />
          <Stack.Screen
            name="auth/register"
            options={{ headerShown: false, presentation: 'card' }}
          />
          <Stack.Screen
            name="auth/forgot-password"
            options={{ headerShown: false, presentation: 'card' }}
          />
          <Stack.Screen
            name="auth/recovery-code"
            options={{ headerShown: false, presentation: 'card' }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </LumiooThemeProvider>
  );
}
