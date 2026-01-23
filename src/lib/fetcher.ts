import { API_BASE_URL } from '@/config/env';

type FetcherOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

export async function fetcher<T>(
  path: string,
  options: FetcherOptions = {}
): Promise<T> {
  const { body, headers, ...rest } = options;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.json();
    throw errorBody;
  }

  return res.json() as Promise<T>;
}
