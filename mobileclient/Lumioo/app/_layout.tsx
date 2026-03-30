import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as LumiooThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <LumiooThemeProvider>
        <AuthProvider>
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
        </AuthProvider>
      </LumiooThemeProvider>
    </QueryClientProvider>
  );
}
