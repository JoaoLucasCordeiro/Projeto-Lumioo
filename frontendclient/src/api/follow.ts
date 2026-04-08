import { apiFetch } from './client';

export interface FollowUser {
  id: string;
  username: string;
  fullName: string;
  avatar: string | null;
  institution: string;
  academicLevel: string;
}

export interface FollowListPage {
  users: FollowUser[];
  nextCursor: string | null;
}

export const followUser = (userId: string): Promise<void> =>
  apiFetch<void>(`/follow/${userId}`, { method: 'POST' });

export const unfollowUser = (userId: string): Promise<void> =>
  apiFetch<void>(`/follow/${userId}`, { method: 'DELETE' });

export const blockUser = (userId: string): Promise<void> =>
  apiFetch<void>(`/block/${userId}`, { method: 'POST' });

export const unblockUser = (userId: string): Promise<void> =>
  apiFetch<void>(`/block/${userId}`, { method: 'DELETE' });

export const getFollowers = (userId: string, cursor?: string): Promise<FollowListPage> =>
  apiFetch<FollowListPage>(`/users/${userId}/followers${cursor ? `?cursor=${cursor}` : ''}`);

export const getFollowing = (userId: string, cursor?: string): Promise<FollowListPage> =>
  apiFetch<FollowListPage>(`/users/${userId}/following${cursor ? `?cursor=${cursor}` : ''}`);
