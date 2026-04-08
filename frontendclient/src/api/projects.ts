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
}

export function fetchProjectsPage({
  pageParam,
  search,
  category,
  year,
}: {
  pageParam?: string;
  search: string;
  category: string;
  year: string;
}): Promise<ProjectsPage> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category && category !== 'all') params.set('category', category);
  if (year && year !== 'all') params.set('year', year);
  if (pageParam) params.set('cursor', pageParam);
  const query = params.toString();
  return apiFetch<ProjectsPage>(`/projects${query ? `?${query}` : ''}`);
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
