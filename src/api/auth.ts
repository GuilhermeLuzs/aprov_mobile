import { apiRequest } from './client';
import { clearToken, setToken } from './token';

export type ApiClient = {
  id: number;
  name: string;
  username: string;
  email: string;
  birthDate: string;
  preferredCategories: string[] | null;
  discoverySource: string | null;
  followedCompanyIds: string[] | null;
  pointsBalance: number;
  xp: number;
  level: number;
  createdAt: string;
};

type SessionResponse = { token: string; client: ApiClient };

export type RegisterPayload = {
  name: string;
  username: string;
  email: string;
  birthDate: string;
  cpf: string;
  password: string;
};

export async function apiRegister(payload: RegisterPayload): Promise<ApiClient> {
  const { token, client } = await apiRequest<SessionResponse>('register', { method: 'POST', body: payload });
  await setToken(token);
  return client;
}

export async function apiLogin(email: string, password: string): Promise<ApiClient> {
  const { token, client } = await apiRequest<SessionResponse>('login', {
    method: 'POST',
    body: { email, password },
  });
  await setToken(token);
  return client;
}

export async function apiLogout(): Promise<void> {
  try {
    await apiRequest<void>('logout', { method: 'POST', auth: true });
  } finally {
    await clearToken();
  }
}

export async function apiMe(): Promise<ApiClient> {
  return apiRequest<ApiClient>('me', { auth: true });
}
