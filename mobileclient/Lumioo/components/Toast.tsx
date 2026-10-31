import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ToastType = 'success' | 'error';

/**
 * Aviso temporário no rodapé (equivalente ao Toast da web).
 * Uso: const { toast, show } = useToast();  ...  show('Salvo!') ... {toast}
 */
export function useToast() {
  const [state, setState] = useState<{ id: number; message: string; type: ToastType } | null>(null);
  const show = useCallback((message: string, type: ToastType = 'success') => {
    setState({ id: Date.now(), message, type });
  }, []);
  const dismiss = useCallback(() => setState(null), []);
  const toast = state ? <ToastView key={state.id} {...state} onDismiss={dismiss} /> : null;
  return { toast, show };
}

function ToastView({ message, type, onDismiss }: {
  message: string; type: ToastType; onDismiss: () => void;
}) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    const t = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(onDismiss);
    }, 3000);
    return () => clearTimeout(t);
  }, [opacity, onDismiss]);

  // Fica acima da barra de navegação flutuante
  const bottom = Math.max(insets.bottom, 8) + 16 + 72 + 12;

  return (
    <Animated.View
      pointerEvents="none"
      style={[s.wrap, { bottom, opacity, backgroundColor: type === 'success' ? '#16a34a' : '#dc2626' }]}
    >
      <Ionicons name={type === 'success' ? 'checkmark-circle' : 'close-circle'} size={22} color="#fff" />
      <Text style={s.text}>{message}</Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute', left: 16, right: 16, zIndex: 100,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 8,
  },
  text: { flex: 1, color: '#fff', fontSize: 14, fontWeight: '600' },
});
