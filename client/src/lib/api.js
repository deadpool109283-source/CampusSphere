export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof body === 'string' ? body : body.message;
    throw new Error(message || `Request failed (${response.status})`);
  }

  return body;
}
