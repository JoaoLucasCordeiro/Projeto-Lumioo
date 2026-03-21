import { apiFetch } from './client';
import type { Post } from '@/types/feed';
import type { PostDetailsData } from '@/types/post';

export interface FeedPage {
  posts: Post[];
  nextCursor: string | null;
}

export interface PostsPage {
  posts: Post[];
  nextCursor: string | null;
}

export function fetchFeedPage({ pageParam }: { pageParam?: string }): Promise<FeedPage> {
  const path = pageParam ? `/feed?cursor=${pageParam}` : '/feed';
  return apiFetch<FeedPage>(path);
}

export function fetchPostsPage({
  pageParam,
  search,
}: {
  pageParam?: string;
  search: string;
}): Promise<PostsPage> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (pageParam) params.set('cursor', pageParam);
  const query = params.toString();
  return apiFetch<PostsPage>(`/posts${query ? `?${query}` : ''}`);
}

export function fetchPostById(id: string): Promise<PostDetailsData> {
  return apiFetch<PostDetailsData>(`/posts/${id}`);
}

export function likePost(id: string): Promise<void> {
  return apiFetch<void>(`/posts/${id}/like`, { method: 'POST' });
}

export function savePost(id: string): Promise<void> {
  return apiFetch<void>(`/posts/${id}/save`, { method: 'POST' });
}

export function createPost(payload: {
  caption: string;
  image: string;
  location?: string | null;
  hashtags?: string[];
}): Promise<Post> {
  return apiFetch<Post>('/posts', { method: 'POST', body: JSON.stringify(payload) });
}

export function updatePost(
  id: string,
  payload: { caption: string; image: string | null; location: string; hashtags: string[] }
): Promise<Post> {
  return apiFetch<Post>(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function deletePost(id: string): Promise<void> {
  return apiFetch<void>(`/posts/${id}`, { method: 'DELETE' });
}

export function createComment(postId: string, text: string): Promise<void> {
  return apiFetch<void>(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export function updateComment(commentId: string, text: string): Promise<void> {
  return apiFetch<void>(`/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({ text }),
  });
}

export function deleteComment(commentId: string): Promise<void> {
  return apiFetch<void>(`/comments/${commentId}`, { method: 'DELETE' });
}

export function likeComment(commentId: string): Promise<void> {
  return apiFetch<void>(`/comments/${commentId}/like`, { method: 'POST' });
}
