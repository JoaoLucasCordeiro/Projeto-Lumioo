import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export type ProjectStatus = 'IN_PROGRESS' | 'COMPLETED' | 'OPEN_FOR_APPLICATIONS';

export interface ApiProject {
  id: string;
  title: string;
  description: string;
  category: string;
  year: string;
  image: string | null;
  members: number;
  institution: string; // = author fullName (API quirk documented)
  status: ProjectStatus;
}

export interface ApiProjectDetail {
  id: string;
  title: string;
  description: string;
  detailedDescription: string;
  category: string;
  year: string;
  image: string | null;
  members: number;
  author: string;
  authorUsername: string;
  institution: string;
  status: ProjectStatus;
  team: { name: string; role: string; photo: string | null }[];
  publications: any[];
  ownerId: string;
}

export const CATEGORY_CONFIG: Record<string, { color: string; icon: string }> = {
  'Computação':  { color: '#1e3a8a', icon: 'code-slash-outline' },
  'Medicina':    { color: '#7f1d1d', icon: 'medical-outline' },
  'Design':      { color: '#4c1d95', icon: 'color-palette-outline' },
  'Física':      { color: '#1e3a5f', icon: 'planet-outline' },
  'Biologia':    { color: '#14532d', icon: 'leaf-outline' },
  'Engenharia':  { color: '#713f12', icon: 'construct-outline' },
};

export const PROJECT_ACCENT: Record<string, string> = {
  '#1e3a8a': '#93c5fd',
  '#7f1d1d': '#fca5a5',
  '#4c1d95': '#c4b5fd',
  '#713f12': '#fcd34d',
  '#14532d': '#6ee7b7',
  '#1e3a5f': '#7dd3fc',
};

export function getCategoryConfig(category: string) {
  return CATEGORY_CONFIG[category] ?? { color: '#1e3a8a', icon: 'folder-outline' };
}

export function useProjects(category: string) {
  return useQuery({
    queryKey: ['projects', category],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (category !== 'all') params.category = category;
      const { data } = await api.get('/projects', { params });
      return data.projects as ApiProject[];
    },
  });
}

export function useProjectDetail(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${id}`);
      return data as ApiProjectDetail;
    },
    enabled: !!id,
  });
}
