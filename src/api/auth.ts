import { apiRequest } from './client';
import { clearToken, setToken } from './token';

export type ApiCustomer = {
  id: number;
  name: string;
  username: string;
  email: string;
  birthDate: string;
  preferredCategories: string[] | null;
  discoverySource: string | null;
  followedCompanyIds: number[];
  pointsBalance: number;
  xp: number;
  level: number;
  createdAt: string;
};

type SessionResponse = { token: string; customer: ApiCustomer };

export type RegisterPayload = {
  name: string;
  username: string;
  email: string;
  birthDate: string;
  cpf: string;
  password: string;
};

export async function apiRegister(payload: RegisterPayload): Promise<ApiCustomer> {
  const { token, customer } = await apiRequest<SessionResponse>('register', { method: 'POST', body: payload });
  await setToken(token);
  return customer;
}

export async function apiLogin(email: string, password: string): Promise<ApiCustomer> {
  const { token, customer } = await apiRequest<SessionResponse>('login', {
    method: 'POST',
    body: { email, password },
  });
  await setToken(token);
  return customer;
}

export async function apiLogout(): Promise<void> {
  try {
    await apiRequest<void>('logout', { method: 'POST', auth: true });
  } finally {
    await clearToken();
  }
}

export async function apiMe(): Promise<ApiCustomer> {
  return apiRequest<ApiCustomer>('me', { auth: true });
}
