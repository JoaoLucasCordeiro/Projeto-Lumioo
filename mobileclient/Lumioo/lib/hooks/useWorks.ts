import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export type WorkApiType = 'TCC' | 'ARTICLE' | 'THESIS' | 'DISSERTATION';

export const WORK_TYPE_LABEL: Record<WorkApiType, string> = {
  TCC: 'TCC',
  ARTICLE: 'Artigo',
  THESIS: 'Tese',
  DISSERTATION: 'Dissertação',
};

export const WORK_LABEL_TO_API: Record<string, WorkApiType> = {
  'TCC': 'TCC',
  'Artigo': 'ARTICLE',
  'Tese': 'THESIS',
  'Dissertação': 'DISSERTATION',
};

export const WORK_TYPE_CONFIG: Record<WorkApiType, { color: string; icon: string; coverColor: string }> = {
  TCC:          { color: '#3b82f6', icon: 'school-outline',        coverColor: '#1e3a8a' },
  ARTICLE:      { color: '#8b5cf6', icon: 'document-text-outline', coverColor: '#4c1d95' },
  THESIS:       { color: '#10b981', icon: 'library-outline',       coverColor: '#14532d' },
  DISSERTATION: { color: '#f59e0b', icon: 'bookmark-outline',      coverColor: '#713f12' },
};

export const WORKS_COVER_ACCENT: Record<string, string> = {
  '#1e3a8a': '#93c5fd',
  '#4c1d95': '#c4b5fd',
  '#14532d': '#6ee7b7',
  '#713f12': '#fcd34d',
};

export interface ApiWork {
  id: string;
  title: string;
  author: string;
  type: WorkApiType;
  area: string;
  year: string;
  abstract: string;
  keywords: string[];
  downloads: number;
  image: string | null;
}

export interface ApiWorkDetail {
  id: string;
  title: string;
  author: string;
  authorUsername: string;
  type: WorkApiType;
  area: string;
  year: string;
  abstract: string;
  detailedDescription: string;
  keywords: string[];
  downloads: number;
  fileUrl: string;
  image: string | null;
  advisor: string;
  institution: string;
  department: string | null;
  references: string[];
}

export function useWorks(workType: string, area: string) {
  return useQuery({
    queryKey: ['works', workType, area],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (workType !== 'all') params.workType = workType;
      if (area !== 'all') params.area = area;
      const { data } = await api.get('/works', { params });
      return data.works as ApiWork[];
    },
  });
}

export function useWorkDetail(id: string) {
  return useQuery({
    queryKey: ['work', id],
    queryFn: async () => {
      const { data } = await api.get(`/works/${id}`);
      return data as ApiWorkDetail;
    },
    enabled: !!id,
  });
}
