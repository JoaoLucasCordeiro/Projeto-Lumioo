import { apiFetch } from './client';

export interface AcademicWork {
  id: string;
  title: string;
  author: string;
  type: string;
  area: string;
  year: string;
  abstract: string;
  keywords: string[];
  downloads: number;
  fileUrl: string;
  image: string | null;
}

export interface WorksPage {
  works: AcademicWork[];
  nextCursor: string | null;
}

export interface WorkDetailsData {
  id: string;
  title: string;
  author: string;
  authorUsername: string;
  authorId?: string;
  type: string;
  area: string;
  year: string;
  abstract: string;
  keywords: string[];
  downloads: number;
  image: string | null;
  detailedDescription: string;
  advisor: string;
  institution: string;
  department: string | null;
  references: string[];
}

export function fetchWorksPage({
  pageParam,
  search,
  workType,
  year,
  area,
}: {
  pageParam?: string;
  search: string;
  workType: string;
  year: string;
  area: string;
}): Promise<WorksPage> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (workType) params.set('workType', workType);
  if (year) params.set('year', year);
  if (area) params.set('area', area);
  if (pageParam) params.set('cursor', pageParam);
  const query = params.toString();
  return apiFetch<WorksPage>(`/works${query ? `?${query}` : ''}`);
}

export function fetchWorkById(id: string): Promise<WorkDetailsData> {
  return apiFetch<WorkDetailsData>(`/works/${id}`);
}

export function downloadWork(id: string): Promise<{ pdfFile: string; title: string }> {
  return apiFetch<{ pdfFile: string; title: string }>(`/works/${id}/download`);
}

export function createWork(payload: unknown): Promise<AcademicWork> {
  return apiFetch<AcademicWork>('/works', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateWork(id: string, payload: unknown): Promise<AcademicWork> {
  return apiFetch<AcademicWork>(`/works/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function deleteWork(id: string): Promise<void> {
  return apiFetch<void>(`/works/${id}`, { method: 'DELETE' });
}
