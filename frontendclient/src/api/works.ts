import { apiFetch } from './client';

export const WORK_AREA_OPTIONS = [
  { value: 'EXACT_EARTH_SCIENCES', label: 'Ciências Exatas e da Terra' },
  { value: 'BIOLOGICAL_SCIENCES', label: 'Ciências Biológicas' },
  { value: 'ENGINEERING', label: 'Engenharias' },
  { value: 'HEALTH_SCIENCES', label: 'Ciências da Saúde' },
  { value: 'AGRICULTURAL_SCIENCES', label: 'Ciências Agrárias' },
  { value: 'APPLIED_SOCIAL_SCIENCES', label: 'Ciências Sociais Aplicadas' },
  { value: 'HUMANITIES', label: 'Ciências Humanas' },
  { value: 'LINGUISTICS_LITERATURE_ARTS', label: 'Linguística, Letras e Artes' },
] as const;

export const WORK_AREA_LABELS: Record<string, string> = Object.fromEntries(
  WORK_AREA_OPTIONS.map((option) => [option.value, option.label])
);

export const BRAZILIAN_UF_CODES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

export const COUNTRY_OPTIONS = [
  'Brasil', 'Portugal', 'Angola', 'Moçambique', 'Cabo Verde', 'Guiné-Bissau',
  'São Tomé e Príncipe', 'Timor-Leste', 'Estados Unidos', 'Canadá', 'México',
  'Argentina', 'Chile', 'Uruguai', 'Paraguai', 'Bolívia', 'Colômbia', 'Peru',
  'Espanha', 'França', 'Alemanha', 'Itália', 'Reino Unido', 'Países Baixos',
  'China', 'Japão', 'Coreia do Sul', 'Índia', 'Austrália',
] as const;

export type WorkVisibility = 'PUBLIC' | 'PRIVATE';
export type WorkAccessStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'REVOKED';

export interface AcademicWork {
  id: string;
  title: string;
  author: string;
  type: string;
  visibility: WorkVisibility;
  area: string | null;
  year: string;
  abstract: string;
  keywords: string[];
  downloads: number;
  fileUrl: string;
  image: string | null;
  campus: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
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
  visibility: WorkVisibility;
  area: string | null;
  year: string;
  abstract: string;
  keywords: string[];
  downloads: number;
  image: string | null;
  detailedDescription: string;
  advisor: string;
  institution: string;
  campus: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  department: string | null;
  references: string[];
}

export interface WorkAccessRequest {
  id: string;
  status: WorkAccessStatus;
  createdAt: string;
  respondedAt: string | null;
  workId: string;
  requesterId: string;
  requester?: {
    id: string;
    username: string;
    fullName: string;
    avatar: string | null;
    institution: string;
    academicLevel: string;
  };
  work?: {
    id: string;
    title: string;
    workType: string;
    coverImage: string | null;
  };
}

export function fetchWorksPage({
  pageParam,
  search,
  workType,
  year,
  area,
  state,
  city,
  country,
}: {
  pageParam?: string;
  search?: string;
  workType?: string;
  year?: string;
  area?: string;
  state?: string;
  city?: string;
  country?: string;
}): Promise<WorksPage> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (workType) params.set('workType', workType);
  if (year) params.set('year', year);
  if (area) params.set('area', area);
  if (state) params.set('state', state);
  if (city) params.set('city', city);
  if (country) params.set('country', country);
  if (pageParam) params.set('cursor', pageParam);
  const query = params.toString();
  return apiFetch<WorksPage>(`/works${query ? `?${query}` : ''}`);
}

export interface LocationStatItem {
  value: string;
  count: number;
}

export interface WorkStatsResponse {
  dimension: string;
  items: LocationStatItem[];
}

export function fetchWorkStats({
  dimension,
  state,
  country,
  workType,
  area,
  limit,
}: {
  dimension: 'state' | 'country' | 'city' | 'campus' | 'institution' | 'area';
  state?: string;
  country?: string;
  workType?: string;
  area?: string;
  limit?: number;
}): Promise<WorkStatsResponse> {
  const params = new URLSearchParams({ dimension });
  if (state) params.set('state', state);
  if (country) params.set('country', country);
  if (workType) params.set('workType', workType);
  if (area) params.set('area', area);
  if (limit) params.set('limit', String(limit));
  return apiFetch<WorkStatsResponse>(`/works/stats?${params.toString()}`);
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

export function requestWorkAccess(workId: string): Promise<WorkAccessRequest> {
  return apiFetch<WorkAccessRequest>(`/works/${workId}/access-requests`, { method: 'POST' });
}

export function getWorkAccessRequests(workId: string): Promise<WorkAccessRequest[]> {
  return apiFetch<WorkAccessRequest[]>(`/works/${workId}/access-requests`);
}

export function respondToWorkAccessRequest(
  workId: string,
  requestId: string,
  status: Extract<WorkAccessStatus, 'APPROVED' | 'DENIED' | 'REVOKED'>
): Promise<WorkAccessRequest> {
  return apiFetch<WorkAccessRequest>(`/works/${workId}/access-requests/${requestId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function getMyWorkAccessRequests(): Promise<WorkAccessRequest[]> {
  return apiFetch<WorkAccessRequest[]>('/works/access-requests/mine');
}
