import api from '@/lib/api';

// Espelha frontendclient/src/api/profile.ts e follow.ts

export interface ProfilePost {
  id: string;
  username: string;
  authorId: string;
  userImage: string | null;
  image: string | null;
  caption: string;
  likes: number;
  comments: number;
  timePosted: string;
  isLiked: boolean;
  isSaved: boolean;
}

export interface ProfileData {
  // `id` só vem em GET /profile/:username; no perfil próprio use user.id do AuthContext
  id?: string;
  fullName: string;
  username: string;
  email?: string;
  birthDate?: string; // só no perfil próprio
  institution: string;
  academicLevel: string;
  joinDate: string;
  bio: string | null;
  avatar: string | null;
  coverPhoto: string | null;
  posts: number;
  followers: number;
  following: number;
  isFollowing?: boolean;
  userPosts: ProfilePost[];
  savedPosts: ProfilePost[];
}

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

export const ACADEMIC_LEVEL_LABEL: Record<string, string> = {
  UNDERGRADUATE: 'Graduação',
  MASTER: 'Mestrado',
  PHD: 'Doutorado',
  PROFESSOR: 'Professor / Pesquisador',
};

export const fetchOwnProfile = async () => (await api.get<ProfileData>('/profile')).data;

export const fetchProfileByUsername = async (username: string) =>
  (await api.get<ProfileData>(`/profile/${encodeURIComponent(username)}`)).data;

export const updateProfile = async (payload: {
  fullName?: string;
  username?: string;
  bio?: string;
  avatar?: string | null; // null remove a imagem
  coverPhoto?: string | null;
}) => (await api.put('/profile', payload)).data;

export const changePassword = (payload: { currentPassword: string; newPassword: string }) =>
  api.post('/profile/password', payload);

export const followUser = (userId: string) => api.post(`/follow/${userId}`);
export const unfollowUser = (userId: string) => api.delete(`/follow/${userId}`);
export const blockUser = (userId: string) => api.post(`/block/${userId}`);
export const unblockUser = (userId: string) => api.delete(`/block/${userId}`);

export const fetchFollowers = async (userId: string, cursor?: string) =>
  (await api.get<FollowListPage>(`/users/${userId}/followers`, { params: cursor ? { cursor } : {} })).data;

export const fetchFollowing = async (userId: string, cursor?: string) =>
  (await api.get<FollowListPage>(`/users/${userId}/following`, { params: cursor ? { cursor } : {} })).data;

export const fetchBlocked = async (cursor?: string) =>
  (await api.get<FollowListPage>('/blocked', { params: cursor ? { cursor } : {} })).data;
