type ApiErrorPayload = {
  error?: string;
};

export async function adminApiFetch<T>(input: RequestInfo | URL, init?: RequestInit) {
  const headers = new Headers(init?.headers);

  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(input, {
    ...init,
    cache: 'no-store',
    credentials: 'same-origin',
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? ((await response.json()) as T & ApiErrorPayload)
    : null;

  if (!response.ok) {
    throw new Error(payload?.error || `Erro ${response.status}`);
  }

  return payload as T;
}
