import { apiFetch } from './client';
import type { Post } from '@/types/feed';

export interface UserProfileData {
  id: string;
  fullName: string;
  username: string;
  email: string;
  institution: string;
  academicLevel: string;
  birthDate: string;
  joinDate: string;
  bio: string | null;
  avatar: string | null;
  coverPhoto: string | null;
  posts: number;
  followers: number;
  following: number;
  isFollowing: boolean;
  isBlocked: boolean;
  userPosts: Post[];
  savedPosts: Post[];
}

export function fetchOwnProfile(): Promise<UserProfileData> {
  return apiFetch<UserProfileData>('/profile');
}

export function fetchProfileByUsername(username: string): Promise<UserProfileData> {
  return apiFetch<UserProfileData>(`/profile/${username}`);
}

export function updateProfile(payload: Partial<UserProfileData>): Promise<UserProfileData> {
  return apiFetch<UserProfileData>('/profile', { method: 'PUT', body: JSON.stringify(payload) });
}

export function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  return apiFetch<void>('/profile/password', { method: 'POST', body: JSON.stringify(payload) });
}
