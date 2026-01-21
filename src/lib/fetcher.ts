// src/lib/fetcher.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function fetcher<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  if (!BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');
  }

  const res = await fetch(`${BASE_URL}${path}`, {
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
