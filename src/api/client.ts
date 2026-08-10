// ─── Base HTTP Client ────────────────────────────────────────────────────────

import { BASE_URL } from './config';


interface FetchOptions extends RequestInit {
  language?: string;
}

export async function apiGet<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { language = 'ar', ...rest } = options;

  const token = typeof window !== 'undefined' ? localStorage.getItem('api_token') : null;

  const headers: HeadersInit = {
    Accept: 'application/json',
    'Accept-Language': language,
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...rest.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    ...rest,
    headers,
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status} on GET ${path}`);
  }

  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown, options: FetchOptions = {}): Promise<T> {
  const { language = 'ar', ...rest } = options;

  const token = typeof window !== 'undefined' ? localStorage.getItem('api_token') : null;

  const headers: HeadersInit = {
    Accept: 'application/json',
    'Accept-Language': language,
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...rest.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    body: JSON.stringify(body),
    ...rest,
    headers,
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status} on POST ${path}`);
  }

  return res.json() as Promise<T>;
}
