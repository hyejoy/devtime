import { API_BASE_URL } from '@/config/env';
export async function fetcher<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    throw new Error('API Error');
  }

  return res.json() as Promise<T>;
}
