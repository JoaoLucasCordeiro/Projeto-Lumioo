import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/contexts/ThemeContext';

const NAV_ITEMS = [
  { label: 'Home',      iconOn: 'home',       iconOff: 'home-outline',       path: '/feed' },
  { label: 'Projetos',  iconOn: 'folder',     iconOff: 'folder-outline',     path: '/projects' },
  { label: 'Trabalhos', iconOn: 'briefcase',  iconOff: 'briefcase-outline',  path: '/jobs' },
  { label: 'Config.',   iconOn: 'settings',   iconOff: 'settings-outline',   path: '/settings' },
  { label: 'Perfil',    iconOn: 'person',     iconOff: 'person-outline',     path: '/profile' },
] as const;

export default function NavFloatBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const bottomOffset = Math.max(insets.bottom, 8) + 16;

  return (
    <View style={[styles.wrapper, { bottom: bottomOffset }]} pointerEvents="box-none">
      <BlurView intensity={28} tint="dark" style={styles.blur}>
        <View style={styles.inner}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            return (
              <Pressable
                key={item.path}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push((`/(app)${item.path}`) as any);
                }}
                style={styles.navItem}
                hitSlop={4}
              >
                <Ionicons
                  name={(isActive ? item.iconOn : item.iconOff) as any}
                  size={23}
                  color={isActive ? colors.primary : colors.textMuted}
                  style={styles.navIcon}
                />
                <Text style={[styles.label, { color: isActive ? colors.primary : colors.textMuted }]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
  blur: {
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 22,
  },
  inner: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.87)',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navIcon: {
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
});
