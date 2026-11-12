import { useSyncExternalStore } from 'react';
import {
  ApiError,
  NetworkError,
  apiLogin,
  apiLogout,
  apiMe,
  apiRegister,
  clearToken,
  getToken,
  type ApiCustomer,
} from '../api';
import { queryClient } from '../queries/client';
import { ANONYMOUS_AUTHOR_ID, anonymousAuthor } from '../queries/mappers';
import type { User } from '../types';
import { normalizeUsername, onlyDigits } from '../utils/validation';
import { getDeactivatedIds, markDeactivated } from './deactivated';
import { EMPTY_ACCESSORIES, resetAccessories } from './accessories';
import { resetRedemptions } from './coupons';

type StoredAccount = { email: string; cpf: string; user: User };

export type SignUpData = {
  name: string;
  username: string;
  email: string;
  birthDate: string;
  cpf: string;
  password: string;
};

export type SignUpResult = 'ok' | 'email-in-use' | 'cpf-in-use' | 'username-in-use' | 'error';

export type SignInResult = 'ok' | 'invalid' | 'deactivated' | 'network-error';

export type ProfileChanges = {
  name: string;
  username: string;
  bio: string;
  avatarUri: string;
};

export type ProfileUpdateResult = 'ok' | 'username-in-use';

function toIsoDate(brDate: string): string {
  const [day, month, year] = brDate.split('/');
  return `${year}-${month}-${day}`;
}

const accounts: StoredAccount[] = [];

let session: User | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const handleOf = (username: string) => `@${normalizeUsername(username)}`;

export function isEmailInUse(email: string): boolean {
  return accounts.some((a) => a.email === normalizeEmail(email));
}

export function isCpfInUse(cpf: string): boolean {
  return accounts.some((a) => a.cpf === onlyDigits(cpf));
}

export function isUsernameInUse(username: string, exceptUserId?: string): boolean {
  const handle = handleOf(username);
  return accounts.some((a) => a.user.handle === handle && a.user.id !== exceptUserId);
}

function userFromApiCustomer(customer: ApiCustomer): User {
  const id = String(customer.id);
  const existing = accounts.find((a) => a.user.id === id)?.user;
  return {
    ...anonymousAuthor,
    id,
    name: customer.name,
    handle: handleOf(customer.username),
    avatarUri: existing?.avatarUri ?? customer.avatarUrl ?? '',
    bio: existing?.bio ?? customer.bio,
    level: customer.level,
    xp: customer.xp,
    joinedAt: customer.createdAt,
  };
}

function rememberAccount(email: string, cpf: string, user: User): void {
  const account: StoredAccount = { email: normalizeEmail(email), cpf: onlyDigits(cpf), user };
  const index = accounts.findIndex((a) => a.user.id === user.id);
  if (index >= 0) accounts[index] = account;
  else accounts.push(account);
}

function startSession(user: User): void {
  queryClient.clear();
  resetAccessories(EMPTY_ACCESSORIES);
  resetRedemptions([]);
  session = user;
  emit();
}

export async function restoreSession(): Promise<boolean> {
  if (!(await getToken())) return false;
  let customer: ApiCustomer;
  try {
    customer = await apiMe();
  } catch (error) {
    if (!(error instanceof NetworkError)) await clearToken();
    return false;
  }
  const user = userFromApiCustomer(customer);
  rememberAccount(customer.email, '', user);
  startSession(user);
  return true;
}

export async function signIn(email: string, password: string): Promise<SignInResult> {
  let customer: ApiCustomer;
  try {
    customer = await apiLogin(email, password);
  } catch (error) {
    if (error instanceof NetworkError) return 'network-error';
    return 'invalid';
  }
  const user = userFromApiCustomer(customer);
  if (getDeactivatedIds().includes(user.id)) return 'deactivated';
  rememberAccount(email, '', user);
  startSession(user);
  return 'ok';
}

export async function signUp(data: SignUpData): Promise<SignUpResult> {
  let customer: ApiCustomer;
  try {
    customer = await apiRegister({
      name: data.name.trim(),
      username: normalizeUsername(data.username),
      email: data.email,
      birthDate: toIsoDate(data.birthDate),
      cpf: onlyDigits(data.cpf),
      password: data.password,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.errors.email) return 'email-in-use';
      if (error.errors.cpf) return 'cpf-in-use';
      if (error.errors.username) return 'username-in-use';
    }
    return 'error';
  }
  const user = userFromApiCustomer(customer);
  rememberAccount(data.email, data.cpf, user);
  startSession(user);
  return 'ok';
}

export function updateProfile(changes: ProfileChanges): ProfileUpdateResult {
  if (!session) return 'ok';
  if (isUsernameInUse(changes.username, session.id)) return 'username-in-use';
  session = {
    ...session,
    name: changes.name.trim(),
    handle: handleOf(changes.username),
    bio: changes.bio.trim(),
    avatarUri: changes.avatarUri,
  };
  const account = accounts.find((a) => a.user.id === session?.id);
  if (account) account.user = session;
  emit();
  return 'ok';
}

export function signOut(): void {
  apiLogout().catch(() => undefined);
  queryClient.clear();
  resetAccessories(EMPTY_ACCESSORIES);
  resetRedemptions([]);
  session = null;
  emit();
}

export function deactivateAccount(): void {
  if (!session) return;
  markDeactivated(session.id);
  signOut();
}

export function isAnonymousAuthor(id: string): boolean {
  return id === ANONYMOUS_AUTHOR_ID;
}

function getSession(): User | null {
  return session;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSession(): User | null {
  return useSyncExternalStore(subscribe, getSession, getSession);
}

export function useCurrentUser(): User {
  return useSession() ?? anonymousAuthor;
}
