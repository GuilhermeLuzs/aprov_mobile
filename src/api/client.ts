import { API_BASE_URL } from './config';
import { getToken } from './token';

export class ApiError extends Error {
  errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]> = {}) {
    super(message);
    this.errors = errors;
  }
}

export class NetworkError extends ApiError {}

type ApiEnvelope<T> = { success: boolean; message: string; data?: T; errors?: Record<string, string[]> };

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false } = options;
  const isFormData = body instanceof FormData;
  const headers: Record<string, string> = { Accept: 'application/json' };

  if (body !== undefined && !isFormData) headers['Content-Type'] = 'application/json';

  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/${path}`, {
      method,
      headers,
      body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new NetworkError('Não deu para conectar com a APROV. Confira a internet e tente de novo.');
  }

  if (response.status === 204) return undefined as T;

  const envelope = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !envelope || !envelope.success) {
    throw new ApiError(envelope?.message ?? 'Algo deu errado. Tente de novo.', envelope?.errors ?? {});
  }

  return envelope.data as T;
}
