import React from 'react';
import { useLocalSearchParams } from 'expo-router';

import ProfileView from '@/components/ProfileView';

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  return <ProfileView key={username} username={username} showBack />;
}
