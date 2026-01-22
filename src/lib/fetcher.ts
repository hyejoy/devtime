import { API_BASE_URL } from '@/config/env';

export async function fetcher<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ message: 'An unknown API error occurred' }));
    throw new Error(errorData.message || `API Error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}
