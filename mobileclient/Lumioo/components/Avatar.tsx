import React from 'react';
import { View, Text, Image } from 'react-native';

const COLORS = ['#ff3131', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899'];

function colorFromUsername(username: string): string {
  let h = 0;
  for (let i = 0; i < username.length; i++) h = username.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

function initialsFromUsername(username: string): string {
  const parts = username.replace('@', '').split('_');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return username.replace('@', '').substring(0, 2).toUpperCase();
}

interface AvatarProps {
  userImage: string | null;
  username: string;
  size?: number;
}

export default function Avatar({ userImage, username, size = 42 }: AvatarProps) {
  if (userImage) {
    return (
      <Image
        source={{ uri: userImage }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: colorFromUsername(username),
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.35 }}>
        {initialsFromUsername(username)}
      </Text>
    </View>
  );
}
