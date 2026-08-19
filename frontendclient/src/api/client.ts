import { getToken } from '@/services/auth.service';

const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  const hasBody = contentType?.includes('application/json') && response.status !== 204;
  const data = hasBody ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(data?.error || `Request failed with status ${response.status}`, response.status, data);
  }

  return data as T;
}
