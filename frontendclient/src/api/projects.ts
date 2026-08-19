import { apiFetch } from './client';

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  year: string;
  image: string | null;
  members: number;
  institution: string;
  status: string;
  ownerId: string;
  campus: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
}

export interface ProjectsPage {
  projects: Project[];
  nextCursor: string | null;
}

export interface ProjectDetailsData {
  id: string;
  title: string;
  description: string;
  category: string;
  year: string;
  image: string | null;
  members: number;
  author: string;
  authorUsername: string;
  institution: string;
  status: string;
  detailedDescription: string;
  team: Array<{ name: string; role: string; userId?: string; username?: string; avatar?: string | null }>;
  publications: Array<{ title: string; conference?: string; journal?: string }>;
  ownerId: string;
  campus: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
}

export function fetchProjectsPage({
  pageParam,
  search,
  category,
  year,
  state,
  city,
  country,
}: {
  pageParam?: string;
  search?: string;
  category?: string;
  year?: string;
  state?: string;
  city?: string;
  country?: string;
}): Promise<ProjectsPage> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category && category !== 'all') params.set('category', category);
  if (year && year !== 'all') params.set('year', year);
  if (state) params.set('state', state);
  if (city) params.set('city', city);
  if (country) params.set('country', country);
  if (pageParam) params.set('cursor', pageParam);
  const query = params.toString();
  return apiFetch<ProjectsPage>(`/projects${query ? `?${query}` : ''}`);
}

export interface LocationStatItem {
  value: string;
  count: number;
}

export interface ProjectStatsResponse {
  dimension: string;
  items: LocationStatItem[];
}

export function fetchProjectStats({
  dimension,
  state,
  country,
  category,
  limit,
}: {
  dimension: 'state' | 'country' | 'city' | 'campus' | 'category';
  state?: string;
  country?: string;
  category?: string;
  limit?: number;
}): Promise<ProjectStatsResponse> {
  const params = new URLSearchParams({ dimension });
  if (state) params.set('state', state);
  if (country) params.set('country', country);
  if (category) params.set('category', category);
  if (limit) params.set('limit', String(limit));
  return apiFetch<ProjectStatsResponse>(`/projects/stats?${params.toString()}`);
}

export function fetchProjectById(id: string): Promise<ProjectDetailsData> {
  return apiFetch<ProjectDetailsData>(`/projects/${id}`);
}

export function createProject(payload: unknown): Promise<Project> {
  return apiFetch<Project>('/projects', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateProject(id: string, payload: unknown): Promise<Project> {
  return apiFetch<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function deleteProject(id: string): Promise<void> {
  return apiFetch<void>(`/projects/${id}`, { method: 'DELETE' });
}
