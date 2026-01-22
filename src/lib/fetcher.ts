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
    let message = 'An unknown API error occurred';

    try {
      const errorData = await res.json();
      message = errorData.message ?? message;
    } catch {}

    throw new Error(message);
  }

  return res.json() as Promise<T>;
}
